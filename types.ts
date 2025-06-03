export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp?: number | null;
}

export interface TrainLocation extends Coordinates {
  statusMessage?: string;
  // Represents the segment of the route, e.g., distance from start or a specific station index
  // This helps in visualizing position on a simplified linear track.
  // For this demo, longitude will be used directly with min/max for simplicity.
}

export enum View {
  TrackShuttle,
  BeTracker,
  Schedule,
  Contact, // Added Contact view
}