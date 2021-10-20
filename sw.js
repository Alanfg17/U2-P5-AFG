console.log("Sw: Limpio");

const CACHE_STATIC_NAME = 'static-v1'
const DYMAMIC_CACHE_NAME = 'dynamic-v1'
const CACHE_INMUTABLE_NAME = 'inmutable-v1'

function cleanCache(cacheName, sizeItems) {
  caches.open(cacheName)
    .then(cache => {
      cache.keys().then(keys => {
        console.log(keys)
        if (keys.length >= sizeItems) {
          cache.delete(keys[0]).then(() => {
            cleanCache(cacheName, sizeItems)
          })
        }
      })

    })
}

self.addEventListener('install', (event) => {
  //Crear el caché y almacenar el APPSHELL
  const promesaCache = caches.open(CACHE_STATIC_NAME)
    .then(cache => {
      return cache.addAll([
        '/U2-P5-AFG/',
        '/U2-P5-AFG/index.html',
        '/U2-P5-AFG/css/page.css',
        '/U2-P5-AFG/images/inicio.jpg',
        '/U2-P5-AFG/js/app.js',
        '/U2-P5-AFG/pages/ViewOffline.html',
        '/U2-P5-AFG/images/notfound.jpg',
      ]);
    });

  const promInmutable = caches.open(CACHE_INMUTABLE_NAME)
    .then(cache => {
      return cache.addAll([
        'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',

      ])
    })
  event.waitUntil(Promise.all([promesaCache, promInmutable]))
})


self.addEventListener('activate', (event) => {
  const resDelCache = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== CACHE_STATIC_NAME && key.includes('static')) {
        return caches.delete(key)
      }
    })
  })
  event.waitUntil(resDelCache)
})


self.addEventListener("fetch", (event) => {
  //1. Only chaché
  // event.respondWith(caches.match(event.request))

  //2. Caché with network fallback
  // Primero va a buscar en caché y sino lo encuentra va a la red

  /* const respuesta = caches.match(event.request)
        .then(response => {
            if(response) return response

            console.log("No está en caché", event.request.url)
            return fetch(event.request)
                .then(res => {
                    caches.open(CACHE_DYNAMIC_NAME).then(cache => cache.put(event.request, res).then(() => {
                        cleanCache(CACHE_DYNAMIC_NAME, 6)
                    }))
                    
                    return res.clone()
                })
        })

        event.respondWith(respuesta) */

  //2. Caché with network fallback
  // Primero va a buscar en caché y sino lo encuentra va a la red
  const respuestaCache = caches.match(event.request)
    .then(resp => {
      if (resp) {
        return resp
      }
      console.log("No esta en caché ", event.request.url);

      return fetch(event.request)
        .then(respNet => {
          caches.open(DYMAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, respNet).then(ok => {
                cleanCache(DYMAMIC_CACHE_NAME, 5)
              })

            })
          return respNet.clone()
        }).catch((err) => {
          console.log('Error al solicitar el recurso');
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/pages/ViewOffline.html')
          }

          if (event.request.headers.get('accept').includes('image')) {
            return caches.match('/images/notfound.jpg')
          }

        })
    });

  event.respondWith(respuestaCache);

  /* //3. Network cache fallback
    const promesa = fetch(event.request).then(res => {

        if(!res){
            return caches.match(event.request)
            .then(respuestCache => {
                if(!respuestCache){
                    console.log('Respondemos con algo generico');
                }
                console.log(respuestCache);
                return respuestCache
            })
            .catch(error=>{
                console.log({error});
            })
        }
        caches.open(CACHE_DYNAMIC_NAME)
        .then(cache =>{
            cache.put(event.request,res)
            cleanCache(CACHE_DYNAMIC_NAME,5)

        })
        return res.clone()
    }).catch(error=>{
        return caches.match(event.request)
        .then(respuestCache => {
            console.log(respuestCache);
        })
        .catch(error=>{
            console.log({error});
            return respuestCache
        })
    })
    event.respondWith(promesa) */
});
