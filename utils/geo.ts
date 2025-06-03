
import { Coordinates } from '../types';

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param coord1 The first coordinate.
 * @param coord2 The second coordinate.
 * @returns The distance in kilometers.
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const toRad = (value: number): number => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};
