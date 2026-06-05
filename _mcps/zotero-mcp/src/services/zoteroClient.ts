import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { ZOTERO_API_BASE, ZOTERO_API_VERSION } from "../constants.js";

export interface ZoteroClientConfig {
  apiKey: string;
  userId: string;
}

export interface PaginationResult<T> {
  items: T[];
  totalResults: number;
  hasMore: boolean;
  nextStart?: number;
}

export class ZoteroClient {
  private http: AxiosInstance;
  private userId: string;

  constructor(config: ZoteroClientConfig) {
    this.userId = config.userId;
    this.http = axios.create({
      baseURL: ZOTERO_API_BASE,
      timeout: 30000,
      headers: {
        "Zotero-API-Key": config.apiKey,
        "Zotero-API-Version": ZOTERO_API_VERSION,
        "Content-Type": "application/json",
      },
    });
  }

  get userPrefix(): string {
    return `/users/${this.userId}`;
  }

  async get<T>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T; headers: Record<string, string> }> {
    const response = await this.http.get<T>(path, { params });
    return {
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  async getPaginated<T>(
    path: string,
    params?: Record<string, unknown>
  ): Promise<PaginationResult<T>> {
    const response = await this.http.get<T[]>(path, { params });
    const totalResults = parseInt(
      (response.headers["total-results"] as string) || "0",
      10
    );
    const start = typeof params?.start === "number" ? params.start : 0;
    const limit =
      typeof params?.limit === "number" ? params.limit : response.data.length;
    const hasMore = totalResults > start + response.data.length;

    return {
      items: response.data,
      totalResults,
      hasMore,
      nextStart: hasMore ? start + limit : undefined,
    };
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await this.http.post<T>(path, data);
    return response.data;
  }

  async put(
    path: string,
    data: unknown,
    version?: number
  ): Promise<void> {
    const config: AxiosRequestConfig = {};
    if (version !== undefined) {
      config.headers = { "If-Unmodified-Since-Version": version.toString() };
    }
    await this.http.put(path, data, config);
  }

  async patch(
    path: string,
    data: unknown,
    version: number
  ): Promise<void> {
    await this.http.patch(path, data, {
      headers: { "If-Unmodified-Since-Version": version.toString() },
    });
  }

  async delete(
    path: string,
    version: number,
    params?: Record<string, string>
  ): Promise<void> {
    await this.http.delete(path, {
      headers: { "If-Unmodified-Since-Version": version.toString() },
      params,
    });
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const body =
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data);
      switch (status) {
        case 400:
          return `Error 400 Bad Request: ${body}. Check that item types and field names are valid.`;
        case 403:
          return `Error 403 Forbidden: Invalid API key or insufficient permissions.`;
        case 404:
          return `Error 404 Not Found: The requested resource does not exist. Check the key is correct.`;
        case 409:
          return `Error 409 Conflict: The target library is locked. Try again shortly.`;
        case 412:
          return `Error 412 Precondition Failed: The item has been modified since you last retrieved it. Re-fetch and retry.`;
        case 413:
          return `Error 413 Too Large: Too many items submitted (max 50 per request).`;
        case 428:
          return `Error 428 Precondition Required: A version number is required. Re-fetch the item and include its version.`;
        case 429:
          return `Error 429 Too Many Requests: Rate limit exceeded. Wait before retrying.`;
        case 503:
          return `Error 503 Service Unavailable: Zotero is under maintenance. Try again later.`;
        default:
          return `Error ${status}: ${body}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return `Error: Request timed out. The Zotero API may be slow — try again.`;
    } else if (error.message) {
      return `Error: ${error.message}`;
    }
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}
