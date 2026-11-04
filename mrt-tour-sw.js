const VERSION      = '2026.11.04-v1.10';   // ← 每次發布只改這一行
const CACHE_NAME   = `mrttour-${VERSION}`;
const CORE_ASSETS  = [
  './',
  './mrt-tour.html',
  './mrt-tour-manifest.json',
  './icon-192.png',
  './icon-512.png',
  './st-zhongshan.webp',
  './st-nanjing.webp',
  './st-zhongxiao.webp',
  './st-daan.webp',
  './train.webp',
  './train-emu3000.webp',
  './train-puyuma.webp',
  './track.webp',
  './tra-sign.svg',
  './car1.webp',
  './car2.webp',
  './car3.webp',
  './cloud1.webp',
  './cloud2.webp',
  './cloud3.webp',
];

// 安裝：逐一預先快取（某個檔案缺少，例如還沒放 st-daan.webp，也不會讓整個安裝失敗）。
// 不立刻 skipWaiting，由使用者按「立即更新」後才切換，避免玩到一半被打斷。
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(CORE_ASSETS.map((u) => cache.add(u).catch(() => {})))
    )
  );
});

// 啟用：只清掉本遊戲的舊版本快取（不動同網域其他遊戲的快取）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.map((n) => n.startsWith('mrttour-') && n !== CACHE_NAME ? caches.delete(n) : null)
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (e.data === 'GET_VERSION') {
    e.source.postMessage({ type: 'VERSION', version: VERSION });
  }
});

// 網路優先，離線時退回快取
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
