# AGENTS.md - Guia para Agentes de IA

## Resumen del Proyecto

Servo es una aplicacion de control de gastos mensuales para Android. Permite crear items de gasto con presupuesto, registrar gastos, y ver reportes. Funciona de forma autonoma con SQLite nativo o conectada a un servidor Express.

---

## Arquitectura

### Monorepo (Turborepo)
```
packages/server   → Backend Express + Prisma + SQLite
packages/client   → Frontend React + Capacitor + SQLite nativo
e2e/              → Tests E2E con Playwright
```

### Dual-Mode Architecture
La app opera en dos modos:
1. **Local**: SQLite nativo via `@capacitor-community/sqlite` - sin servidor
2. **Servidor**: Express API via HTTP - para sincronizacion o acceso remoto

La capa de abstraccion esta en `packages/client/src/services/api.ts` que detecta el modo y enruta al repositorio correspondiente.

### Flujo de Datos
```
Pagina React → api.ts → [localRepos.ts → SQLite] o [remoteFetch → Express → Prisma]
```

---

## Stack Tecnico

| Componente | Tecnologia | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 22+ |
| Package Manager | npm workspaces | 11+ |
| Build System | Turborepo | 2.x |
| Frontend | React + Vite | 19 / 6.x |
| Routing | React Router | 7.x |
| Styling | Tailwind CSS | 3.4+ |
| Backend | Express | 5.x |
| ORM | Prisma | 6.x |
| Database | SQLite | - |
| Native Bridge | Capacitor | 8.x |
| SQLite Native | @capacitor-community/sqlite | 8.x |
| Testing | Vitest | 3.x |
| E2E | Playwright | 1.40+ |
| Language | TypeScript | 5.5+ |

---

## Estructura de Archivos Clave

### Backend (packages/server)
```
src/
├── index.ts                 # Entry point Express
├── routes/                  # Endpoints REST
│   ├── userRoutes.ts
│   ├── expenseItemRoutes.ts
│   ├── expenseRoutes.ts
│   └── reportRoutes.ts
├── services/                # Logica de negocio
│   ├── userService.ts
│   ├── expenseItemService.ts
│   ├── expenseService.ts
│   └── reportService.ts
├── models/
│   └── prisma.ts            # Prisma client singleton
├── utils/
│   └── cycleUtils.ts        # Calculo de ciclos de mes
└── test/
    ├── setup.ts             # Setup Vitest
    └── helpers.ts           # Helpers de testing
```

### Frontend (packages/client)
```
src/
├── App.tsx                  # Root con AddExpenseProvider
├── main.tsx                 # Entry point React
├── components/
│   ├── Layout.tsx           # Shell con nav bar + FAB
│   ├── ProgressBar.tsx      # Barra de progreso
│   ├── FormComponents.tsx   # Modal, Input, Button, FormField
│   └── AddExpenseModal.tsx  # Modal global + contexto
├── pages/
│   ├── Dashboard.tsx        # Resumen del mes
│   ├── ExpenseItems.tsx     # CRUD items de gasto
│   ├── Expenses.tsx         # CRUD gastos
│   ├── Reports.tsx          # Historial de reportes
│   └── Settings.tsx         # Configuracion + selector de modo
├── hooks/
│   └── useApi.ts            # Hooks useApi y useMutation
├── services/
│   ├── api.ts               # API unificada (local/remote)
│   ├── db.ts                # Init SQLite nativo
│   ├── localRepos.ts        # Repositorios SQLite locales
│   └── cycleUtils.ts        # Logica de ciclos
└── test/
    └── setup.ts             # Setup Vitest
```

---

## Convenciones de Codigo

### TypeScript
- Strict mode habilitado
- Interfaces para todos los tipos de datos compartidos
- `export type` para re-exports de tipos
- Sin `any` - usar `unknown` si es necesario

### React
- Functional components con hooks
- Custom hooks para logica reutilizable (`useApi`, `useMutation`)
- Context para estado global (`AddExpenseProvider`)
- `useState` + `useEffect` para estado local
- Nombres de componentes en PascalCase

### CSS
- Tailwind CSS utility-first
- Dark mode por defecto (clase `dark` en `<html>`)
- Paleta: slate para grises, servo-500 para acento verde
- Sin CSS custom sallo sea absolutamente necesario

### Backend
- Servicios con funciones puras (sin estado)
- Prisma para acceso a BD
- Zod para validacion de inputs
- `runCatching` para manejo de errores

### Testing
- Vitest para unitario
- Testing Library para componentes React
- Playwright para E2E
- `fileParallelism: false` en Vitest para evitar race conditions con SQLite
- Cleanup de DB en `beforeEach` de tests de servicios

---

## Comandos Utiles

### Desarrollo
```bash
npm run dev              # Iniciar backend + frontend
npm run dev:server       # Solo backend (puerto 3000)
npm run dev:client       # Solo frontend (puerto 5173)
```

### Testing
```bash
npm test                 # Todos los tests
npm run test:server      # Backend (30 tests)
npm run test:client      # Frontend (6 tests)
npm run test:e2e         # E2E con Playwright
```

### Base de Datos
```bash
npm run db:migrate       # Migraciones Prisma
npm run db:seed          # Datos de ejemplo
npm run db:studio        # Prisma Studio
```

### Build APK
```bash
cd packages/client
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../../servo-debug.apk
```

---

## Buenas Practicas

### Commits
- Mensajes en espanol
- Formato: `tipo: descripcion corta`
- Tipos: feat, fix, refactor, test, docs, chore
- Ejemplo: `feat: agregar reportes mensuales`

### Ramas
- `main` - produccion estable
- `develop` - desarrollo activo
- `feat/*` - nuevas funcionalidades
- `fix/*` - correccion de bugs

### Testing
- Ejecutar `npm test` antes de cada commit
- Tests de servicios deben ser independientes
- Usar `cleanupTestDb()` en `beforeEach`
- Tests de componentes con Testing Library

### Seguridad
- No commitear `.env` ni secrets
- No exponer API keys en el frontend
- Usar HTTPS en modo servidor remoto
- Validar todos los inputs con Zod

### Performance
- Lazy loading de paginas con React.lazy
- Optimistic updates para operaciones CRUD
- Paginacion para listas grandes
- Compresion de assets en build

---

## Problemas Conocidos y Soluciones

### Tests en paralelo fallan
**Problema**: Tests de servicios comparten SQLite y causan race conditions.
**Solucion**: `fileParallelism: false` en `vitest.config.ts`.

### APK no conecta al servidor
**Problema**: `localhost` en el celular no apunta a la PC.
**Solucion**: Usar modo Local (SQLite nativo) o configurar la IP de la PC en Config > Servidor.

### Plugin Capacitor HTTP no compila
**Problema**: `@capacitor/http` tiene namespace faltante.
**Solucion**: Usar `CapacitorHttp` de `@capacitor/core` (Capacitor 8+).

### `isNativePlatform()` retorna false en Android
**Problema**: Deteccion de plataforma inestable.
**Solucion**: No depender de `isNativePlatform()` para logica critica. Usar el modo seleccionado por el usuario.

---

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

### Android SDK (para builds)
```bash
export ANDROID_HOME=~/android-sdk
export JAVA_HOME=~/android-sdk/jdk21
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
```

---

## Dependencias Clave

### Frontend
- `react`, `react-dom` - UI framework
- `react-router-dom` - Routing
- `tailwindcss` - Styling
- `@capacitor/core`, `@capacitor/android` - Bridge nativo
- `@capacitor-community/sqlite` - SQLite nativo
- `vite-plugin-pwa` - PWA support

### Backend
- `express` - HTTP server
- `@prisma/client` - ORM
- `zod` - Validacion
- `cors` - CORS middleware

### Dev
- `turbo` - Monorepo build
- `vitest` - Testing
- `@playwright/test` - E2E
- `tsx` - TypeScript execution
- `prisma` - DB migrations

---

## Extensiones Futuras

- Autenticacion de usuarios
- Sincronizacion entre dispositivos
- Exportar datos a CSV/PDF
- Graficos de gastos
- Notificaciones push
- Multiples monedas
- Categorias personalizadas
