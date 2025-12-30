# Cart Tracker - Implementation Guide

## Overview
This document outlines the phased implementation approach for building the Cart Tracker React Native application. Each phase builds incrementally on the previous one with clear, testable milestones.

**Total Estimated Time:** 5-7 hours
**Current Status:** Phase 1 Complete ✅

---

## Phase 1: Foundation & Dependencies ✅ COMPLETE
**Time:** 30-45 minutes
**Status:** ✅ Complete

### Objectives
- Install required npm packages
- Create project directory structure
- Define TypeScript types
- Configure native permissions
- Set up API key management

### What Was Built
**Dependencies Installed:**
- `react-native-maps` - Google Maps integration
- `@react-native-community/geolocation` - GPS location tracking
- `@mapbox/polyline` - Polyline decoding
- `react-native-dotenv` - Environment variables

**Directory Structure:**
```
src/
├── components/
├── services/
├── utils/
├── constants/
└── types/
    ├── LatLng.ts
    ├── Cart.ts
    ├── RideRequest.ts
    └── Route.ts
```

**Native Configuration:**
- iOS: NSLocationWhenInUseUsageDescription in Info.plist
- Android: ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION in AndroidManifest.xml
- `.env.example` template for API key

### Success Criteria
- ✅ TypeScript compilation succeeds
- ✅ App builds on iOS and Android
- ✅ All types properly defined
- ✅ Permissions configured

---

## Phase 2: Constants & Utilities
**Time:** 45-60 minutes
**Status:** ⏳ Not Started

### Objectives
- Define all geographic data and configuration constants
- Implement core utility algorithms
- Create map styling assets

### Files to Create

**Constants (5 files):**
- `src/constants/serviceArea.ts` - 30-point polygon for downtown Cincinnati
- `src/constants/carts.ts` - 3 mock cart definitions with coordinates
- `src/constants/stadium.ts` - Great American Ball Park coordinates
- `src/constants/colors.ts` - Purple theme palette, status colors
- `src/constants/config.ts` - Animation settings, zoom levels

**Utilities (3 files):**
- `src/utils/haversine.ts` - Calculate great-circle distance between coordinates
- `src/utils/pointInPolygon.ts` - Ray-casting algorithm for service area validation
- `src/utils/polylineDecoder.ts` - Decode Google Directions API polylines

**Assets (2 files):**
- `assets/map-styles/clean_minimal.json` - Light mode map style
- `assets/map-styles/dark.json` - Dark mode map style

### Success Criteria
- Haversine distance calculation accurate (cart 1 to stadium ≈ 1,700m)
- Point-in-polygon works correctly (test points inside/outside service area)
- Map styles parse as valid JSON
- All constants importable without errors

---

## Phase 3: Location & Map Display
**Time:** 60-90 minutes
**Status:** ⏳ Not Started

### Objectives
- Implement location service with permissions
- Display interactive Google Maps
- Show markers and service area polygon
- Support light/dark theme toggle

### Files to Create

**Services (1 file):**
- `src/services/LocationService.ts` - GPS tracking, permission handling, location streaming

**Components (2 files):**
- `src/components/AppBar.tsx` - Header with title and theme toggle
- `src/components/MapScreen.tsx` - Main map view with markers and polygon

**Files to Modify:**
- `App.tsx` - Replace boilerplate with MapScreen

### Features
- Interactive Google Maps centered on Cincinnati (39.105, -84.51)
- User location marker (blue dot)
- 3 cart markers (purple car icons, 30px)
- Stadium marker (red baseball icon, 40px)
- Service area polygon (purple fill with border)
- Theme toggle (light/dark map styles)

### Success Criteria
- App displays map with all markers visible
- User location permission dialog appears on launch
- Blue dot shows user location after permission granted
- Service area polygon visible
- Theme toggle switches map styles
- Can pan and zoom map

---

## Phase 4: Request Button & Service Area Validation
**Time:** 30-45 minutes
**Status:** ⏳ Not Started

### Objectives
- Implement smart request button with dynamic states
- Validate user location against service area
- Show appropriate snackbar messages

### Files to Create

**Components (1 file):**
- `src/components/RequestButton.tsx` - Floating action button with state logic

**Files to Modify:**
- `src/components/MapScreen.tsx` - Add button, validation logic, snackbar system

### Button States
| Condition | Text | Color | Enabled |
|-----------|------|-------|---------|
| Location = null | "Getting your location..." | Grey | No |
| Outside service area | "Outside Service Area" | Red | No |
| Ready to request | "Request Pickup to Stadium" | Deep Purple | Yes |
| Active ride | "Cancel Request" | Red | Yes |
| Ride completed | "Exit" | Blue | Yes |

### Success Criteria
- Button appears at bottom center of screen
- Button state updates based on user location
- Inside service area → enabled (deep purple)
- Outside service area → disabled (red)
- Snackbars show appropriate messages
- Permission denied handled gracefully

---

## Phase 5: Route Calculation & Cart Assignment
**Time:** 45-60 minutes
**Status:** ⏳ Not Started

### Objectives
- Integrate Google Directions API
- Implement nearest cart assignment algorithm
- Display route on map
- Handle request creation flow

### Files to Create

**Services (1 file):**
- `src/services/DirectionsService.ts` - Google Directions API client

**Files to Modify:**
- `src/components/MapScreen.tsx` - Add request flow, route display

### Features
- Find nearest cart using Haversine distance
- Call Google Directions API: cart → user → stadium
- Decode polyline and display route (purple, 5px)
- Change selected cart marker to dark purple
- Update button to "Cancel Request"
- Show success snackbar with cart name and ETA

### API Integration
**Endpoint:** `https://maps.googleapis.com/maps/api/directions/json`

**Parameters:**
- `origin`: Cart location (lat,lng)
- `destination`: Stadium location (39.0978,-84.5086)
- `waypoints`: User pickup location (lat,lng)
- `mode`: driving
- `key`: API key from .env

**Error Handling:**
- Status "OK" → success, display route
- Any non-OK status → show error snackbar, abort request
- Never fallback to straight lines (violates core requirement)

### Success Criteria
- Tap "Request Pickup" → route appears following real roads
- Nearest cart assigned based on distance
- Cart marker changes to dark purple
- Route polyline visible on map
- Success snackbar shows ETA
- API errors handled gracefully
- Cancel removes route and resets state

---

## Phase 6: Cart Animation & Info Card
**Time:** 90-120 minutes
**Status:** ⏳ Not Started

### Objectives
- Implement smooth cart animation along route
- Display live ride status in info card
- Handle all request lifecycle states
- Implement pickup pause and completion flow

### Files to Create

**Services (1 file):**
- `src/services/CartAnimationService.ts` - Timer-based position streaming with LERP

**Components (1 file):**
- `src/components/InfoCard.tsx` - Ride status display

**Files to Modify:**
- `src/components/MapScreen.tsx` - Add animation logic, info card

### Animation Specifications
- **Update Frequency:** 100ms (10 FPS)
- **Speed:** 15 mph × 8 multiplier = 120 mph effective (53.6448 m/s)
- **Distance per tick:** 5.36448 meters
- **Algorithm:** Linear interpolation (LERP) between polyline points
- **Pickup threshold:** 20 meters
- **Pickup pause:** 5 seconds

### Animation Lifecycle

**1. Assigned Phase:**
- Cart moves from start location → user location
- Camera follows cart at zoom 17.0
- Status: "assigned" (orange badge)

**2. Pickup Phase:**
- Cart reaches user (within 20m)
- Pause animation for 5 seconds
- Show snackbar: "Picked up! Heading to stadium..."
- Status changes to "inProgress" (blue badge)

**3. In Progress Phase:**
- Cart moves user → stadium
- Camera continues following
- Info card shows live distance/ETA updates

**4. Completion:**
- Cart reaches stadium
- Stop animation
- Status: "completed" (green badge)
- Snackbar: "Ride completed! Enjoy the game! 🎉"
- Button changes to "Exit"

### Info Card Content
- Cart icon and name
- Color-coded status badge
- Distance to destination (live updates)
- Estimated time of arrival (live updates)
- Party size

### Additional Flows
- **Cancel:** Stop animation, clear route, reset cart position
- **Exit:** Clear all state, show "Ready for next ride!" snackbar

### Success Criteria
- Cart animates smoothly along route (no jank)
- Cart follows real roads (not straight lines)
- Camera follows cart at zoom 17.0
- Info card displays and updates in real-time
- 5-second pause occurs at pickup
- Status transitions work correctly
- Completion triggers snackbar and "Exit" button
- Cancel stops animation immediately
- Exit resets to initial state
- No memory leaks (timers cleaned up properly)

---

## Implementation Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Constants & Utilities)
    ↓
Phase 3 (Location & Map Display)
    ↓
Phase 4 (Request Button & Validation)
    ↓
Phase 5 (Route Calculation)
    ↓
Phase 6 (Animation & Info Card)
```

Each phase must be completed before moving to the next.

---

## Key Technical Decisions

### State Management
- React hooks (useState, useEffect, useRef)
- No external state library needed (Redux, MobX)
- MapScreen is the central state container

### Animation Approach
- setInterval for predictable 100ms timing
- State updates trigger React re-renders
- Camera updates follow position changes
- Cleanup intervals in useEffect

### Error Handling
- User-facing errors → snackbars (no crashes)
- Technical errors → console logs
- Graceful degradation if permissions denied
- API failures abort operations cleanly

### Performance
- 10m location update threshold
- 100ms animation interval
- Clean up timers/listeners to prevent leaks

---

## File Summary

### Total Files to Create: 22

**Types:** 4 files (✅ Complete)
**Constants:** 5 files
**Utilities:** 3 files
**Services:** 3 files
**Components:** 4 files
**Assets:** 2 files
**Config:** 1 file

### Files to Modify: 4
- `App.tsx` - Replace boilerplate
- `package.json` - Dependencies (✅ Complete)
- `ios/CartTracker/Info.plist` - Permissions (✅ Complete)
- `android/app/src/main/AndroidManifest.xml` - Permissions (✅ Complete)

---

## Critical Requirements

### Must Haves ✓
1. Real road routing only (Google Directions API)
2. Service area validation (point-in-polygon)
3. Graceful permission handling
4. Smooth animation (100ms updates)
5. Purple theme throughout
6. Live status updates

### Must NOT Have ✗
1. No straight-line fallbacks
2. No mock routes
3. No ignoring permissions
4. No crashes on errors

### Out of Scope
- Backend server or database
- User authentication
- Payment processing
- Multiple simultaneous rides
- Ride history
- Push notifications
- Driver interface
- Production-ready features (comprehensive testing, accessibility, i18n)

---

## Next Steps

**Current Phase:** Phase 1 ✅ Complete

**Next Phase:** Phase 2 - Constants & Utilities

**Ready to start?** Run the next phase to implement geographic constants, utility algorithms, and map styling assets.

---

**Last Updated:** December 29, 2024
**Framework:** React Native 0.83.1
**Platform:** iOS & Android
