# Callback and contrast bug-fix verification

The ZoneDetailSheet parent now supplies `onOpenReportModal` and `onOpenPassView`; completing a zone-sheet hold advances to My Pass, closes the sheet, and clears stale zone selection before returning to Find & Book. The pin reservation drawer remains available after this path.

The citizen flow now uses durable surfaces for the selected-bay reservation block, vehicle choices, trust ribbon, active hold banner, pass header, verified-pass badge, read notifications, sticky header, active-pass pill, zone price labels, and first-use guide step cards. The walkthrough backdrop is intentionally darker for modal separation.

Production build passed, Vitest passed 4 tests, and two consecutive browser smoke runs passed. Each run confirmed 114 pins, 8 zones, 14 expanded-zone pins, zone-sheet pass-view transition, pin reservation drawer, arrival and permit controls, confirmation receipt, mobile tools, first-use guide, display name, zero duplicate-loader errors, and zero legacy-marker warnings. Visual preview capture showed the public entry screen remained legible after the fixes.
