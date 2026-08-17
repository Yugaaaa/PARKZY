# Theme, contrast, and performance verification

The citizen settings drawer now exposes a persisted Map surface contrast toggle. The browser smoke flow opened the settings, switched from `opaque` to `translucent`, switched back to `opaque`, and confirmed the toggle remains present. ParkingMap consumes this preference for the mobile Map tools chip, destination search, recenter control, and vehicle filter group; opaque mode remains the default.

The smoke harness now computes background alpha and contrast assertions for destination search, recenter, vehicle filters, the reservation panel header, arrival selector, and accessibility-permit card. The final isolated runs reported `contrastFailures: []`, zero duplicate Google Maps loader errors, and zero legacy marker warnings while confirming 114 pins, 8 zones, 14 expanded-zone pins, reservation controls, receipts, onboarding, and My Pass transition.

Route-level lazy loading and deterministic vendor chunking are active. The production build now emits separate LoginPage, CitizenDashboard, AuthorityDashboard, VehicleZoneSelector, ParkingMap, vendor-react, vendor-motion, vendor-maps, and vendor chunks; no chunk exceeds the configured 500 kB warning threshold. Build and Vitest both passed (4 tests). One repeated smoke loop had a transient CDP promise-collection harness error, but the subsequent isolated run passed completely.
