# Map control visibility repair

- [x] Inspect the map overlay stacking, opacity, and control-surface styles.
- [x] Make destination and vehicle filter controls visibly opaque with durable contrast.
- [x] Verify control readability and interaction against the live map.
- [x] Save a corrected interface checkpoint.

## Reservation detail enhancement

- [x] Add arrival-time selection to the reservation drawer.
- [x] Add accessibility-permit selection to the reservation drawer.
- [x] Include both choices in the demonstration hold summary and verify the flow.
- [x] Save a new release checkpoint. after verification.

## Production reservations and map zones

- [x] Audit current reservation, schema, API, and map models.
- [x] Add persisted reservation fields for arrival window and permit request/verification.
- [x] Add server-side accessibility eligibility validation and authorized reservation mutation.
- [x] Generate a detailed confirmation receipt with bay, arrival, permit, and hold details.
- [x] Refine map zones to fewer than ten high-contrast clickable rings.
- [x] Ensure 100+ parking pins are distributed under the zone rings and remain individually interactive.
- [x] Test authorization rejection, permit eligibility rejection, receipts, zone expansion, and pin reservation actions.
- [x] Verify a successful authenticated reservation write/read/cancel cycle against the database.
- [x] Save a production-oriented release checkpoint.

## Operator dashboard and final release

- [x] Audit operator routes, active reservations, and permit-review data contracts.
- [x] Add an operator dashboard for active reservations.
- [x] Add operator-only permit document review and verification actions.
- [x] Preview the deployed map surface; the published bundle contains Advanced Marker code and the live authority dashboard reports 114 spaces across 8 zone rows.
- [x] Run final build, tests, and smoke checks.
- [x] Save and publish the final release checkpoint.
- [x] Verify the published authority dashboard reports 114 spaces across 8 zone rows after final publication and the live bundle contains the Reservations view.

## Visual refinement pass

- [x] Strengthen map overlay opacity and text contrast for reservation details and vehicle filters.
- [x] Upgrade the map destination search field with clearer visual hierarchy and focus treatment.
- [x] Collapse feature-card detail content by default and reveal it on individual hover or focus.
- [x] Compact the citizen zone-card grid into a more professional operational layout.
- [x] Build, test, visually verify, and publish the visual-refinement checkpoint.

## Compact control refinement pass

- [x] Remove the redundant map-control wrapper identified by the visual editor.
- [x] Place the map recenter action beside the destination search with a compact, polished layout.
- [x] Further reduce feature-card height and spacing while preserving hover/focus detail reveal.
- [x] Build, visually verify, and publish the compact-control refinement checkpoint.

## Mobile, onboarding, identity, and map-flow refinement

- [x] Add a mobile-only collapsible Map tools chip for destination, recenter, and vehicle filters.
- [x] Add an accessible hint explaining hover or focus interaction on the feature cards.
- [x] Add a first-login citizen walkthrough with concise usage steps and a dismissible completion state.
- [x] Allow citizen display-name entry while retaining a common standardized authority identity.
- [x] Scatter pin locations within zone geometry and hide zone rings during expanded zone pin view until zoom-out.
- [x] Diagnose and restore the pin-selection reservation drawer through repeated map interaction tests.
- [x] Build, test, visually verify, and publish the combined refinement checkpoint.

## Callback and contrast bug-fix pass

- [x] Fix the missing ZoneDetailSheet onOpenPassView callback wiring.
- [x] Audit and replace transparent dashboard/component surfaces that hide content.
- [x] Run repeated reservation, build, unit, and visual regression tests.
- [x] Save and publish the verified bug-fix checkpoint.

## Final map surface opacity pass

- [x] Replace remaining translucent ParkingMap dashboard surfaces with opaque semantic backgrounds.
- [x] Verify map controls, reservation panel, and pin-selection flow after the opacity pass.
- [x] Save and publish the verified transparency checkpoint.

## Theme, contrast, and performance optimization

- [x] Add a settings toggle for opaque versus softer translucent map surfaces and persist the preference.
- [x] Add automated contrast assertions for critical map controls, reservation overlays, and readable text.
- [x] Add route-level code splitting for the major citizen, authority, login, and selector routes.
- [x] Verify theme switching, contrast checks, smoke flows, and production bundle output.
- [x] Save and publish the verified optimization checkpoint.

## Reservation navigation connection pass

- [x] Replace the stale ParkingMap action with a working reservations navigation button.
- [x] Connect the action to the existing citizen reservations/My Pass state and booking flow.
- [x] Run repeated navigation, reservation, build, unit, and smoke tests.
- [x] Save and publish the verified reservations checkpoint.

## Reservation-details contrast pass

- [x] Make the reservation-details section readable over all map backgrounds in opaque and translucent modes.
- [x] Run contrast assertions, build, and repeated reservation-flow tests.
- [x] Save and publish the verified contrast checkpoint.

## Light-mode ParkingMap readability pass

- [x] Fix light-mode contrast for the selected-bay/map overlay surface.
- [x] Fix light-mode contrast for the reservation summary and evidence surfaces.
- [x] Fix light-mode contrast for the reservation action footer surface.
- [x] Run light-mode contrast assertions, build, and repeated reservation-flow tests.
- [x] Save and publish the verified light-mode checkpoint.

## Demo controls, receipt actions, and parking-bay sorting

- [x] Add compact opaque/translucent theme previews inside settings before applying a mode.
- [x] Add download and share actions to reservation receipts and parking-pass details.
- [x] Add rate and walking-distance sorting for available parking bays.
- [x] Change the demo hold duration to a clearly labeled 15-second hold across client, server, and public copy.
- [x] Show the remaining demo time limit after check-in or hold confirmation.
- [x] Run comprehensive settings, map, receipt, hold, and timer regression tests.
- [x] Save and publish the verified demo-UX checkpoint.

## Final demo-UX gap closure

- [x] Add download/share controls directly to the ParkingMap confirmation receipt.
- [x] Verify and assert that rate and walking-distance modes change available-bay ordering, not only the selector value.
- [x] Remove remaining stale 10-minute client-facing hold copy and audit all public labels.
- [x] Save and publish a new checkpoint after the gap-closure validation.
