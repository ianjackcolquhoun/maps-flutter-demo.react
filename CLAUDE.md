# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cart Tracker Demo** - A single-screen golf cart ride-sharing application demonstrating real-time GPS tracking, Google Maps integration, route calculation, and smooth animations. This is a **framework evaluation demo** (4-6 hour development target), not a production application.

**Technology Stack**: React Native with Google Maps integration
**Target Platforms**: iOS and Android (cross-platform mobile)

## Core Application Concept

Users can:
1. View their location and 3 carts on an interactive map of downtown Cincinnati
2. Request pickup to a sports stadium (Great American Ball Park)
3. Watch an assigned cart animate along real roads to their location
4. Experience a simulated ride to the stadium with live status updates
5. See real-time distance/ETA updates during the ride

**Key Technical Requirements**:
- Real road routing via Google Directions API (no straight lines)
- Service area validation using point-in-polygon detection
- Smooth cart animation at 8x speed (120 mph effective) with 100ms updates
- Camera follows cart during active rides at zoom level 17.0
- Purple-themed UI throughout

## Development Commands

### Setup
```bash
# Install dependencies
npm install
# or
yarn install

# Install iOS dependencies (if on macOS)
cd ios && pod install && cd ..
```

### Running the App
```bash
# Start Metro bundler
npm start
# or
yarn start

# Run on iOS
npm run ios
# or
yarn ios

# Run on Android
npm run android
# or
yarn android
```

### Development
```bash
# Type checking
npm run tsc
# or
yarn tsc

# Linting
npm run lint
# or
yarn lint

# Format code
npm run format
# or
yarn format
```

## Required External APIs

### Google Maps Platform Setup
You **must** configure these APIs before the app will work:

1. **Google Maps SDK for iOS** - Display interactive map on iOS
2. **Google Maps SDK for Android** - Display interactive map on Android
3. **Google Directions API** - Calculate routes with real roads

**API Key Setup**:
- Obtain API key from Google Cloud Console
- Enable all 3 APIs on the key
- Store key in `.env` file (never commit this file!)
- Configure platform-specific key restrictions for production

**Environment Variables**:
```bash
# .env file (create this locally)
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Architecture Overview

### Data Flow

```
User Location (GPS)
    ↓
Service Area Validation (Point-in-Polygon)
    ↓
Nearest Cart Assignment (Haversine Distance)
    ↓
Route Calculation (Google Directions API)
    ↓
Cart Animation (Linear Interpolation)
    ↓
Real-time UI Updates (Distance/ETA)
```

### Core State Management

**Active Request Lifecycle**:
1. `pending` (grey) - Request created, searching for cart
2. `assigned` (orange) - Cart assigned, moving to pickup location
3. `inProgress` (blue) - User picked up, heading to stadium
4. `completed` (green) - Arrived at stadium
5. `cancelled` (red) - User cancelled request

**Critical State Variables**:
- `activeRequest`: Current ride request (null when no active ride)
- `selectedCart`: Cart assigned to active request
- `activeRoute`: Route from Directions API with polyline points
- `animatedCartPosition`: Current cart position during animation
- `userLocation`: Continuously updated GPS location
- `isInsideServiceArea`: Whether user is within the service boundary

### Key Algorithms

**1. Haversine Distance Formula** (src/utils/haversine.ts)
- Calculates great-circle distance between two GPS coordinates
- Used for: Finding nearest cart, calculating distances, detecting pickup threshold
- Earth radius constant: 6,371,000 meters

**2. Ray Casting (Point-in-Polygon)** (src/utils/pointInPolygon.ts)
- Determines if user location is inside service area
- Cast ray to infinity, count boundary crossings
- Odd crossings = inside, even crossings = outside
- Used to validate requests and enable/disable request button

**3. Linear Interpolation (LERP)** (src/services/CartAnimationService.ts)
- Smoothly moves cart between polyline points
- Updates every 100ms
- Distance per tick: 5.36448 meters (120 mph effective speed)
- Formula: `newPosition = start + (end - start) × progress`

**4. Nearest Cart Assignment**
- Iterate all available carts
- Calculate Haversine distance to each
- Return cart with minimum distance

### Animation System

**Cart Movement**:
- Update frequency: 100ms (10 FPS)
- Base speed: 15 mph (realistic golf cart speed)
- Demo multiplier: 8.0x
- Effective speed: 120 mph (53.6448 m/s)
- Distance per update: 5.36448 meters

**Animation States**:
1. **Assigned Phase**: Cart moves from start → user location
   - Camera follows cart at zoom 17.0
   - Status: "assigned" (orange badge)
2. **Pickup Phase**: Cart reaches user (within 20 meters)
   - Pause animation for 5 seconds
   - Show "Picked up!" snackbar
   - Status transitions to "inProgress"
3. **In Progress Phase**: Cart moves user → stadium
   - Camera continues following
   - Live distance/ETA updates
4. **Completion**: Cart reaches stadium
   - Stop animation
   - Status: "completed" (green badge)
   - Button changes to "Exit"

**Camera Behavior**:
- Initial: Service area center (39.105, -84.51) at zoom 13.5
- User location obtained: Animate to user at zoom 15.0
- Cart animation starts: Animate to cart at zoom 17.0
- During ride: Continuously update to cart position every 100ms
- After completion/cancel: Stop following, allow manual pan/zoom

## Component Structure

Expected component hierarchy:

```
<MapScreen>
  ├── <GoogleMap>
  │   ├── <ServiceAreaPolygon>
  │   ├── <CartMarker> (×3)
  │   ├── <StadiumMarker>
  │   ├── <UserLocationMarker>
  │   └── <RoutePolyline>
  ├── <InfoCard> (conditional)
  │   ├── Cart name & icon
  │   ├── Status badge
  │   └── Distance/ETA/Party size grid
  ├── <RequestButton> (FAB)
  └── <AppBar>
      ├── Title: "Cart Tracker"
      └── <ThemeToggleButton>
```

## Geographic Constants

**Service Area** (30-point polygon):
- Location: Downtown Cincinnati, Ohio
- Defined in: `src/constants/serviceArea.ts`
- 30 unique points + 1 repeated to close polygon
- Coordinates range: ~39.087 to ~39.122 lat, ~-84.538 to ~-84.482 lng

**Stadium Destination**:
- Name: Great American Ball Park
- Coordinates: (39.0978, -84.5086)
- Drop-off area: West entrance

**Mock Carts** (3 hardcoded):
1. **CART-001** "Findlay Market Cart": (39.1116, -84.5158)
2. **CART-002** "Fountain Square Cart": (39.1020, -84.5120)
3. **CART-003** "Washington Park Cart": (39.1088, -84.5180)

## Visual Design Constants

### Color Palette

**Primary Purple Theme**:
- Deep purple: `#6A1B9A` (request button, primary actions)
- Purple shade 700: `#512DA8` (route polyline, success snackbars)
- Purple shade 900: `#311B92` (active cart marker)
- Deep purple 673AB7: `#673AB7` (available cart markers)

**Service Area**:
- Fill: `#AB47BC` at 6% opacity (`#10AB47BC` in ARGB)
- Border: `#9C27B0` (deep purple) at 2px width

**Status Badge Colors**:
- Pending: Grey `#9E9E9E`
- Assigned: Orange `#FF9800`
- In Progress: Blue `#2196F3`
- Completed: Green `#4CAF50`
- Cancelled: Red `#F44336`

**Markers**:
- Available cart: Deep purple `#673AB7` (30px)
- Active cart: Very dark purple `#311B92` shade 900 (30px)
- Stadium: Pastel red `#EF9A9A` red shade 200 (40px)

### Dimensions

**Markers**:
- Cart icon container: 30×30 pixels
- Stadium icon container: 40×40 pixels
- Icon glyph size: 70% of container (21px for cart, 28px for stadium)
- Background: White circle

**Route & Boundaries**:
- Route polyline width: 5 pixels
- Service area border width: 2 pixels

**Info Card**:
- Width: Screen width - 32px (16px margins each side)
- Padding: 20px all sides
- Border radius: 16px
- Shadow: 10px blur, (0, -2) offset, 10% opacity black

**Spacing**:
- Small gap: 8px
- Medium gap: 16px
- Large gap: 24px

## Map Styling

**Light Mode** (`assets/map-styles/clean_minimal.json`):
- Background: Very light grey `#f5f5f5`
- Roads: White `#ffffff` with light grey strokes `#d4d4d4`
- Water: Light blue `#b8d4e8`
- Parks: Light green `#d6e8d4`
- Labels: Dark grey `#616161`
- POIs: Hidden (reduces clutter)

**Dark Mode** (`assets/map-styles/dark.json`):
- Background: Dark grey `#242424`
- Roads: Dark grey `#3a3a3a` with darker strokes `#2a2a2a`
- Water: Dark blue `#1e3a5f`
- Parks: Dark green `#1a2e1a`
- Labels: Light grey `#b0b0b0`
- POIs: Hidden

Theme toggle in app bar switches between these styles. State is NOT persisted (resets to light mode on app restart).

## Location Services

**Permissions**:
- Request "While In Use" permission on app launch
- Prompt message: "Cart Tracker needs your location to find nearby carts and provide ride services."
- Handle denial gracefully: Show snackbar, disable request button
- Handle permanent denial: Instruct user to enable in Settings

**Continuous Tracking**:
- Accuracy: High (best available for navigation)
- Distance filter: 10 meters (only update when user moves 10m+)
- Stream location updates while app is active
- Check service area validation on each update
- Update UI reactively when location changes

## Google Directions API Integration

**Endpoint**: `https://maps.googleapis.com/maps/api/directions/json`

**Request Parameters**:
- `origin`: Cart location (lat,lng)
- `destination`: Stadium location (39.0978,-84.5086)
- `waypoints`: User pickup location (lat,lng)
- `mode`: driving
- `key`: API key from environment

**Response Needed**:
- `routes[0].overview_polyline.points`: Encoded polyline (must decode)
- `routes[0].legs[].distance.value`: Sum for total distance (meters)
- `routes[0].legs[].duration.value`: Sum for estimated duration (seconds)

**Polyline Decoding**:
- Use `@mapbox/polyline` package
- 5-digit precision algorithm
- Results in array of LatLng points for visualization and animation

**Error Handling**:
- Status "OK": Success, proceed with route
- Any non-OK status: Show error snackbar "Unable to calculate route. Please try again." (4 sec)
- Abort request creation if API fails
- Never fallback to straight-line routes (violates core requirement)

## Critical Implementation Rules

### Must Haves
1. **Real road routing only** - Use Google Directions API for all routes, no straight lines
2. **Service area validation** - Check point-in-polygon before allowing requests
3. **Graceful permission handling** - Handle denied permissions without crashing
4. **Smooth animation** - 100ms updates for fluid motion (no jank)

### Must Not Haves
1. **No straight-line fallbacks** - If Directions API fails, show error and abort
2. **No mock routes** - All routes must come from real API
3. **No ignoring permissions** - Respect user choice, show helpful error messages

### Out of Scope (Do NOT Implement)
- Backend server or database
- User authentication
- Payment processing
- Multiple simultaneous rides
- Ride history
- Push notifications
- Driver interface
- Real-time cart availability management (all carts always available)
- Comprehensive testing (this is a demo)
- Accessibility features
- Internationalization

## Testing Checklist

**Critical Manual Tests**:

1. **Permission Denial**: Deny location permission → verify button disabled + snackbar shown
2. **Outside Service Area**: Start app outside polygon → verify warning + button shows "Outside Service Area" (red, disabled)
3. **Request Flow**: Tap "Request Pickup" inside area → verify nearest cart selected + route appears + info card shows + cart animates
4. **Pickup Transition**: Watch cart reach user → verify 5-second pause + "Picked up!" snackbar + status changes to blue
5. **Completion**: Watch cart reach stadium → verify animation stops + completion snackbar + button changes to "Exit"
6. **Cancellation**: Request ride then tap "Cancel Request" → verify animation stops + route disappears + cart returns to original position
7. **API Failure**: Disable internet → tap "Request Pickup" → verify error snackbar + no ride created
8. **Theme Toggle**: Tap theme button → verify map style changes + icon updates
9. **Rapid Taps**: Rapidly tap request button → verify only one request created + "already have active request" snackbar
10. **Different Locations**: Request from different user positions → verify different carts assigned based on proximity

**Edge Cases**:
- User moves significantly during active ride
- App backgrounding during animation
- Very short routes (don't overshoot)
- User exactly on service area boundary

## Common Patterns

**React Native Implementation Notes**:
- Map: Use `react-native-maps` package
- Location: Use `@react-native-community/geolocation` or Expo Location API
- Polyline decoding: Use `@mapbox/polyline` package
- Custom markers: Use `<Marker>` components with custom icon images
- Animation: Use `setInterval` or `requestAnimationFrame`, update state every 100ms
- Timer cleanup: Always clear intervals in useEffect cleanup functions

**State Updates During Animation**:
```javascript
// Example pattern for cart animation
useEffect(() => {
  if (!activeRequest || !activeRoute) return;

  const interval = setInterval(() => {
    // Update cart position
    const newPosition = calculateNextPosition();
    setAnimatedCartPosition(newPosition);

    // Update camera to follow
    mapRef.current?.animateCamera({ center: newPosition, zoom: 17.0 });
  }, 100); // 100ms update interval

  return () => clearInterval(interval);
}, [activeRequest, activeRoute]);
```

## Configuration Constants

| Setting | Value | Description |
|---------|-------|-------------|
| Speed multiplier | 8.0 | Demo speed (8x realistic) |
| Base cart speed | 15 mph | Realistic golf cart speed |
| Effective speed | 120 mph | 15 × 8 for demo |
| Update interval | 100 ms | Position update frequency |
| Pickup pause | 5 seconds | Wait time at pickup location |
| Pickup threshold | 20 meters | Distance to consider "reached" |
| Location distance filter | 10 meters | Min movement to trigger update |
| Initial zoom | 13.5 | Shows entire service area |
| User-centered zoom | 15.0 | When centering on user |
| Cart-following zoom | 17.0 | During active ride |
| Max party size | 5 | Maximum passengers |

## Important Behavioral Notes

**Button States**:
- "Getting your location..." (grey, disabled) when location is null
- "Outside Service Area" (red, disabled) when user outside polygon
- "Request Pickup to Stadium" (deep purple, enabled) when ready
- "Cancel Request" (red, enabled) during active ride
- "Exit" (blue, enabled) after ride completion

**Snackbar Timing**:
- Permission denied: 3 seconds
- Outside area warning: 4 seconds
- Cart assigned: 4 seconds
- Picked up: 2 seconds
- Ride completed: 3 seconds
- Request cancelled: 2 seconds
- Ready for next ride: 2 seconds

**Route Calculation**:
- Always use 3 waypoints: [cart location, user location, stadium location]
- This ensures cart picks up user THEN goes to stadium (not direct to stadium)
- Waypoint order is critical for correct route

**Animation Pause**:
- When cart reaches within 20m of pickup location, pause for exactly 5 seconds
- Do NOT skip this pause (required for realistic experience)
- After pause, update status from "assigned" to "inProgress"
- Then resume animation toward stadium

## Key Files Expected

```
src/
├── components/
│   ├── MapScreen.tsx           # Main screen component
│   ├── InfoCard.tsx            # Ride info display
│   ├── RequestButton.tsx       # FAB with state management
│   └── AppBar.tsx              # Header with theme toggle
├── services/
│   ├── CartAnimationService.ts # Animation logic
│   ├── DirectionsService.ts    # Google Directions API calls
│   └── LocationService.ts      # GPS tracking
├── utils/
│   ├── haversine.ts            # Distance calculation
│   ├── pointInPolygon.ts       # Service area validation
│   └── polylineDecoder.ts      # Decode Google polyline
├── constants/
│   ├── serviceArea.ts          # 30-point polygon coordinates
│   ├── carts.ts                # 3 mock cart definitions
│   ├── colors.ts               # Color palette
│   └── config.ts               # Animation/location settings
├── types/
│   ├── Cart.ts                 # Cart model
│   ├── RideRequest.ts          # Request model with status enum
│   └── Route.ts                # Route model
└── assets/
    └── map-styles/
        ├── clean_minimal.json  # Light mode map style
        └── dark.json           # Dark mode map style
```

## Success Criteria

The implementation is complete when:
1. All 3 carts appear on map with service area polygon
2. Location permission is requested and handled gracefully
3. Request button correctly enables/disables based on service area
4. Nearest cart is assigned when request is made
5. Route is calculated via Google Directions API (real roads, not straight lines)
6. Cart animates smoothly at 8x speed along real roads
7. Camera follows cart during ride at zoom 17.0
8. 5-second pause occurs at pickup location
9. Status transitions work: pending → assigned → inProgress → completed
10. Info card shows live distance/ETA updates
11. Cancellation stops animation and resets state
12. Theme toggle switches map between light and dark styles
13. All snackbar messages appear at correct times with correct colors
14. App handles all error cases gracefully (no crashes)
