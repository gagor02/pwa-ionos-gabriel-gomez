# PWA Test IONOS - Gestor de Tareas

Este repositorio contiene la investigación teórica y el código fuente para la implementación y despliegue de una Progressive Web App (PWA) utilizando React, TypeScript, Docker y Nginx, servido desde una instancia de IONOS.

A continuación, documento los fundamentos técnicos detrás de la arquitectura de este proyecto:

## 1. Web App Manifest (`manifest.json`)
El manifest es básicamente el archivo de configuración que le dice al sistema operativo (ya sea Android, iOS o Windows) cómo tratar a la aplicación web cuando el usuario decide instalarla en su dispositivo.

* **`theme_color` y `background_color`:** El `theme_color` se encarga de pintar la barra de estado o de navegación del dispositivo para que haga match con la identidad visual de la app. Por otro lado, el `background_color` es el color que se muestra en la pantalla de carga (splash screen) justo antes de que el motor de React termine de montar la vista, evitando así pantallazos en blanco molestos.
* **`display`:** Aquí usamos el valor `standalone`. Esto hace que, al abrir la PWA instalada, se oculte la barra de direcciones del navegador y los controles de navegación estándar, dándole el look and feel de una aplicación nativa real.
* **El array de `icons`:** Pasamos distintos tamaños (normalmente 192x192 y 512x512) para que el sistema operativo tenga opciones y pueda renderizar el icono correctamente sin pixelarse, ya sea en el cajón de aplicaciones de un celular o en el escritorio de una PC.

## 2. Service Workers y su Ciclo de Vida
Los Service Workers son el motor lógico de la PWA. Son scripts que corren en un hilo en segundo plano, totalmente separados de la página web principal, lo que les permite funcionar incluso cuando la pestaña está cerrada. Actúan como un proxy de red, interceptando todo el tráfico entre la app y el servidor.

Su ciclo de vida consta de pasos muy marcados:
1.  **Registro:** Es cuando le decimos al navegador desde nuestro archivo principal (en este caso Vite/React) que detecte e instale el archivo `sw.js`.
2.  **Instalación (Installation):** Es la primera fase. Aquí aprovechamos para descargar y meter en la caché los archivos estáticos "core" de la app (el HTML, CSS y JS compilado). Si un solo archivo falla en descargarse, el Service Worker no se instala.
3.  **Activación (Activation):** Ocurre cuando el Service Worker toma el control de la página. Es el momento perfecto para hacer tareas de limpieza, como borrar cachés viejos si acabamos de subir una nueva versión de la app.
4.  **Fetching (Proxy):** Cada vez que la app pide algo (como un asset o datos), el evento `fetch` intercepta la petición y decide, según nuestra lógica, si lo busca en internet o lo sirve desde la memoria caché guardada.

## 3. Estrategias de Almacenamiento (Caching)
Dependiendo de qué tipo de recursos estemos manejando, el proxy del Service Worker puede utilizar diferentes estrategias:

* **Cache First (Caché primero):** Va directo a buscar el recurso a la caché local. Si lo encuentra, lo devuelve al instante ahorrando ancho de banda. Si no lo encuentra, entonces sí va a la red. Es ideal para cosas que casi no cambian, como logos, fuentes tipográficas y los *bundles* compilados.
* **Network First (Red primero):** Siempre intenta traer la versión más fresca desde internet. Si la petición falla, entonces entra en acción el fallback y devuelve la última versión que haya guardado en caché. Se usa mucho para datos dinámicos, listas de tareas o APIs que cambian constantemente.
* **Stale-While-Revalidate (Obsoleto mientras se revalida):** Es una estrategia híbrida excelente. Sirve el contenido desde la caché de inmediato para que la carga sea súper rápida, pero en segundo plano hace una petición a la red para actualizar la caché. Así, la *próxima vez* que el usuario entre, verá los datos nuevos.

## 4. Seguridad y TLS (El papel del HTTPS)
Los Service Workers son extremadamente poderosos porque pueden interceptar, modificar y redirigir todas las peticiones HTTP de la aplicación. Debido a esto, los navegadores imponen una restricción de seguridad estricta: **solo funcionan bajo HTTPS**.

Si permitieran usar Service Workers en conexiones no seguras (HTTP), cualquier atacante en una red pública podría hacer un ataque *Man-in-the-Middle*, inyectando código malicioso directamente en el proxy de la víctima, el cual se quedaría ejecutándose en segundo plano.

Además, el tema de los certificados impacta directamente en la experiencia del usuario. Por más que tengas tu `manifest.json` y tu Service Worker perfectos, si el servidor en IONOS no tiene un SSL válido, navegadores como Chrome bloquean por completo el "Install Prompt". Es decir, nunca le ofrecerán al usuario el botón o banner de instalación.