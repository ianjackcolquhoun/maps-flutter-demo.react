import {LatLng} from './LatLng';

/**
 * Cart model representing a golf cart available for rides
 */
export interface Cart {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Helper to convert Cart to LatLng
 */
export const cartToLatLng = (cart: Cart): LatLng => ({
  latitude: cart.latitude,
  longitude: cart.longitude,
});
