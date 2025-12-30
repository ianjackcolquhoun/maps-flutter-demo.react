import {Cart} from './Cart';
import {Route} from './Route';
import {LatLng} from './LatLng';

/**
 * Request status lifecycle
 */
export enum RequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Ride request model
 */
export interface RideRequest {
  id: string;
  status: RequestStatus;
  pickupLocation: LatLng;
  destination: LatLng;
  assignedCart: Cart | null;
  route: Route | null;
  createdAt: Date;
  estimatedArrivalMinutes?: number;
  partySize: number;
}
