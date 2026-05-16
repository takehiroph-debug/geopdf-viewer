const CACHE = 'geopdf-v8';
const SHARE_CACHE = 'geopdf-share';

// 繧､繝ｳ繧ｹ繝医・繝ｫ譎ゅ↓繧｢繝励Μ繧ｷ繧ｧ繝ｫ繧偵く繝｣繝・す繝･
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./', './manifest.json', './icon.svg']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== SHARE_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Share Target: iOS縺ｮ蜈ｱ譛峨す繝ｼ繝医°繧臼DF繧貞女縺大叙繧・  if (e.request.method === 'POST') {
    e.respondWith(handleShareTarget(e.request));
    return;
  }

  // 繧ｭ繝｣繝・す繝･蜆ｪ蜈茨ｼ医が繝輔Λ繧､繝ｳ蟇ｾ蠢懶ｼ・  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./')))
  );
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf');

    if (file && file.size > 0) {
      // 蜿励￠蜿悶▲縺蘖DF繝輔ぃ繧､繝ｫ繧剃ｸ譎ゅく繝｣繝・す繝･縺ｫ菫晏ｭ・      const cache = await caches.open(SHARE_CACHE);
      await cache.put('pending', new Response(await file.arrayBuffer(), {
        headers: {
          'Content-Type': 'application/pdf',
          'X-Filename': encodeURIComponent(file.name),
        }
      }));
    }
  } catch (_) {}

  // 繝｡繧､繝ｳ繝壹・繧ｸ縺ｸ繝ｪ繝繧､繝ｬ繧ｯ繝茨ｼ・share=1 縺ｧ繝輔ぃ繧､繝ｫ蜿励￠蜿悶ｊ繧帝夂衍・・  return Response.redirect('./?share=1', 303);
}

