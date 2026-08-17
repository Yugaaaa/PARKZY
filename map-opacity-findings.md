# ParkingMap opacity verification

The stale visual-editor location was part of the current selected-bay reservation overlay, not a missing element. The current ParkingMap implementation now uses opaque backgrounds for the mobile Map tools chip, destination search, recenter control, vehicle filter group, authority badge, selected-bay header, metric tiles, demonstration-hold policy, reservation-details section, availability badge, status badges, and reservation action footer. Backdrop blur was removed where it was paired with translucent surfaces.

Production build passed, Vitest passed 4 tests, and the advanced-map smoke flow passed with 114 pins, 8 zones, 14 expanded-zone pins, zone-sheet pass transition, visible pin reservation panel, arrival and permit controls, confirmation receipt, mobile tools, onboarding, display-name persistence, and zero duplicate-loader or legacy-marker warnings.
