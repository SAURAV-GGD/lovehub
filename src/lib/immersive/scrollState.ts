export interface ScrollState {
  progress: number;
  target: number;
  velocity: number;
  direction: number;
  pointer: { x: number; y: number };
  isMoving: boolean;
}

/**
 * Mutable singleton holding scroll and pointer state.
 * Never bind progress to React state to prevent unneeded re-renders.
 */
export const scrollState: ScrollState = {
  progress: 0,
  target: 0,
  velocity: 0,
  direction: 0,
  pointer: { x: 0, y: 0 },
  isMoving: false,
};
