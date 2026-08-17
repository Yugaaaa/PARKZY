# CurbSense Design Direction

## Three stylistic approaches

### Theme Name: Civic Cartography
Very Brief Intro: A warm, map-led civic interface that treats parking as a legibility and trust problem. Limestone, teal, and graphite create a calm municipal utility with enough polish for a live demo.
Probability: 0.07

### Theme Name: Night Corridor
Very Brief Intro: A dark, high-contrast mobility control surface with luminous route signals and restrained cyan accents. It emphasizes immediacy and operational confidence.
Probability: 0.03

### Theme Name: Editorial Streetscape
Very Brief Intro: A light editorial system inspired by urban wayfinding, printed transit maps, and street furniture. It feels human, grounded, and approachable rather than technical.
Probability: 0.08

## Chosen approach: Civic Cartography

### Design Movement
Contemporary civic modernism blended with editorial cartography and wayfinding design.

### Core Principles
1. Make location and availability immediately legible.
2. Use quiet material contrast—limestone surfaces, graphite structure, teal action states—instead of decorative gradients.
3. Let controls follow the map task: search, filter, inspect, reserve.
4. Prefer deliberate whitespace and clear state transitions over dense dashboard ornament.

### Color Philosophy
Teal is the trusted action color: it means available, selected, and ready to reserve. Limestone keeps the experience grounded in the physical city, graphite gives authority views operational weight, and clay/amber distinguish exceptions without turning the product into an alert wall.

### Layout Paradigm
A map-first asymmetric composition: the map occupies the visual field, while compact controls and contextual panels attach to its edges rather than forcing every screen into a centered card grid.

### Signature Elements
1. Circular teal map markers and cluster badges with count labels.
2. Soft limestone panels with graphite text and strong teal CTAs.
3. Wayfinding microcopy that names zones, bays, walking distance, and hold time.

### Interaction Philosophy
Every interaction should reveal the next useful state: tapping a cluster zooms toward detail, tapping a pin opens one contextual panel, and reserving immediately surfaces the hold state and navigation path. No interaction should create ambiguous competing overlays.

### Animation
Use short ease-out transitions for panels and marker selection, with subtle scale feedback on pins and CTAs. Cluster expansion should feel spatial and purposeful. Respect reduced-motion preferences and never animate layout-critical content.

### Typography System
Use DM Serif Display for place and section headlines, Manrope for interface copy, and a restrained monospace face only for live operational values. Primary user-readable labels are at least 14px; metadata may recede to 12px.

### Brand Essence
CurbSense is a calm, location-aware curbside parking companion for Coimbatore drivers and municipal teams; it turns uncertain curb availability into a visible, reservable decision.
Personality: grounded, precise, considerate.

### Brand Voice
Headlines name the outcome; CTAs describe the next action; microcopy explains state without hype.
Example lines: “Find a bay that fits your arrival.” “Hold this space for ten minutes.”

### Wordmark & Logo
Use a compact circular curb-ring mark: a teal ring interrupted by a graphite curb notch and a single centered bay dot. The symbol should work independently of the wordmark and remain recognizable at favicon size.

### Signature Brand Color
Curb Teal: `#0A7D73` — a deep, ownable teal that reads as reliable action on limestone and remains visible in dark operational surfaces.
