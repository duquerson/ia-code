# API REST de Notas - Elysia.js

Una aplicación API REST moderna y escalable para gestión de notas, construida con arquitectura limpia y mejores prácticas de desarrollo.

## 📋 Características Principales

- ✅ **CRUD completo** - Operaciones Create, Read, Update, Delete
- ✅ **Validación robusta** - Esquemas Zod con safeParse para manejo seguro de errores
- ✅ **Arquitectura MVC** - Separación clara de responsabilidades
- ✅ **Manejo de errores avanzado** - Clase personalizada que extiende Error nativo
- ✅ **Logging estructurado** - Sistema de logs con diferentes niveles
- ✅ **Configuración por ambiente** - Variables de entorno validadas
- ✅ **Código limpio** - Comentarios mínimos, autoexplicativo
- ✅ **TypeScript** - Tipado estricto para mayor seguridad

## 🏗️ Arquitectura del Proyecto

### Patrón MVC con Métodos Estáticos e Inmutables

La aplicación implementa un patrón MVC avanzado con características de seguridad adicionales:

```
src/
├── config/           # Configuración de base de datos y aplicación
├── middleware/       # Validadores y middlewares reutilizables
├── models/          # Modelos de datos (capa de datos)
├── routes/          # Controladores y rutas (capa de presentación)
├── services/        # Lógica de negocio (capa de negocio)
├── schema/          # Esquemas de validación Zod y Mongoose
├── types/           # Definiciones de tipos TypeScript
└── utils/           # Utilidades: errores, logger, etc.
```

### Características de Seguridad

- ✅ **Métodos estáticos**: Todos los métodos son estáticos para prevenir instanciación innecesaria
- ✅ **Inmutabilidad**: Los métodos están congelados usando `Object.freeze()`
- ✅ **Patrón Singleton**: Una sola instancia controlada del servicio
- ✅ **Constructores privados**: Prevención de instanciación directa
- ✅ **Solo lectura**: Los métodos no pueden ser alterados después de su creación

### Flujo de Datos con Seguridad

```mermaid
graph TD
    A[Cliente HTTP] --> B[Rutas /api/notes]
    B --> C[Controlador Estático]
    C --> D[Servicio Estático]
    D --> E[Modelo Notes]
    E --> F[Base de Datos MongoDB]

    C --> G[Validación Zod]
    G --> H[Respuesta HTTP]

    D --> I[Manejo de Errores]
    I --> J[Respuesta de Error]

    K[Métodos Inmutables] -.-> C
    K -.-> D
    L[Object.freeze()] -.-> K
```

### Diagrama de Componentes con Seguridad

```mermaid
graph TB
    subgraph "Capa de Presentación"
        R[Rutas Estáticas]
        C[Controlador Estático]
    end

    subgraph "Capa de Negocio"
        S[Servicio Estático]
        SI[Singleton Instance]
    end

    subgraph "Capa de Datos"
        M[Modelo]
        DB[(MongoDB)]
    end

    subgraph "Características de Seguridad"
        F[Object.freeze()]
        I[Métodos Inmutables]
        P[Prevención de Alteración]
    end

    R --> C
    C --> S
    S --> SI
    SI --> M
    M --> DB

    F --> I
    I --> P
    P -.-> S
    P -.-> C
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- MongoDB 5+
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ia-code

# Instalar dependencias
npm install

# Construir el proyecto
npm run build
```

### Configuración de Entorno

Crear archivo `config.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=4321

# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/notesapp

# Entorno de ejecución
NODE_ENV=development

# Nivel de logging
LOG_LEVEL=info

# Configuración adicional (opcional)
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Variables de Entorno Requeridas

| Variable | Descripción | Requerida | Valor por Defecto |
|----------|-------------|-----------|-------------------|
| `MONGODB_URI` | URI de conexión a MongoDB | ✅ | - |
| `PORT` | Puerto del servidor HTTP | ❌ | 4321 |
| `NODE_ENV` | Entorno de ejecución | ❌ | development |
| `LOG_LEVEL` | Nivel de logging | ❌ | info |

## 📖 Uso de la API

### Endpoints Principales

#### Notas CRUD

| Método | Endpoint | Descripción | Body/Solicitud |
|--------|----------|-------------|----------------|
| GET | `/api/notes` | Obtener todas las notas | - |
| GET | `/api/notes/:id` | Obtener nota por ID | `id`: ObjectId |
| POST | `/api/notes` | Crear nueva nota | Ver esquema abajo |
| PUT | `/api/notes/:id` | Actualizar nota completa | `id` + datos |
| PATCH | `/api/notes/:id` | Actualizar nota parcialmente | `id` + campos |
| DELETE | `/api/notes/:id` | Eliminar nota | `id` |

#### Esquemas de Validación (Zod)

**Crear/Actualizar Nota:**
```typescript
{
  content: string;      // 1-2000 caracteres, requerido
  date?: string | Date; // Fecha opcional (ISO string o Date)
  important?: boolean;  // Importante (por defecto: false)
}
```

**ID de Nota:**
```typescript
string; // 24 caracteres hexadecimales (ObjectId de MongoDB)
```

### Ejemplos de Uso

#### Crear una nota
```bash
curl -X POST http://localhost:4321/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Esta es una nota importante",
    "important": true
  }'
```

#### Obtener todas las notas
```bash
curl http://localhost:4321/api/notes
```

#### Actualizar una nota
```bash
curl -X PATCH http://localhost:4321/api/notes/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Contenido actualizado",
    "important": false
  }'
```

## 🔧 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Verificar tipos TypeScript
npm run type-check

# Ejecutar pruebas (si existen)
npm test
```

### Estructura del Código

#### Configuración (`src/config/`)
- `db.ts` - Conexión y configuración de MongoDB
- `config.ts` - Variables de entorno y configuración general

#### Modelo de Datos (`src/models/`)
- `Notes.ts` - Modelo Mongoose para notas

#### Esquemas de Validación (`src/schema/`)
- `note.ts` - Esquemas Zod y esquema Mongoose

#### Lógica de Negocio (`src/services/`)
- `notes.service.ts` - Toda la lógica de negocio de notas

#### Controladores (`src/routes/`)
- `notes.controller.ts` - Orquestación de peticiones HTTP
- `notes.routes.ts` - Definición de rutas y validaciones

#### Utilidades (`src/utils/`)
- `errors.ts` - Clase de error personalizada
- `logger.ts` - Sistema de logging estructurado

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Elysia.js** | 1.4.9 | Framework web rápido y ligero |
| **TypeScript** | 5.9.3 | Tipado estático para JavaScript |
| **MongoDB** | 8.19.1 | Base de datos NoSQL (con Mongoose) |
| **Zod** | 4.1.12 | Validación de esquemas TypeScript |
| **Node.js** | 18+ | Runtime de JavaScript |

## 📝 Manejo de Errores

### Clase de Error Personalizada

La aplicación utiliza una clase `AppError` que extiende `Error` nativo con características avanzadas:

```typescript
class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown>;

  // Métodos adicionales:
  // - toJSON(): serialización para respuestas HTTP
  // - log(): registro automático de errores
}
```

### Arquitectura con Métodos Estáticos

Los servicios utilizan métodos estáticos e inmutables para mayor seguridad:

```typescript
export class NotesService {
    // Constructor privado - no se puede instanciar
    private constructor() {
        Object.freeze(this);
    }

    // Método estático público
    public static async getAllNotes(): Promise<Note[]> {
        // Lógica inmutable
    }

    // Método privado estático para formateo
    private static formatNote(note: Record<string, unknown>): Note {
        return Object.freeze({
            // Datos de solo lectura
        });
    }
}
```

### Códigos de Error

| Código | Status | Descripción |
|--------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos |
| `INVALID_ID` | 400 | ID de MongoDB mal formateado |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `DUPLICATE_ERROR` | 409 | Recurso duplicado |
| `DATABASE_ERROR` | 500 | Error interno de base de datos |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

## 🔍 Logging

### Niveles de Log

- **ERROR** - Errores que impiden el funcionamiento normal
- **WARN** - Advertencias de posibles problemas
- **INFO** - Información general del flujo de la aplicación
- **DEBUG** - Información detallada para debugging

### Ejemplo de Log

```json
{
  "timestamp": "2025-10-15T18:34:19.058Z",
  "level": "INFO",
  "message": "Nota creada exitosamente",
  "meta": {
    "id": "507f1f77bcf86cd799439011",
    "contentPreview": "Esta es una nota...",
    "important": true
  }
}
```

## 🚀 Despliegue

### Variables de Producción

```env
NODE_ENV=production
LOG_LEVEL=warn
PORT=4321
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/notesapp
```

### Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos MongoDB accesible
- [ ] Puerto disponible y abierto
- [ ] Logs configurados para archivo (producción)
- [ ] CORS configurado para dominios permitidos
- [ ] Rate limiting activado si es necesario

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Revisar la documentación de [Elysia.js](https://elysiajs.com)
- Consultar la documentación de [Zod](https://zod.dev)

---

**Desarrollado con ❤️ usando Elysia.js, TypeScript y MongoDB**