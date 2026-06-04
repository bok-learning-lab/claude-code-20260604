export interface LightConfig {
  label: string;
  description: string;
  /** Angle in degrees on the top-down diagram (0 = directly in front, clockwise) */
  angle: number;
  /** Elevation in degrees: 0 = subject level, positive = above, negative = below */
  elevation: number;
  /** 0–1 intensity */
  intensity: number;
  /** CSS color for the light glow */
  color: string;
}

export interface StillData {
  id: string;
  src: string;
  title: string;
  shotDescription: string;
  keyLight: LightConfig;
  fillLight: LightConfig;
  backLight: LightConfig;
}

export const stills: StillData[] = [
  {
    id: "1",
    src: "/Rashomon_001.jpg",
    title: "The Confrontation",
    shotDescription:
      "Medium shot — Tajōmaru points accusingly, body angled toward camera. Miyagawa places the key light high and to the right, using mirrors to bounce sunlight through the forest canopy. The result is dramatic chiaroscuro: bright highlights carve the musculature of his outstretched arm while the left side falls into deep shadow. Minimal fill preserves the high-contrast ratio that makes Tajōmaru appear dangerous and unpredictable.",
    keyLight: {
      label: "Key Light",
      description:
        "Strong directional light from the right (~4 o'clock), high above the subject, mimicking sunlight bounced off mirrors through the tree canopy. Creates hard-edged highlights on the right side of the face, chest, and extended arm.",
      angle: 120,
      elevation: 45,
      intensity: 0.95,
      color: "#fff8e7",
    },
    fillLight: {
      label: "Fill Light",
      description:
        "Very minimal fill from the left (~8 o'clock) — mostly ambient bounce from the forest floor. The high key-to-fill ratio (approximately 8:1) creates the dramatic, threatening mood Kurosawa wanted for this character.",
      angle: 240,
      elevation: 10,
      intensity: 0.15,
      color: "#c8d8e8",
    },
    backLight: {
      label: "Back Light",
      description:
        "Dappled sunlight filtering through leaves behind and to the left of the subject at a low angle creates subtle rim separation, particularly visible on the lower back and left shoulder. This prevents the figure from merging into the dark forest background.",
      angle: 325,
      elevation: -20,
      intensity: 0.5,
      color: "#e8e8d0",
    },
  },
  {
    id: "2",
    src: "/Rashomon_002.jpg",
    title: "The Dappled Witness",
    shotDescription:
      "Close-up, three-quarter view — the forest itself becomes a lighting instrument. Miyagawa's key light rakes across the face from the upper-left, while actual tree shadows create an extraordinary dappled pattern that breaks across Tajōmaru's features. The effect is almost expressionistic: light and shadow physically mark the character, suggesting moral complexity. The near-absence of fill light on the right side creates a face half in shadow — literally divided.",
    keyLight: {
      label: "Key Light",
      description:
        "Intense key from the left (~7 o'clock), close to the camera, high above the subject, raking downward across the face. The dappled tree-shadow pattern visible across the face is unique to Rashomon's forest lighting — Miyagawa deliberately shot through the canopy rather than diffusing it, creating bright highlights on the left cheek, forehead, and shoulder.",
      angle: 210,
      elevation: 45,
      intensity: 0.9,
      color: "#fff8e7",
    },
    fillLight: {
      label: "Fill Light",
      description:
        "Almost no fill from the right (~4 o'clock) — the right side of the face falls into near-total darkness. This extreme contrast (estimated 10:1 or higher) was unusual for 1950 and contributed to the film's revolutionary visual language.",
      angle: 130,
      elevation: 5,
      intensity: 0.08,
      color: "#c8d8e8",
    },
    backLight: {
      label: "Back Light",
      description:
        "Soft rim light from behind and to the right (~1 o'clock), most visible as a thin bright edge on the right shoulder and the sword handle. This back light is crucial for separating the dark figure from the equally dark forest background.",
      angle: 45,
      elevation: 15,
      intensity: 0.45,
      color: "#e8e8d0",
    },
  },
  {
    id: "3",
    src: "/Rashomon_003.jpg",
    title: "The Reckoning",
    shotDescription:
      "Close-up, near-frontal — the most balanced lighting of the three, suggesting a moment of clarity or resolve. The key light from front-right models the face more evenly, with visible fill from the left softening the shadows. Compared to the previous shots, the lower contrast ratio gives Tajōmaru a more human, almost vulnerable quality — a deliberate shift by Kurosawa as the character's bravado wavers.",
    keyLight: {
      label: "Key Light",
      description:
        "Key from the left (~8 o'clock), positioned low — below the subject's eye line. This upward angle produces broader highlights and softer shadow transitions across the nose and cheek, giving the face a more even, less extreme modeling than the previous shots.",
      angle: 235,
      elevation: -20,
      intensity: 0.85,
      color: "#fff8e7",
    },
    fillLight: {
      label: "Fill Light",
      description:
        "Very weak fill from the right (~4 o'clock), possibly from a reflector or natural bounce off lighter foliage. Despite the low intensity, the key-to-fill ratio is still softer than the other stills, shifting the emotional register toward introspection.",
      angle: 135,
      elevation: 5,
      intensity: 0.1,
      color: "#c8d8e8",
    },
    backLight: {
      label: "Back Light",
      description:
        "Back light from behind and to the right (~1 o'clock), high above the subject, creating a gentle rim on the hair and shoulders. The effect is subtler than in the other stills — more of a luminous halo than a hard edge, consistent with the softer overall mood.",
      angle: 30,
      elevation: 35,
      intensity: 0.4,
      color: "#e8e8d0",
    },
  },
];
