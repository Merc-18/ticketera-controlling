# Ticketera Controlling

Sistema de gestión de tickets y proyectos para el área de Controlling de Gilat Perú. Permite administrar solicitudes internas y externas, gestionar flujos de desarrollo y proyectos administrativos, y hacer seguimiento de SLAs en tiempo real.

---

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Roles y permisos](#roles-y-permisos)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Despliegue](#despliegue)

---

## Funcionalidades

### Gestión de solicitudes
- Portal público para envío de solicitudes (`/request`)
- Página de seguimiento para solicitantes (`/tracking`)
- Cálculo automático de fechas SLA según tipo, prioridad y días hábiles
- Bandeja de entrada para revisar, aprobar o rechazar solicitudes
- Importación masiva desde planificadores externos (Excel)

### Tableros de proyectos
- **Kanban** con drag-and-drop por fases
- **Tabla** con filtros, ordenamiento y exportación CSV
- **Gantt** para visualización de cronograma
- **Roadmap** para planificación de alto nivel
- Doble flujo: Desarrollo (Backlog → Deploy) y Administrativo (Backlog → UAT)

### SLA y trazabilidad
- Fechas SLA calculadas en días hábiles (sin fines de semana)
- Alertas y notificaciones cuando un proyecto se acerca al vencimiento
- Log de actividad con historial completo de cambios
- Bloqueos con motivo registrado
- Papelera con recuperación por admins

### Dashboard y analítica
- Conteo de proyectos por estado y prioridad
- Vista de carga de trabajo por miembro del equipo
- Métricas por área (SAQ, DDC, QA, ATC, AASS, PMO, OC, Controlling)

### Administración
- Gestión completa de usuarios (CRUD)
- Activación / desactivación de cuentas
- Reloj del servidor en zona horaria America/Lima
- Control de acceso por rol

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Drag & Drop | @hello-pangea/dnd |
| Gráficas | Recharts |
| Fechas | date-fns (locale es-PE) |
| Excel | xlsx |
| Despliegue | Vercel |

---

## Arquitectura

```
src/
├── components/
│   ├── admin/          # Gestión de usuarios, carga de trabajo, papelera
│   ├── auth/           # Login y rutas protegidas
│   ├── boards/         # Kanban, tabla, Gantt, roadmap
│   ├── dashboard/      # Estadísticas y analítica
│   ├── projects/       # Modal de proyecto, comentarios, checklists
│   ├── requests/       # Formulario público, tracking, bandeja
│   ├── notifications/  # Centro de notificaciones
│   ├── layout/         # Estructura de página
│   └── ui/             # Toast y componentes compartidos
├── hooks/              # Custom hooks (useProjects, useAuth, useRequests…)
├── lib/                # Supabase client, constantes, SLA config, utilidades
├── types/              # Interfaces TypeScript generadas desde Supabase
└── App.tsx             # Enrutamiento principal
```

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| **Superadmin** | Control total: usuarios, todos los proyectos, papelera |
| **Admin** | CRUD de usuarios, gestión completa de proyectos, papelera, reloj |
| **Developer** | Crear y editar proyectos, ver carga de trabajo y solicitudes |
| **Viewer** | Solo lectura en tableros y proyectos |

---

## Instalación local

### Requisitos
- Node.js 18+
- npm 9+
- Cuenta en [Supabase](https://supabase.com)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Merc-18/ticketera-controlling.git
cd ticketera-controlling

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

Ambos valores se encuentran en el panel de Supabase → Settings → API.

---

## Base de datos

El esquema está documentado en los archivos SQL incluidos en el repositorio. Ejecutar en orden desde el SQL Editor de Supabase:

| Archivo | Descripción |
|---|---|
| `admin_setup.sql` | Configuración inicial y roles |
| `sla_migration.sql` | Campos y lógica de SLA |
| `tags_migration.sql` | Sistema de etiquetas |
| `notifications_migration.sql` | Tabla de notificaciones |
| `int_number_migration.sql` | Numeración de solicitudes |
| `migrate_number_format.sql` | Formato de numeración |
| `rls_fix.sql` | Políticas de Row Level Security |
| `seed_data.sql` | Datos iniciales de referencia |

---

## Despliegue

El proyecto está configurado para Vercel. Para desplegar:

```bash
npm i -g vercel
vercel --prod
```

O conectar el repositorio directamente desde el dashboard de Vercel y configurar las variables de entorno en Settings → Environment Variables.
