# Fullshine Detailing Platform

Plataforma completa de gestión para negocio de detailing automotriz en San Pedro de la Paz, Chile.

## Stack Técnico

- **Frontend:** Next.js 14 App Router + TypeScript strict + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Notificaciones:** Meta WhatsApp Cloud API
- **Calendario:** Google Calendar API v3
- **Deploy:** Netlify

## Estructura del Proyecto

```
fullshine/
├── src/
│   ├── app/
│   │   ├── reservar/          # Formulario público de reservas
│   │   ├── admin/             # Panel de administración
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── agenda/
│   │   │   ├── clientes/
│   │   │   ├── vehiculos/
│   │   │   └── servicios/
│   │   └── api/
│   │       ├── whatsapp/webhook/
│   │       └── gcal-oauth/callback/
│   ├── actions/               # Server Actions
│   ├── components/            # UI Components
│   ├── lib/                   # Supabase, WhatsApp, GCal
│   └── types/                 # TypeScript types
├── supabase/
│   ├── 01_schema.sql          # Tablas y enums
│   ├── 02_rls.sql             # Row Level Security
│   ├── 03_functions.sql       # Función anti-double-booking
│   ├── 04_triggers.sql        # Triggers updated_at + auth
│   ├── 05_gcal_trigger.sql    # Trigger Google Calendar
│   ├── 06_seed.sql            # 13 servicios + 39 precios
│   ├── 07_admin_user.sql      # Instrucciones usuario admin
│   └── functions/             # Edge Functions (Deno)
│       ├── create-gcal-event/
│       ├── delete-gcal-event/
│       └── send-reminders/
└── __tests__/                 # Jest tests
```

## Guía de Deploy

### 1. Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor y ejecutar los archivos en orden:
   ```
   01_schema.sql
   02_rls.sql
   03_functions.sql
   04_triggers.sql
   05_gcal_trigger.sql   ← Reemplazar TU_PROJECT_ID primero
   06_seed.sql
   ```
3. En **Authentication → Users → Add user**: crear el usuario admin
4. Ejecutar `07_admin_user.sql` con el UUID del usuario creado
5. En **Table Editor → bookings → Replication**: habilitar Realtime

### 2. Netlify

1. Crear cuenta en [netlify.com](https://netlify.com)
2. **Add new site → Import an existing project → GitHub**
3. Seleccionar el repositorio `fullshine`
4. Configuración de build:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Environment variables** → agregar:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
META_WHATSAPP_TOKEN=EAAxxxxxxx
META_PHONE_NUMBER_ID=1234567890
META_BUSINESS_ACCOUNT_ID=1234567890
META_WEBHOOK_VERIFY_TOKEN=fullshine_webhook_2024
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
NEXT_PUBLIC_APP_URL=https://fullshine.autos
NEXT_PUBLIC_BRANCH_PHONE=+56933654943
```

6. **Deploy site**

### 3. Edge Functions (Supabase CLI)

```bash
npm install -g supabase
supabase login
supabase link --project-ref TU_PROJECT_ID

# Deploy functions
supabase functions deploy create-gcal-event --no-verify-jwt
supabase functions deploy delete-gcal-event --no-verify-jwt
supabase functions deploy send-reminders --no-verify-jwt

# Set secrets
supabase secrets set META_WHATSAPP_TOKEN=EAAxxxxxxx
supabase secrets set META_PHONE_NUMBER_ID=1234567890
supabase secrets set GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
supabase secrets set GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### 4. WhatsApp Business (Meta)

1. Crear app en [developers.facebook.com](https://developers.facebook.com)
2. Agregar producto **WhatsApp**
3. Registrar número +56933654943
4. Crear y aprobar 4 templates:
   - `booking_confirmation_client`
   - `new_booking_admin`
   - `booking_reminder_client`
   - `booking_cancelled_client`
5. Cambiar app a modo **Live**
6. Configurar webhook: `https://fullshine.autos/api/whatsapp/webhook`

### 5. Google Calendar

1. Crear proyecto en [console.cloud.google.com](https://console.cloud.google.com)
2. Habilitar **Google Calendar API**
3. Crear credenciales OAuth 2.0 (Web application)
4. Agregar redirect URI: `https://fullshine.autos/api/gcal-oauth/callback`
5. Ir a `/admin/dashboard` → conectar Google Calendar

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev

# Tests
npm test

# TypeScript check
npx tsc --noEmit
```

## Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/reservar` | Formulario público de reservas (5 pasos) |
| `/admin/login` | Login del panel admin |
| `/admin/dashboard` | Dashboard con estadísticas del día |
| `/admin/agenda` | Agenda por fecha con cambio de estado |
| `/admin/clientes` | CRM de clientes |
| `/admin/vehiculos` | Registro de vehículos |
| `/admin/servicios` | Catálogo de servicios y precios |

## Fase 2.5 (Pendiente)

- Funcionalidad de reprogramación (`sendRescheduledToClient`)
- No bloquea el lanzamiento v1.0.0
