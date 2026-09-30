# Booking Azurea

App de reservas de alojamientos hecha con **[Angular Native](https://ng-native.com)**: componentes
Angular que dibujan vistas nativas reales de iOS y Android, sobre el renderer Fabric de React
Native y dentro de una app Expo. No es una web ni es React: no hay DOM ni JSX.

Es un **template educativo**. Cada archivo empieza con un comentario que enlaza la página de la
documentación oficial en la que se basa, y el código sigue los patrones de esa documentación
siempre que es posible. La idea es leerlo junto a la doc.

No necesita backend: una **API local** dentro de la app responde a todas las peticiones HTTP.

## Qué enseña

| Pantalla | Conceptos | Documentación |
| --- | --- | --- |
| Pestañas *Explorar* / *Mis reservas* | Barra de pestañas nativa, badge como signal, un stack por pestaña | [Tabs](https://ng-native.com/packages/router/tabs) |
| Explorar | `resource()`, buscador nativo en la cabecera, título grande | [Native header](https://ng-native.com/packages/router/header), [Scroll view](https://ng-native.com/packages/components/scroll-view) |
| Detalle | Parámetro `:id` como input (`withComponentInputBinding`), push en el stack, barra sobre las pestañas | [Router](https://ng-native.com/packages/router), [Tabs](https://ng-native.com/packages/router/tabs#content-above-the-tab-bar) |
| Reservar (modal) | `nav.present()`, Signal Forms, validaciones, `submit()`, error del servidor en su campo, teclado | [Build a form](https://ng-native.com/guide/forms), [Screens](https://ng-native.com/packages/router/screens) |
| Mis reservas | Persistencia en el dispositivo con `Storage`, diálogo nativo de confirmación | [Storage](https://ng-native.com/packages/expo/storage), [Dialogs](https://ng-native.com/packages/device/dialogs) |
| Toda la app | Tokens de diseño como variables CSS, `light-dark()`, fuente propia | [Theming](https://ng-native.com/guide/theming), [Fonts](https://ng-native.com/packages/expo/fonts) |

## Empezar

Requisitos: Node 20.19+ (o 22.13+ / 24.3+), y para Android el SDK con un emulador, o Expo Go en tu móvil.

```sh
npm install
npm start           # Metro; pulsa "a" (Android) o "i" (iOS), o escanea el QR con Expo Go
npm run android     # directo al emulador de Android
npm run ios         # directo al simulador de iOS
```

Expo Go basta para desarrollar. Una build de release necesita una development build
(`npx expo run:android` / `npx expo run:ios`).

### Emulador de Android en Linux

Si Expo Go se queda en blanco (o negro) y no responde a toques, es la GPU del emulador, no la
app. Arráncalo con renderizado por software y dale al menos 4 GB de RAM:

```sh
~/Android/Sdk/emulator/emulator @<tu-AVD> -gpu swangle_indirect
```

Detalles en [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## Comandos

```sh
npm test                                   # Vitest en Node, contra una capa nativa falsa: sin simulador
npx vitest run src/app/features/booking    # los tests de una carpeta
npx vitest run -t "saves a valid booking"  # un test por nombre
npm run typecheck                          # ngc con strictTemplates: también revisa las plantillas
```

## Cómo está hecho

```
src/
  main.ts                    registra la app, carga las fuentes y monta con los providers
  app/
    app.ts                   raíz: el stack nativo y los tokens de diseño (variables CSS)
    app.config.ts            providers compartidos por main.ts y los tests: router y HttpClient
    app.routes.ts            rutas: pestañas -> un stack por pestaña; el formulario como modal
    global-styles.ts         @font-face y la fuente de toda la app
    core/
      models.ts              tipos: Stay, Booking, BookingRequest, ApiError
      booking-rules.ts       cálculo del total y fechas, compartido por la app y la API
      stays.service.ts       GET /api/stays, GET /api/stays/:id
      bookings.service.ts    POST /api/bookings + reservas guardadas en el dispositivo
      mock-api/
        mock-api.interceptor.ts   la "API": responde a /api/... sin salir a la red
        stays.data.ts             los alojamientos de ejemplo
    features/
      tabs/                  barra de pestañas y el stack de cada pestaña
      explore/               lista y buscador
      stay-detail/           detalle
      booking/               formulario de reserva
      bookings/              mis reservas
```

### La API local

La app usa un `HttpClient` real (`provideNativeHttpClient()`), pero un `HttpInterceptorFn`
responde a toda petición que empiece por `/api/`, con una pequeña latencia simulada:

- `GET /api/stays` y `GET /api/stays/:id` devuelven los datos de `stays.data.ts`.
- `POST /api/bookings` valida en el "servidor" y devuelve la reserva con su total. Para poder ver
  un error del servidor en el formulario, **pasado mañana siempre está completo** (409) y se
  rechazan más huéspedes de los permitidos (422).

Para conectar un backend real, quita el interceptor de `app.config.ts` y apunta `API_URL` a tu
servidor. Los servicios y las pantallas no cambian.

Los servicios devuelven promesas y las pantallas las leen con `resource({ loader })`. Así un
test puede sustituir un servicio entero por un objeto simple
([Testing with services](https://ng-native.com/packages/testing/testing-services)).

### Diseño: Azurea

El sistema visual es **Azurea**: azul rey, superficies de "vidrio" y la tipografía
Plus Jakarta Sans.

- Los tokens (colores, sombras, espacios, radios) son variables CSS definidas en `app.ts` con
  `light-dark()`. Cruzan los límites de los componentes, así que cualquier pantalla usa
  `var(--royal)` y recibe el azul correcto en tema claro u oscuro.
- La cabecera y la barra de pestañas nativas no leen CSS; `app.config.ts` repite esos colores en
  `withHeaderDefaults` y `withTabDefaults`.
- Nativo no tiene `backdrop-filter`, así que el vidrio es un relleno translúcido sobre el fondo
  degradado "Aura".
- Las fuentes (pesos 400-800, licencia OFL) están en `assets/fonts/`.

## Tests

Los tests corren en Node sin simulador: `render()`, consultas por rol o texto, e interacciones
con `userEvent`, todo de `@ng-native/testing`.

- `app.test.ts`: la app completa con sus providers reales; abre un alojamiento.
- `explore.page.test.ts`: servicio sustituido por un stub; escribe en el buscador nativo.
- `booking.page.test.ts`: validaciones, total en vivo, error del servidor y reserva guardada.
- `bookings.page.test.ts`: cancelar con el diálogo sustituido.

La capa nativa falsa no aplica todas las restricciones de Android. Un cambio de layout nativo
se verifica también en el emulador.

## Problemas conocidos

Antes de depurar, lee [KNOWN_ISSUES.md](KNOWN_ISSUES.md). Incluye por qué la lista usa
`<scroll-view>` y no `<virtual-list>`: en `@ng-native` 0.1.3 este último rompe en Android.

## Stack

Angular 22 (signals, zoneless, AOT) · Angular Native 0.1.3 · Expo SDK 57 · React Native 0.86
(Fabric) · Signal Forms · Vitest.

## Licencia

MIT, heredada del template `@ng-native/template` (ver [LICENSE](LICENSE)). La fuente Plus Jakarta
Sans se distribuye bajo la SIL Open Font License ([assets/fonts/OFL.txt](assets/fonts/OFL.txt)).
