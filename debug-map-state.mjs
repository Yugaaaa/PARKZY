const targets = await fetch('http://127.0.0.1:9333/json').then((response) => response.json());
const target = targets.find((item) => item.type === 'page');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let id = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const request = pending.get(message.id);
  pending.delete(message.id);
  request.resolve(message.result);
});

function evaluate(expression) {
  const requestId = ++id;
  socket.send(JSON.stringify({ id: requestId, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }));
  return new Promise((resolve) => pending.set(requestId, { resolve }));
}

const result = await evaluate(`JSON.stringify({
  text: document.body.innerText.slice(0, 1200),
  titles: [...document.querySelectorAll('[title]')].map((node) => node.getAttribute('title')).slice(0, 40),
  mapHtml: document.querySelector('#parking-map-wrapper')?.innerHTML.slice(0, 1000) || null,
  scripts: [...document.scripts].map((script) => script.src || script.id),
  mapStatus: document.querySelector('[role="status"]')?.textContent || null,
  googleReady: Boolean(window.google?.maps),
  googleMapKeys: window.google?.maps ? Object.keys(window.google.maps).slice(0, 25) : [],
  mapResources: performance.getEntriesByType('resource').map((entry) => entry.name).filter((name) => name.includes('maps')).slice(-10),
  controls: (() => {
    const destination = document.querySelector('#input-map-destination');
    const allFilter = document.querySelector('#map-vehicle-filter');
    const outerSurface = destination?.closest('.pointer-events-auto');
    return {
      destinationBackground: destination ? getComputedStyle(destination).backgroundColor : null,
      destinationColor: destination ? getComputedStyle(destination).color : null,
      filterBackground: allFilter ? getComputedStyle(allFilter).backgroundColor : null,
      filterColor: allFilter ? getComputedStyle(allFilter).color : null,
      overlayZIndex: outerSurface ? getComputedStyle(outerSurface).zIndex : null,
    };
  })(),
})`);

console.log(result.result.value);
socket.close();
