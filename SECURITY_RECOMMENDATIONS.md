# Recomendaciones de seguridad (OWASP) para este proyecto

Alcance y metodología
- Basado en OWASP Top 10 (2021/2023), OWASP API Security Top 10 (2023) y OWASP ASVS v4.0.x.
- Revisión estática del código y configuración (Elysia.js, TypeScript, Mongoose, CORS, logging, manejo de errores).
- Objetivo: proponer cambios concretos y priorizados para alcanzar un estándar alto de seguridad.

Resumen ejecutivo (prioridad)
- Alta: Autenticación/Autorización; CORS restrictivo; Cabeceras de seguridad; Rate limiting y antifuerza bruta; Límites de tamaño de petición; Higiene de logs; Gestión de secretos; TLS/HSTS; Endurecer MongoDB.
- Media: Enforce Content-Type y Accept; política de caché; validaciones adicionales; auditoría de dependencias y pipeline; observabilidad y trazabilidad.
- Baja: Limpieza de mensajes de configuración; mejoras menores de esquema y respuestas.

Cambios de seguridad prioritarios (ALTA)
1) Autenticación y autorización (OWASP API1/2023 – Broken Object Level Authorization; ASVS 2.1/3.1)
- Situación actual: API abierta sin autenticación ni control de acceso.
- Acción: proteger TODAS las operaciones de escritura (POST/PATCH/PUT/DELETE) y lecturas según ownership (userId) con JWT/OAuth2 y RBAC/ABAC.
- Notas:
  - Emisión de tokens con exp corto (≤15 min) y refresh tokens rotativos.
  - Firmas con algoritmo fuerte (RS256/ES256) y rotación de claves.
  - Verificación de ownership en operaciones por id (resource belongs to subject).

2) CORS estricto (OWASP API5/2023 – Broken Function Level Authorization; API8 – Injection superficie)
- Situación: se usa cors() sin restricción; existe CORS_ORIGIN en config pero no se aplica.
- Acción: restringir a orígenes explícitos, métodos y cabeceras necesarias; deshabilitar credenciales si no se usan cookies.
- Ejemplo:
```ts path=null start=null
import { cors } from '@elysiajs/cors'
import { CORS_ORIGIN } from './config.ts'

app.use(cors({
  origin: (origin) => {
    const allowList = CORS_ORIGIN.split(',').map(o => o.trim())
    return !!origin && allowList.includes(origin)
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  exposedHeaders: ['Content-Length','ETag'],
  credentials: false, // true solo si usas cookies seguras
  maxAge: 600
}))
```

3) Cabeceras de seguridad (OWASP ASVS 14 – HTTP Security Headers)
- Acción: añadir cabeceras robustas a todas las respuestas.
```ts path=null start=null
app.onBeforeHandle(({ set }) => {
  set.headers = {
    ...(set.headers ?? {}),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    // Para APIs, CSP minimalista
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    // HSTS solo en producción y detrás de HTTPS
    ...(process.env.NODE_ENV === 'production' ? {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    } : {})
  }
})
```

4) Rate limiting y antifuerza bruta (OWASP API4 – Unrestricted Resource Consumption; ASVS 4.4)
- Acción: límite por IP y ruta; 429 en exceso; contadores separados para endpoints sensibles.
- Ejemplo simple in-memory (considera Redis en producción):
```ts path=null start=null
const buckets = new Map<string, { tokens: number; ts: number }>()
const capacity = Number(process.env.RATE_LIMIT_MAX ?? 100)
const windowMs = Number(process.env.RATE_LIMIT_WINDOW ?? 15*60*1000)

app.onBeforeHandle(({ set, request }) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const now = Date.now()
  const b = buckets.get(ip) ?? { tokens: capacity, ts: now }
  const refill = Math.floor((now - b.ts) / windowMs) * capacity
  b.tokens = Math.min(capacity, b.tokens + Math.max(0, refill))
  b.ts = now
  if (b.tokens <= 0) {
    set.status = 429
    set.headers = { ...(set.headers ?? {}), 'Retry-After': '60' }
    return { error: 'Too Many Requests' }
  }
  b.tokens -= 1
  buckets.set(ip, b)
})
```

5) Límite de tamaño de petición y Content-Type (OWASP API4 – Resource Consumption)
- Acción: rechazar bodies grandes y Content-Type no esperado; exigir application/json.
```ts path=null start=null
const MAX_BYTES = 256 * 1024 // 256KB
app.onBeforeHandle(async ({ set, request }) => {
  const ct = request.headers.get('content-type') || ''
  if (['POST','PUT','PATCH'].includes(request.method)) {
    if (!ct.startsWith('application/json')) {
      set.status = 415; return { error: 'Unsupported Media Type' }
    }
    const len = Number(request.headers.get('content-length') || '0')
    if (len > MAX_BYTES) { set.status = 413; return { error: 'Payload Too Large' } }
  }
})
```

6) Higiene de logs (OWASP ASVS 8 – Logging and Monitoring)
- Situación: se registra content de la nota a nivel INFO; riesgo de exfiltración/PII.
- Acción: no loggear cuerpos de petición ni datos sensibles; usar IDs/correlação y metadatos mínimos.
- Cambios sugeridos:
  - Quitar logging de content en src/routes/notes.controller.ts (createNote) y reducir a {id, status}.
  - Usar niveles DEBUG para detalles; INFO solo para eventos de alto nivel.

7) Gestión de secretos y configuración (ASVS 1.1/1.2)
- Mantener config.env fuera del VCS (ya en .gitignore) y usar gestores de secretos en producción (Azure Key Vault/AWS Secrets/GCP SM).
- Eliminar console.log de configuración en src/config.ts o limitar a NODE_ENV!=='production' y nunca mostrar valores.
- Definir variables: JWT_ISSUER, JWT_AUDIENCE, JWT_PUBLIC_KEY/JWT_PRIVATE_KEY, LOG_LEVEL, CORS_ORIGIN.

8) TLS/HTTPS y HSTS (ASVS 9.1)
- Desplegar siempre detrás de TLS; activar HSTS en producción (ver cabeceras arriba).
- Forzar https en nivel de proxy/cdn y redirigir http->https.

9) Seguridad MongoDB (ASVS 10 – Data Protection)
- Usar usuarios con privilegios mínimos por base de datos (solo CRUD necesario).
- En Atlas (+srv) ya usa TLS; para mongodb:// asegurar tls=true y validar el certificado.
- Activar límites de tiempo y pool razonables (ya definidos); agregar retryWrites/readConcern si aplica.

10) Auditoría de dependencias y supply chain (ASVS 14.2)
- Ejecutar auditorías periódicas y durante CI: pnpm audit --prod y actualización a parches.
- Pin de versiones (ya hay lockfile), firma/verificación de artefactos en pipeline si es posible.

Cambios de seguridad recomendados (MEDIA)
11) Enforce Accept y respuesta JSON
- Rechazar peticiones sin Accept: application/json y enviar Content-Type: application/json consistente.

12) Política de caché segura (ASVS 13.2)
- Añadir Cache-Control: no-store, Pragma: no-cache en respuestas con datos sensibles.
```ts path=null start=null
app.onAfterHandle?.(({ set }) => {
  set.headers = {
    ...(set.headers ?? {}),
    'Cache-Control': 'no-store',
    Pragma: 'no-cache'
  }
})
```

13) Validación estricta de esquemas en capa HTTP
- Además del esquema Mongoose strict, asegurar que el validador HTTP rechace campos extra (additionalProperties=false si el validador lo soporta) para evitar mass assignment.

14) Observabilidad y trazabilidad (ASVS 8)
- Añadir X-Request-ID y propagar en logs; métricas de latencia, 4xx/5xx por ruta; alertas 429/401/403/5xx.

15) Seguridad del endpoint de health
- Devolver poca información (ya está OK) y si es público, no incluir detalles de backend.

Cambios menores (BAJA)
16) Semántica 204
- DELETE retorna 204 pero con cuerpo; por RFC 7231 no debería incluir body. Ajustar a 200/204 sin body. No es crítico de seguridad.

17) Endurecer mensajes de error
- Mantener mensajes genéricos en producción (ya implementado); asegurar que stack/inner error solo en desarrollo.

Checklist accionable
- [ ] Implementar autenticación JWT/OAuth2 y autorización por rol/ownership en todas las rutas.
- [ ] Configurar CORS con lista blanca desde CORS_ORIGIN (admite múltiples orígenes separados por coma).
- [ ] Añadir cabeceras de seguridad en onBeforeHandle (HSTS solo en prod bajo TLS).
- [ ] Añadir rate limiting por IP y estrategia antifuerza bruta (ideal Redis para clúster).
- [ ] Enforce Content-Type application/json y limitar tamaño de body (413 en exceso).
- [ ] Sanitizar logging: no registrar payloads; usar IDs/metadatos; agregar X-Request-ID.
- [ ] Eliminar/condicionar console.log de configuración; usar logger con nivel DEBUG y nunca imprimir secretos.
- [ ] Validar Accept y responder JSON consistente; establecer Cache-Control: no-store cuando aplique.
- [ ] Fortalecer configuración de MongoDB (TLS, cuentas de mínimo privilegio, parámetros de conexión).
- [ ] Añadir auditoría de dependencias en CI y política de actualización de parches.

Apéndice: ubicaciones sugeridas de cambios en el código
- src/index.ts o src/index.refactored.ts
  - CORS estricto y cabeceras de seguridad.
  - Rate limiting y límites de payload.
- src/routes/notes.routes.ts
  - Aplicar middleware de autenticación/autorización y ownership por userId.
- src/routes/notes.controller.ts
  - Reducir logs (quitar content en INFO).
- src/config.ts
  - Remover logs en producción; añadir variables de seguridad (JWT_*, CORS_ORIGIN).
- src/config/db.ts
  - Enforzar TLS si no se usa +srv; validar opciones seguras.

Referencias
- OWASP Top 10 (2021/2023)
- OWASP API Security Top 10 (2023)
- OWASP ASVS v4.0.x
