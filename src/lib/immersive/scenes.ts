export interface Scene {
  id: string;
  name: string;
  progressStart: number;
  progressEnd: number;
  targetTime: number; // in 5-second video
}

export const SCENES: Scene[] = [
  { id: "hero", name: "Meadow & Lake Ahead", progressStart: 0, progressEnd: 1 / 6, targetTime: 0.0 },
  { id: "demo", name: "Walking Path", progressStart: 1 / 6, progressEnd: 2 / 6, targetTime: 0.83 },
  { id: "steps", name: "Fence & Wildflowers", progressStart: 2 / 6, progressEnd: 3 / 6, targetTime: 1.67 },
  { id: "features", name: "Blossom Trees", progressStart: 3 / 6, progressEnd: 4 / 6, targetTime: 2.5 },
  { id: "pricing", name: "Petal Swirl & Atmosphere", progressStart: 4 / 6, progressEnd: 5 / 6, targetTime: 3.33 },
  { id: "faq", name: "Village & Pagoda", progressStart: 5 / 6, progressEnd: 0.92, targetTime: 4.17 },
  { id: "cta", name: "Arrival at Village", progressStart: 0.92, progressEnd: 1.0, targetTime: 4.8 },
];
