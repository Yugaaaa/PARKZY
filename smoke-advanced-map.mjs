const previewUrl = process.argv[2];

if (!previewUrl) {
  throw new Error('Usage: node scripts/smoke-advanced-map.mjs <preview-url>');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 30000, intervalMs = 250) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await fn();
    if (value) return value;
    await sleep(intervalMs);
  }
  throw new Error(`Timed out while waiting for the expected application state. Console: ${consoleEvents.slice(-12).join(' | ')}`);
}

const targets = await fetch('http://127.0.0.1:9333/json').then((response) => response.json());
const target = targets.find((item) => item.type === 'page');
if (!target?.webSocketDebuggerUrl) throw new Error('No debuggable Chromium page was available.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const consoleEvents = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(`${message.error.message} [${request.label}]`));
    else request.resolve(message.result);
    return;
  }

  if (message.method === 'Runtime.consoleAPICalled') {
    consoleEvents.push(message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
  }
  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params.exceptionDetails;
    const stack = details.exception?.description || details.stackTrace?.callFrames?.map((frame) => `${frame.url}:${frame.lineNumber}:${frame.columnNumber}`).join(' <- ') || '';
    consoleEvents.push(`${details.text || 'Uncaught page exception'} ${stack}`.trim());
  }
});

function cdp(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject, label: `${method} ${String(params.expression || '').slice(0, 120)}` }));
}

async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Page.navigate', { url: `${previewUrl}?headless-advanced-map=1` });

await waitFor(() => evaluate("Boolean(document.querySelector('#input-citizen-email'))"));
await evaluate("localStorage.removeItem('curbsense_first_use_seen_usr-ananya')");
await evaluate(`(() => {
  const setValue = (selector, value) => {
    const input = document.querySelector(selector);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  setValue('#input-citizen-display-name', 'Map Tester');
  setValue('#input-citizen-email', 'citizen@curbsense.city');
  setValue('#input-citizen-password', 'coimbatore2026');
  document.querySelector('#btn-citizen-submit').click();
})()`);

await waitFor(() => evaluate("Boolean(document.querySelector('#first-use-walkthrough'))"));
await evaluate("document.querySelector('#btn-dismiss-first-use-guide').click()");
await waitFor(() => evaluate("document.body.innerText.includes('Map Tester')"));
await waitFor(() => evaluate("Boolean(document.querySelector('#parking-map-wrapper'))"));

await evaluate("document.querySelector('#btn-open-hamburger-menu').click()");
await waitFor(() => evaluate("Boolean(document.querySelector('#btn-toggle-surface-mode'))"));
const surfaceModeBefore = await evaluate("localStorage.getItem('curbsense_surface_mode')");
await evaluate("document.querySelector('#btn-toggle-surface-mode').click()");
await waitFor(() => evaluate("localStorage.getItem('curbsense_surface_mode') === 'translucent'"));
const surfaceModeSoft = await evaluate("localStorage.getItem('curbsense_surface_mode')");
await evaluate("document.querySelector('#btn-toggle-surface-mode').click()");
await waitFor(() => evaluate("localStorage.getItem('curbsense_surface_mode') === 'opaque'"));
const surfaceModeAfter = await evaluate("localStorage.getItem('curbsense_surface_mode')");
const surfaceModeState = { before: surfaceModeBefore, soft: surfaceModeSoft, after: surfaceModeAfter, togglePresent: true };
await evaluate("document.querySelector('#btn-close-hamburger')?.click()");
await waitFor(() => evaluate("!Boolean(document.querySelector('#hamburger-menu-overlay'))"));

// Reproduce the reported zone-sheet path: zone card -> sheet bay -> hold -> My Pass.
await evaluate("document.querySelector('[id^=\\\"zone-card-\\\"]')?.click()");
await waitFor(() => evaluate("Boolean(document.querySelector('#zone-detail-modal-overlay'))"));
await waitFor(() => evaluate("Boolean(document.querySelector('button[id^=\\\"space-tile-\\\"]:not([disabled])'))"));
await evaluate("document.querySelector('button[id^=\\\"space-tile-\\\"]:not([disabled])').click()");
await waitFor(() => evaluate("Boolean(document.querySelector('#btn-confirm-hold-space'))"));
await evaluate("document.querySelector('#btn-confirm-hold-space').click()");
await waitFor(() => evaluate("Boolean(document.querySelector('#my-pass-active-container'))"));
const zoneSheetPassView = true;
await evaluate("document.querySelector('#btn-cancel-hold')?.click()");
await waitFor(() => evaluate("Boolean(document.querySelector('#my-pass-empty-state'))"));
await evaluate("document.querySelector('#tab-btn-find')?.click()");
await waitFor(() => evaluate("Boolean(document.querySelector('#parking-map-wrapper'))"));

await waitFor(() => evaluate("Boolean(document.querySelector('#btn-mobile-map-tools'))"));
await evaluate("document.querySelector('#btn-mobile-map-tools').click()");
await waitFor(() => evaluate("!document.querySelector('#map-tools-panel').classList.contains('hidden')"));
await waitFor(() => evaluate("Boolean(document.querySelector('#map-sort-select'))"));
const defaultSpaceOrder = await evaluate("window.__curbsenseMapDebug?.visibleSpaceOrder || []");
await evaluate(`(() => { const select = document.querySelector('#map-sort-select'); const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; setter.call(select, 'rate'); select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await waitFor(() => evaluate("document.querySelector('#map-sort-select')?.value === 'rate'"));
await waitFor(() => evaluate("window.__curbsenseMapDebug?.visibleSpaceOrder?.length > 0"));
const rateSpaceOrder = await evaluate("window.__curbsenseMapDebug?.visibleSpaceOrder || []");
await evaluate(`(() => { const select = document.querySelector('#map-sort-select'); const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; setter.call(select, 'distance'); select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await waitFor(() => evaluate("document.querySelector('#map-sort-select')?.value === 'distance'"));
await waitFor(() => evaluate("window.__curbsenseMapDebug?.visibleSpaceOrder?.length > 0"));
const distanceSpaceOrder = await evaluate("window.__curbsenseMapDebug?.visibleSpaceOrder || []");
const sortBehavior = {
  rateChangesOrder: JSON.stringify(defaultSpaceOrder) !== JSON.stringify(rateSpaceOrder),
  distanceChangesOrder: JSON.stringify(defaultSpaceOrder) !== JSON.stringify(distanceSpaceOrder),
};
await waitFor(() => evaluate("window.__curbsenseMapDebug?.advancedMarkerCount >= 100"), 20000);
await waitFor(() => evaluate("window.__curbsenseMapDebug?.zoneMarkerCount > 0 && window.__curbsenseMapDebug?.zoneMarkerCount < 10"), 20000);

const initialMapState = await evaluate(`(() => ({
  pinCount: window.__curbsenseMapDebug?.advancedMarkerCount || 0,
  zoneCount: window.__curbsenseMapDebug?.zoneMarkerCount || 0,
}))()`);

await evaluate("window.__curbsenseMapDebug.selectFirstZone()");
await waitFor(() => evaluate("window.__curbsenseMapDebug?.advancedMarkerCount > 0 && window.__curbsenseMapDebug?.advancedMarkerCount < 100"));
await waitFor(() => evaluate("window.__curbsenseMapDebug?.visibleZoneMarkerCount?.() === 0"));
const selectedZonePinCount = await evaluate("window.__curbsenseMapDebug?.advancedMarkerCount || 0");

await evaluate("window.__curbsenseMapDebug.setMapZoom(14)");
await waitFor(() => evaluate("window.__curbsenseMapDebug?.visibleZoneMarkerCount?.() === 8"));

await evaluate("window.__curbsenseMapDebug.selectFirstAvailable()");

await waitFor(() => evaluate("Boolean(document.querySelector('#space-reservation-panel'))"));

const contrastState = await evaluate(`(() => {
  const selectors = [
    ['destination search', '#input-map-destination'],
    ['recenter control', '#btn-recenter-map'],
    ['vehicle filters', '#map-vehicle-filter'],
    ['reservation panel', '#space-reservation-panel > div:first-of-type'],
    ['availability evidence', '#availability-evidence'],
    ['reservation details', '#reservation-details-section'],
    ['arrival selector', '#arrival-time-select'],
    ['permit option', 'label:has(#accessibility-permit-needed)'],
  ];
  const parseColor = (value) => {
    if (value === 'transparent') return null;
    const match = value.match(/rgba?\\(([^)]+)\\)/);
    if (!match) return { r: 0, g: 0, b: 0, a: 1, unparsed: true };
    const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  };
  const luminance = (color) => {
    const channel = (value) => {
      const normalized = value / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  };
  return selectors.map(([name, selector]) => {
    const element = document.querySelector(selector);
    if (!element) return { name, selector, missing: true };
    const style = getComputedStyle(element);
    const background = parseColor(style.backgroundColor);
    const foreground = parseColor(style.color);
    const ratio = background && foreground && !background.unparsed && !foreground.unparsed
      ? (Math.max(luminance(background), luminance(foreground)) + 0.05) / (Math.min(luminance(background), luminance(foreground)) + 0.05)
      : null;
    return { name, selector, backgroundAlpha: background?.a ?? 0, contrastRatio: ratio === null ? null : Number(ratio.toFixed(2)) };
  });
})()`);
const contrastFailures = contrastState.filter((item) => item.missing || item.backgroundAlpha < 0.99 || (item.contrastRatio !== null && item.contrastRatio < 3));

const drawerState = await evaluate(`(() => ({
  reservationPanel: Boolean(document.querySelector('#space-reservation-panel')),
  demonstrationHold: Boolean(document.querySelector('#btn-start-demonstration-hold')),
  arrivalTimeSelect: Boolean(document.querySelector('#arrival-time-select')),
  accessibilityPermitOption: Boolean(document.querySelector('#accessibility-permit-needed')),
  firstUseWalkthrough: !Boolean(document.querySelector('#first-use-walkthrough')),
  citizenDisplayNameApplied: document.body.innerText.includes('Map Tester'),
  mobileMapToolsAvailable: Boolean(document.querySelector('#btn-mobile-map-tools')),
  mobileMapToolsExpanded: Boolean(document.querySelector('#map-tools-panel') && !document.querySelector('#map-tools-panel').classList.contains('hidden')),
  mapSortSelect: Boolean(document.querySelector('#map-sort-select')),
  zoneSheetPassView: true,
}))()`);

await evaluate(`(() => {
  const arrival = document.querySelector('#arrival-time-select');
  const arrivalSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  arrivalSetter.call(arrival, '30m');
  arrival.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('#accessibility-permit-needed').click();
  document.querySelector('#btn-start-demonstration-hold').click();
})()`);
await waitFor(() => evaluate("document.body.innerText.includes('verified accessibility permit is required') || document.body.innerText.includes('only be attached to an accessible bay')"));
const permitEligibilityRejected = await evaluate("document.body.innerText.includes('verified accessibility permit is required') || document.body.innerText.includes('only be attached to an accessible bay')");
await evaluate("document.querySelector('#accessibility-permit-needed').click(); document.querySelector('#btn-start-demonstration-hold').click()");
await waitFor(() => evaluate("document.body.innerText.includes('arriving within 30 minutes')"));

const postHoldState = await evaluate(`(() => ({
  advancedPins: window.__curbsenseMapDebug?.advancedMarkerCount || 0,
  selectionSummary: document.body.innerText.includes('arriving within 30 minutes'),
  permitEligibilityRejected: ${permitEligibilityRejected},
  confirmationReceipt: Boolean(document.querySelector('[aria-label="Reservation confirmation receipt"]')),
  loadingOverlayVisible: Boolean(document.querySelector('[role="status"]')),
  demoHoldLabel: document.body.innerText.includes('15-second demonstration hold'),
}))()`);

const confirmationReceiptActions = await evaluate(`(() => ({
  download: Boolean(document.querySelector('#btn-download-confirmation-receipt')),
  share: Boolean(document.querySelector('#btn-share-confirmation-receipt')),
}))()`);
await evaluate("document.querySelector('#btn-download-confirmation-receipt')?.click()");
await waitFor(() => evaluate("Boolean(document.querySelector('[aria-label=\"Reservation confirmation receipt\"]'))"));
const reservationButtonAvailable = await evaluate("Boolean(document.querySelector('#btn-open-reservations'))");
await evaluate("document.querySelector('#btn-open-reservations')?.click()");
await waitFor(() => evaluate("document.querySelector('#tab-btn-pass')?.className.includes('bg-teal')"));
const receiptActionState = await evaluate(`(() => ({
  download: Boolean(document.querySelector('#btn-download-receipt')),
  share: Boolean(document.querySelector('#btn-share-receipt')),
}))()`);
await evaluate("document.querySelector('#btn-download-receipt')?.click()");
await waitFor(() => evaluate("document.body.innerText.includes('Receipt downloaded')"));
await evaluate("document.querySelector('#btn-checkin-pass')?.click()");
await waitFor(() => evaluate("document.body.innerText.includes('demo limit remaining')"));
const postCheckInDemoLimit = await evaluate("document.body.innerText.includes('Demo limit: 60 seconds after check-in') && document.body.innerText.includes('demo limit remaining')");
const reservationNavigationState = await evaluate(`(() => ({
  button: ${reservationButtonAvailable},
  passTabActive: document.querySelector('#tab-btn-pass')?.className.includes('bg-teal') ?? false,
}))()`);

const report = { ...initialMapState, selectedZonePinCount, ...postHoldState, ...drawerState, sortBehavior, confirmationReceiptActions, ...receiptActionState, postCheckInDemoLimit, ...reservationNavigationState, contrastFailures, surfaceModeState };

const duplicateLoaderErrors = consoleEvents.filter((entry) => entry.includes('included the Google Maps JavaScript API multiple times'));
const legacyMarkerWarnings = consoleEvents.filter((entry) => entry.includes('google.maps.Marker is deprecated'));

const outcome = {
  ...report,
  duplicateLoaderErrors: duplicateLoaderErrors.length,
  legacyMarkerWarnings: legacyMarkerWarnings.length,
};

console.log(JSON.stringify(outcome, null, 2));
socket.close();

if (outcome.contrastFailures.length || !outcome.button || !outcome.passTabActive || !outcome.surfaceModeState?.togglePresent || outcome.surfaceModeState.soft !== 'translucent' || outcome.surfaceModeState.after !== 'opaque' || !outcome.zoneSheetPassView || outcome.pinCount < 100 || outcome.zoneCount < 1 || outcome.zoneCount >= 10 || !outcome.selectedZonePinCount || outcome.selectedZonePinCount >= outcome.pinCount || !outcome.advancedPins || !outcome.reservationPanel || !outcome.demonstrationHold || !outcome.arrivalTimeSelect || !outcome.accessibilityPermitOption || !outcome.selectionSummary || !outcome.confirmationReceipt || outcome.loadingOverlayVisible || !outcome.demoHoldLabel || !outcome.permitEligibilityRejected || !outcome.mapSortSelect || !outcome.sortBehavior?.rateChangesOrder || !outcome.sortBehavior?.distanceChangesOrder || !outcome.confirmationReceiptActions?.download || !outcome.confirmationReceiptActions?.share || !outcome.download || !outcome.share || !outcome.postCheckInDemoLimit || outcome.duplicateLoaderErrors || outcome.legacyMarkerWarnings) {
  process.exitCode = 1;
}
