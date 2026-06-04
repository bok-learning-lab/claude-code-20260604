/**
 * Shared HTTP client and error handling for the Harvard Art Museums API.
 */

import axios, { AxiosError } from "axios";
import { API_BASE_URL, DAILY_RATE_LIMIT, REQUEST_TIMEOUT_MS } from "../constants.js";

const API_KEY_REQUEST_URL =
  "https://docs.google.com/forms/d/1Fe1H4nOhFkrLpaeBpLAnSrIMYvcAxnYWm0IU9a6IkFA/viewform";

/** Acceptable values for an API query-string parameter. */
export type QueryValue = string | number | boolean | undefined | null;

/**
 * Read and validate the API key from the environment.
 * @throws Error with an actionable message when HAM_API_KEY is unset.
 */
export function getApiKey(): string {
  const key = process.env.HAM_API_KEY?.trim();
  if (!key) {
    throw new Error(
      `HAM_API_KEY is not set. Add it to the .env file in the project root ` +
        `(see .env.example). Request a free key at ${API_KEY_REQUEST_URL}`,
    );
  }
  return key;
}

/**
 * Perform a GET request against the API, automatically attaching the API key
 * and dropping any parameters that are undefined, null, or empty strings.
 *
 * @param endpoint API path without a leading slash (e.g. "object" or "object/123").
 * @param params Query parameters to send (apikey is added automatically).
 * @returns The parsed JSON response body.
 */
export async function hamRequest<T>(
  endpoint: string,
  params: Record<string, QueryValue> = {},
): Promise<T> {
  const apikey = getApiKey();

  const cleaned: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      cleaned[k] = v;
    }
  }

  const response = await axios.get<T>(`${API_BASE_URL}/${endpoint}`, {
    params: { ...cleaned, apikey },
    timeout: REQUEST_TIMEOUT_MS,
    headers: { Accept: "application/json" },
  });

  return response.data;
}

/**
 * Convert any thrown error into a clear, actionable, single-line message that
 * guides the agent toward a fix. Internal details are not leaked.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      switch (status) {
        case 400:
          return (
            "Error: Bad request (400). A parameter was malformed — most often the 'q' " +
            "Elasticsearch query string. Simplify the query or check field names."
          );
        case 401:
          return (
            "Error: Unauthorized (401). The API key is missing or invalid. Set a valid " +
            `HAM_API_KEY in the project's .env file. Request a key at ${API_KEY_REQUEST_URL}`
          );
        case 404:
          return (
            "Error: Not found (404). The id or endpoint does not exist. Verify the id " +
            "(e.g. object_id) or use a search/list tool to find valid ids first."
          );
        case 429:
          return (
            `Error: Rate limit exceeded (429). The API allows ${DAILY_RATE_LIMIT} requests per ` +
            "day. Wait before retrying and reduce the number of calls (request more records per " +
            "page instead of paging repeatedly)."
          );
        default:
          return `Error: API request failed with status ${status}.`;
      }
    }
    if (axiosError.code === "ECONNABORTED") {
      return "Error: Request timed out. Try again, or reduce 'size' to request fewer records.";
    }
    return `Error: Could not reach the Harvard Art Museums API (${axiosError.message}).`;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Error: Unexpected error: ${String(error)}`;
}
