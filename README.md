# Servo - Control de Gastos Mensuales

App para el seguimiento de gastos mensuales con ciclo personalizable. Funciona de forma autonoma en Android con SQLite nativo o conectada a un servidor remoto.

---

## Caracteristicas

- Ciclo de mes personalizable (dia inicio/fin)
- Items de gasto con presupuesto mensual recurrente
- Registro de gastos por item
- Calculo automatico de saldos y porcentajes
- Reportes mensuales historicos
- Modo autonomo (SQLite nativo en Android)
- Modo servidor remoto (Express + Prisma)
- PWA instalable en Android
- Tests unitarios y E2E

---

## Stack Tecnologico

| Capa | Tecnologia | Proposito |
|------|-----------|-----------|
| Frontend | React 19 + Vite | UI SPA rapida |
| Estilos | Tailwind CSS | CSS utility-first |
| Navegacion | React Router v7 | Routing SPA |
| DB Local | Capacitor SQLite | Almacenamiento nativo Android |
| Backend | Express + TypeScript | API REST (modo servidor) |
| ORM | Prisma | Acceso a BD tipado (servidor) |
| Database | SQLite | Almacenamiento local |
| Testing Unit | Vitest | Tests rapidos |
| Testing E2E | Playwright | Tests de integracion |
| PWA | vite-plugin-pwa | Instalable en Android |
| Android | Capacitor | Wrapper nativo |

---

## Modos de Operacion

### Modo Local (autonomo)
- SQLite nativo en el celular
- Sin necesidad de servidor ni internet
- Datos persisten entre sesiones
- Seleccionar "Local" en Config > Modo de operacion

### Modo Servidor (remoto)
- Conecta a Express en tu PC via HTTP
- Seleccionar "Servidor" en Config
- Poner la IP de tu PC en la red local
- Util para sincronizar o acceder via HTTPS

---

## Instalacion

```bash
# 1. Clonar repositorio
git clone https://github.com/renzoperagallo/servo.git
cd servo

# 2. Instalar dependencias
npm install

# 3. Configurar base de datos (solo para modo servidor)
npm run db:migrate

# 4. Cargar datos de ejemplo
npm run db:seed
```

---

## Desarrollo

```bash
# Iniciar servidor y cliente en modo desarrollo
npm run dev

# Solo servidor (puerto 3000)
npm run dev:server

# Solo cliente (puerto 5173)
npm run dev:client
```

---

## Testing

```bash
# Ejecutar todos los tests
npm test

# Tests del servidor (30 tests)
npm run test:server

# Tests del cliente (6 tests)
npm run test:client

# Tests E2E (requiere servidor corriendo)
npm run test:e2e
```

---

## Generar APK

```bash
# 1. Configurar variables de entorno
export ANDROID_HOME=~/android-sdk
export JAVA_HOME=~/android-sdk/jdk21
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH

# 2. Build del frontend y sync
cd packages/client
npm run build
npx cap sync android

# 3. Generar APK
cd android
./gradlew assembleDebug

# 4. Copiar APK
cp app/build/outputs/apk/debug/app-debug.apk ../../servo-debug.apk
```

---

## Base de Datos

```bash
# Ejecutar migraciones (modo servidor)
npm run db:migrate

# Cargar datos de ejemplo
npm run db:seed

# Abrir Prisma Studio
npm run db:studio
```

---

## Estructura del Proyecto

```
servo/
├── packages/
│   ├── server/                    # Backend Express (modo servidor)
│   │   ├── src/
│   │   │   ├── routes/            # Endpoints REST
│   │   │   ├── services/          # Logica de negocio
│   │   │   ├── models/            # Prisma client
│   │   │   ├── utils/             # Utilidades (cycleUtils)
│   │   │   └── test/              # Helpers de testing
│   │   └── prisma/
│   │       ├── schema.prisma      # Definicion de modelos
│   │       ├── migrations/        # Migraciones automaticas
│   │       └── seed.ts            # Datos de ejemplo
│   │
│   └── client/                    # Frontend React + Capacitor
│       ├── src/
│       │   ├── components/        # Componentes reutilizables
│       │   │   ├── Layout.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   ├── FormComponents.tsx
│       │   │   └── AddExpenseModal.tsx
│       │   ├── pages/             # Paginas/vistas
│       │   │   ├── Dashboard.tsx
│       │   │   ├── ExpenseItems.tsx
│       │   │   ├── Expenses.tsx
│       │   │   ├── Reports.tsx
│       │   │   └── Settings.tsx
│       │   ├── hooks/             # Custom hooks
│       │   │   └── useApi.ts
│       │   └── services/          # Capa de datos
│       │       ├── api.ts         # API unificada (local/remote)
│       │       ├── db.ts          # SQLite nativo (Capacitor)
│       │       ├── localRepos.ts  # Repositorios SQLite
│       │       └── cycleUtils.ts  # Logica de ciclos
│       ├── android/               # Proyecto Android (Capacitor)
│       └── capacitor.config.json
│
├── e2e/                           # Tests E2E con Playwright
├── servo-debug.apk               # APK compilada
├── package.json                   # Root workspace
├── turbo.json                     # Turborepo config
├── AGENTS.md                      # Guia para agentes de IA
└── README.md
```

---

## API REST (Modo Servidor)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/user/settings` | Configuracion del usuario |
| `PUT` | `/api/user/settings` | Actualizar configuracion |
| `GET` | `/api/expense-items` | Listar items de gasto |
| `POST` | `/api/expense-items` | Crear item |
| `PUT` | `/api/expense-items/:id` | Actualizar item |
| `DELETE` | `/api/expense-items/:id` | Eliminar item |
| `GET` | `/api/expenses` | Listar gastos del mes |
| `POST` | `/api/expenses` | Registrar gasto |
| `DELETE` | `/api/expenses/:id` | Eliminar gasto |
| `GET` | `/api/expenses/summary` | Resumen del mes |
| `GET` | `/api/reports` | Listar reportes |
| `POST` | `/api/reports/generate` | Generar reporte |
| `GET` | `/api/reports/:id` | Obtener reporte |

---

## Arquitectura de Datos

### Modo Local (SQLite nativo)
```
┌──────────────┐     ┌──────────────┐     ┌──────────┐
│    User      │     │ ExpenseItem  │     │ Expense  │
├──────────────┤     ├──────────────┤     ├──────────┤
│ id (PK)      │◄────│ userId (FK)  │     │ id (PK)  │
│ cycleStartDay│     │ id (PK)      │◄────│ itemId   │
│ cycleEndDay  │     │ name         │     │ amount   │
│ createdAt    │     │ monthlyBudget│     │ date     │
└──────────────┘     │ createdAt    │     │ userId   │
                     └──────────────┘     └──────────┘
```

### Modo Servidor (Prisma + SQLite)
Mismo esquema con Prisma ORM y migraciones automaticas.

---

## Scripts Disponibles

```bash
npm run dev          # Iniciar todo en modo desarrollo
npm run dev:server   # Solo backend
npm run dev:client   # Solo frontend
npm run build        # Build de produccion
npm test             # Ejecutar todos los tests
npm run test:server  # Tests del backend
npm run test:client  # Tests del frontend
npm run test:e2e     # Tests E2E
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Cargar datos de ejemplo
npm run db:studio    # Abrir Prisma Studio
```

---

## Requisitos para generar APK

- JDK 21 (Temurin)
- Android SDK (platform-tools, build-tools 35, platforms android-35)
- Node.js 22+
- npm 11+

---

## Licencia

Proyecto privado.
