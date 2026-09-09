# TP3: Login Bank Supabase 🏦

## 1. Instalación y Ejecución

### Requisitos previos
- Node.js (v18 o superior)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go en dispositivo móvil o Emulador de Android/iOS.

### Pasos para correr el proyecto
1. Clonar el repositorio.
2. Navegar a la carpeta del proyecto: `cd login-bank-supabase`
3. Instalar dependencias (usando flag de compatibilidad por dependencias de React 19):
   `npm install --legacy-peer-deps`
4. Crear un archivo `.env` en la raíz (ver sección Variables de Entorno).
5. Iniciar el servidor de desarrollo:
   `npx expo start`
6. Escanear el código QR con Expo Go (o presionar `a` para emulador Android).

## 2. Variables de Entorno (.env)
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables (reemplazar con los datos de Supabase):
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```
*(Nota de seguridad: La `service_role_key` NUNCA se incluye en este proyecto cliente).*

## 3. Documento de Decisiones y Adaptaciones
- **Fidelidad al Figma:** Se respetaron estrictamente los colores primarios (`#3629B7`), radios de borde (`16px`) y la familia tipográfica `Poppins` (importada nativamente vía `@expo-google-fonts/poppins`).
- **Adaptación de campos:** El diseño original de Figma solicitaba un campo "Phone Number" para el registro y recuperación. Siguiendo las instrucciones de la cátedra, este campo fue **adaptado a "Email"** en todas las pantallas.
- **Botón de Testeo (Ambiente Dev):** Debido a que el SO de Apple (iOS) bloquea los Custom Deep Links (`ibanktp://`) cuando se intentan abrir a través de la app de desarrollo Expo Go (requiriendo una compilación nativa `.ipa` para funcionar nativamente), se implementó un botón oculto de simulación en el `Home` para poder evaluar la pantalla de "Cambiar Contraseña" fluidamente sin necesidad de emuladores extra.
- **Arquitectura de Validaciones:** Se integró `react-hook-form` junto con resolvers de `zod` para garantizar la integridad de los datos antes de cualquier llamada a la API. Adicionalmente, se programó un checklist visual en tiempo real para mejorar la UX durante la creación de contraseñas.

## 4. Configuración Documentada de Supabase
Para que el flujo funcione correctamente, el dashboard de Supabase fue configurado con las siguientes políticas:
- **Política de contraseñas (Password Policy):** 
  - Longitud mínima: 8 caracteres.
  - Requisitos: Al menos una letra mayúscula, una letra minúscula, un número y un carácter especial/símbolo.
- **Reglas de Negocio y Rate Limits:** Se mantuvo el límite de seguridad anti-spam por defecto de Supabase (3 correos por hora para Auth). Los mensajes de error provenientes de límites de tasa o cuentas duplicadas fueron manejados con políticas de "anti-enumeración" en la UI (ocultando el error y mostrando siempre una pantalla de éxito neutral).
- **Redirect URLs (Deep Links):** 
  - Se configuró el esquema personalizado en el proyecto (`app.json` -> `scheme: "ibanktp"`).
  - Se agregaron las URLs `ibanktp://confirm` y `ibanktp://reset-password` en la configuración de *Authentication > URL Configuration > Redirect URLs* del dashboard de Supabase.

## 5. Flujos Demostrativos
*(Ver archivo de video/capturas adjunto en la entrega donde se prueba la cobertura total de las 5 pantallas, rutas protegidas y validaciones).*
