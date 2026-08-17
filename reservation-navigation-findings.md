# Reservation navigation verification

The stale ParkingMap footer action is now `btn-open-reservations` and calls the parent dashboard's `onOpenReservations` callback. CitizenDashboard passes `() => setActiveTab('pass')`, so the action opens the existing My Pass reservation dashboard and intentionally unmounts the map after navigation.

Two isolated smoke runs passed. Each confirmed 114 pins, 8 zones, 14 expanded-zone pins, the selected-pin reservation drawer, arrival and accessibility controls, confirmation receipt, first-use walkthrough, display-name persistence, mobile Map tools, opaque/translucent settings round-trip, zero contrast failures, and the new reservation navigation state `{ button: true, passTabActive: true }`. Production build passed with route/vendor chunks and Vitest passed 4 tests.
