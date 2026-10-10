# Network QoS Monitor - TP5

Este repositorio contiene la entrega final del Trabajo Práctico 5: **Analizador y visualizador de calidad de red móvil en tiempo real con mapeo de cobertura personal**.

## Estructura del Proyecto

El proyecto está dividido en dos componentes principales:
- `/mobile`: Aplicación React Native (con Expo CNG) que actúa como cliente de recolección de métricas.
- `/backend`: Servidor de referencia en Node.js (Express) para pruebas de Throughput (Descarga/Subida).

## Arquitectura de la Solución

Se optó por una arquitectura de tres capas siguiendo las directrices del trabajo práctico:
1. **Capa de Adquisición de Datos Nativos (Native Bridge):** Se desarrolló un Expo Local Module nativo en **Kotlin** (`QosMetricsModule`) que interactúa con `TelephonyManager` en Android para extraer el operador de red y la intensidad de la señal (RSSI).
2. **Capa de Lógica y Red (Measurement Engine):** Un orquestador en JavaScript (`NetworkScanner.js`) coordina la obtención de coordenadas GPS, la ejecución de Pings a través de Sockets TCP reales (`react-native-tcp-socket`) y llamadas HTTP al backend para calcular el Throughput. 
3. **Capa de Presentación y Persistencia:** El estado global de la aplicación se maneja con **Zustand**. Cada medición se guarda localmente usando **SQLite** (`expo-sqlite`). La visualización geográfica utiliza una vista embebida con **Leaflet** y OpenStreetMap para renderizar el mapa de calor (Heatmap) libre de restricciones.

## Decisiones de Diseño

- **Expo CNG (Continuous Native Generation):** En lugar de utilizar React Native CLI puro, se optó por Expo CNG. Esto permite compilar módulos nativos (Kotlin) de forma estructurada sin lidiar con los clásicos problemas de desincronización de dependencias de Gradle/CMake en Windows.
- **Alternativa a Google Maps SDK:** Para cumplir el requisito del mapa de calor de forma óptima sin depender del bloqueo de facturación de Google Cloud Platform (API Keys de pago obligatorio), se implementó un `<WebView>` renderizando un motor de mapas Open Source (**Leaflet.js** con `leaflet.heat`). Esto garantiza que el Heatmap se dibuje correctamente usando los datos de la base de datos sin censura por falta de cuota en Google.
- **Manejo de Estado con Zustand:** Evita el *prop drilling* excesivo y permite que componentes aislados (como el Dashboard y el Historial) reaccionen instantáneamente cuando el orquestador guarda un nuevo dato en la base SQLite.

## Limitaciones Conocidas

- **Soporte de Plataforma:** El módulo nativo `QosMetricsModule` solo fue implementado en Android (`.kt`). Para soportar iOS, se requeriría añadir la implementación en Swift para `CoreTelephony`.
- **Valores de Señal (RSSI) en Emulador:** En emuladores de Android, la API de `TelephonyManager` suele devolver información hardcodeada (ej: `T-Mobile` y valores fijos de RSSI como `-100 dBm` o `-88 dBm`) dado que no existe un módem celular físico real haciendo lecturas de antenas RF.
- **Mapas Offline:** La visualización del mapa de calor con Leaflet requiere conexión a internet para descargar los "tiles" (imágenes de las calles) de OpenStreetMap. No se implementó caché de mapa para modo offline.

## Instrucciones de Ejecución

### 1. Iniciar el Backend
Desde la carpeta `backend`:
```bash
npm install
node server.js
```
El backend correrá en `http://0.0.0.0:3000`.

### 2. Compilar la App Móvil
Desde la carpeta `mobile`, instale las dependencias e inicie el proceso de compilación nativo.
Para compilar en la nube de EAS (recomendado para evitar errores de JDK/CMake en Windows):
```bash
npm install
npx eas-cli build -p android --profile preview
```
*(También puede usar `npx expo run:android` si cuenta con JDK 17, CMake y NDK instalados localmente).*
