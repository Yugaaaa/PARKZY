# Live Verification Notes

The managed preview loads the CurbSense login page successfully. Fixed citizen demo credentials (`citizen@curbsense.city` / `coimbatore2026`) successfully entered the citizen dashboard. The prior blank-screen crash was traced to `process.env` access inside browser code and removed. Current browser diagnostics show Google Maps proxy elements loading; remaining messages are provider deprecation/duplicate custom-element warnings, not app exceptions.

The logged-in dashboard visibly loads Google geographic tiles centered on Coimbatore with teal circular clusters and numeric counts. Clicking a cluster changes the map camera/cluster state, confirming interactive map behavior. The map provider surfaces standard Google controls and attribution.
