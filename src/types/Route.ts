import {LatLng} from './LatLng';

/**
 * Route model from Google Directions API
 */
export interface Route {
  polylinePoints: LatLng[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  encodedPolyline?: string;
}
