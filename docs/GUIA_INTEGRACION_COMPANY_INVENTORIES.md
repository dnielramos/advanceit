# Guía de Integración: Company Inventories API

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Cambios en la Base de Datos](#cambios-en-la-base-de-datos)
3. [Cambios en el API](#cambios-en-el-api)
4. [Guía de Migración](#guía-de-migración)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [FAQs](#faqs)

---

## Introducción

### ⚠️ ¿Por qué este cambio?

La implementación anterior almacenaba inventarios completos como JSON en una sola columna, lo cual genera problemas graves:

| Problema | Impacto |
|----------|---------|
| No se pueden hacer búsquedas por atributos | Imposible filtrar "todos los laptops Dell" |
| Sin índices en campos individuales | Queries lentas con muchos registros |
| Difícil calcular estadísticas | "Total de equipos por marca" requiere código complejo |
| Performance degradado | JSON parsing en cada consulta |
| Actualizaciones complejas | Cambiar un solo campo requiere reescribir todo el JSON |

### ✅ Solución: Estructura Normalizada

Nueva arquitectura con dos tablas relacionales:

```
company_inventories (1) ──┬─→ company_inventory_items (N)
                           │
                           └─→ Relación 1:N
```

---

## Cambios en la Base de Datos

### Estructura ANTERIOR (❌ Deprecated)

```sql
CREATE TABLE company_inventories (
    id VARCHAR(100) PRIMARY KEY,
    company VARCHAR(255) NOT NULL,      -- ⚠️ String, no FK
    inventory JSON NOT NULL,             -- ⚠️ Blob monolítico 
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Ejemplo de dato:**
```json
{
  "id": "inv-123",
  "company": "company-456",
  "inventory": [
    {"laptop_model": "Dell XPS 15", "service_tag": "ABC123", "ram": "16GB"},
    {"laptop_model": "HP Pavilion", "service_tag": "XYZ789", "ram": "8GB"}
  ]
}
```

### Estructura NUEVA (✅ Normalizada)

```sql
-- Tabla principal
CREATE TABLE company_inventories (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36) NOT NULL,        -- ✅ Ahora es company_id (FK potencial)
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id)    -- ✅ Índice para búsquedas rápidas
);

-- Tabla de ítems (nuevo)
CREATE TABLE company_inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id CHAR(36) NOT NULL,
    item_key VARCHAR(255) NOT NULL,      -- Nombre del campo
    item_value TEXT,                     -- Valor del campo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES company_inventories(id) ON DELETE CASCADE,
    INDEX idx_item_key (item_key),       -- ✅ Búsquedas por tipo de campo
    INDEX idx_inventory_id (inventory_id)-- ✅ JOINs eficientes
);
```

**Ejemplo de datos normalizados:**

**company_inventories:**
```
id                 | company_id | created_by | created_at
-------------------|------------|------------|-------------------
inv-uuid-123       | comp-456   | user-1     | 2025-01-01 10:00
```

**company_inventory_items:**
```
id | inventory_id  | item_key      | item_value
---|---------------|---------------|-------------
1  | inv-uuid-123  | 0.laptop_model| Dell XPS 15
2  | inv-uuid-123  | 0.service_tag | ABC123
3  | inv-uuid-123  | 0.ram         | 16GB
4  | inv-uuid-123  | 1.laptop_model| HP Pavilion
5  | inv-uuid-123  | 1.service_tag | XYZ789
6  | inv-uuid-123  | 1.ram         | 8GB
```

---

## Cambios en el API

### 🎯 Buena Noticia: **NO HAY CAMBIOS EN LOS ENDPOINTS**

La API mantiene **100% de compatibilidad hacia atrás**. El frontend NO necesita cambios inmediatos.

### Endpoints (Sin cambios)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/company-inventories` | Crear inventario |
| GET | `/company-inventories` | Listar todos |
| GET | `/company-inventories/by-company?company={id}` | Por empresa |
| GET | `/company-inventories/:id` | Por ID |
| PATCH | `/company-inventories/:id` | Actualizar |
| DELETE | `/company-inventories/:id` | Eliminar |
| DELETE | `/company-inventories/by-company?company={id}` | Eliminar por empresa |

### Cambios en Request/Response

#### ANTES vs AHORA

**Request Body (SIN CAMBIOS):**
```json
{
  "company": "company-id-123",  // ⚠️ DEPRECADO: usar company_id
  "inventory": [
    {
      "laptop_model": "Dell XPS 15",
      "service_tag": "ABC123",
      "ram": "16GB",
      "storage": "512GB SSD"
    }
  ],
  "created_by": "user-uuid"
}
```

**Request Body (RECOMENDADO - Nueva versión):**
```json
{
  "company_id": "company-uuid-123",  // ✅ Ahora company_id
  "inventory": [
    {
      "laptop_model": "Dell XPS 15",
      "service_tag": "ABC123",
      "ram": "16GB",
      "storage": "512GB SSD"
    }
  ],
  "created_by": "user-uuid"
}
```

**Response (SIN CAMBIOS VISIBLES):**
```json
{
  "id": "inventory-uuid",
  "company": "company-id-123",  // Se mantiene para compatibilidad
  "company_id": "company-id-123",  // ✅ Ahora también incluye company_id
  "inventory": [
    {
      "laptop_model": "Dell XPS 15",
      "service_tag": "ABC123",
      "ram": "16GB"
    }
  ],
  "created_by": "user-uuid",
  "updated_by": "user-uuid",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

---

## Guía de Migración

### Para Equipos de Frontend

#### Fase 1: Sin Cambios Requeridos (Inmediato)

```javascript
// ✅ Este código sigue funcionando EXACTAMENTE igual
const response = await fetch('/company-inventories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company: 'company-123',  // Aún funciona
    inventory: [
      { laptop_model: 'Dell XPS', service_tag: 'ABC' }
    ],
    created_by: 'user-1'
  })
});
```

#### Fase 2: Migración Gradual (Recomendado)

```javascript
// ✅ Usar company_id en lugar de company
const response = await fetch('/company-inventories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_id: 'company-uuid-123',  // ✅ Nuevo campo
    inventory: [
      { laptop_model: 'Dell XPS', service_tag: 'ABC' }
    ],
    created_by: 'user-uuid-1'
  })
});
```

#### Fase 3: Aprovechar Nuevas Capacidades (Futuro)

```javascript
// 🚀 NUEVO: Búsqueda por atributos específicos (próximamente)
const laptopsDell = await fetch(
  '/company-inventories/search?item_key=laptop_model&item_value=Dell%20XPS'
);

// 🚀 NUEVO: Estadísticas (próximamente)
const stats = await fetch('/company-inventories/stats/by-key?key=laptop_model');
```

### Para Equipos de Backend

#### Migración de Datos Existentes

```sql
-- Script de migración (ejecutar una sola vez)
-- Este script convierte JSON existente a estructura normalizada

-- 1. Crear tabla temporal para respaldo
CREATE TABLE company_inventories_backup AS SELECT * FROM company_inventories;

-- 2. Crear nuevas tablas (el validator lo hace  automáticamente)

-- 3. Migrar datos (ejecutar en aplicación Node.js)
-- Ver script: migration/migrate-inventories.ts
```

**Script de Migración (Node.js):**

```typescript
// migration/migrate-inventories.ts
import { SQLProcesor } from '../services/sql-procesor.service';

async function migrateInventories(sqlProcesor: SQLProcesor) {
  // 1. Leer inventarios antiguos
  const [oldInventories] = await sqlProcesor.executeTransaction(async (conn) => {
    return conn.query('SELECT * FROM company_inventories_backup');
  });

  // 2. Para cada inventario
  for (const oldInv of oldInventories) {
    await sqlProcesor.executeTransaction(async (conn) => {
      // 3. Crear registro principal
      const newId = uuidv4();
      await conn.execute(
        'INSERT INTO company_inventories (id, company_id, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, oldInv.company, oldInv.created_by, oldInv.updated_by, oldInv.created_at, oldInv.updated_at]
      );

      // 4. Parsear JSON y crear ítems
      const inventory = JSON.parse(oldInv.inventory);
      for (let idx = 0; idx < inventory.length; idx++) {
        const item = inventory[idx];
        for (const [key, value] of Object.entries(item)) {
          await conn.execute(
            'INSERT INTO company_inventory_items (inventory_id, item_key, item_value) VALUES (?, ?, ?)',
            [newId, `${idx}.${key}`, String(value)]
          );
        }
      }
    });
  }
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear Inventario

**Request:**
```bash
POST /company-inventories
Content-Type: application/json

{
  "company_id": "uuid-company-123",
  "inventory": [
    {
      "device_type": "laptop",
      "brand": "Dell",
      "model": "XPS 15",
      "service_tag": "ABC123XYZ",
      "serial_number": "SN123456",
      "ram": "16GB",
      "storage": "512GB SSD",
      "processor": "Intel i7",
      "location": "Oficina Principal",
      "assigned_to": "Juan Pérez"
    },
    {
      "device_type": "monitor",
      "brand": "LG",
      "model": "34WK95U",
      "serial_number": "MON789",
      "size": "34 pulgadas",
      "resolution": "5120x2160",
      "location": "Oficina Principal"
    }
  ],
  "created_by": "admin-user-uuid"
}
```

**Response:**
```json
{
  "message": "Inventario creado correctamente."
}
```

### Ejemplo 2: Obtener Inventarios por Empresa

**Request:**
```bash
GET /company-inventories/by-company?company=uuid-company-123
```

**Response:**
```json
[
  {
    "id": "inv-uuid-1",
    "company_id": "uuid-company-123",
    "inventory": [
      {
        "device_type": "laptop",
        "brand": "Dell",
        "model": "XPS 15",
        "service_tag": "ABC123XYZ",
        "ram": "16GB"
      }
    ],
    "created_by": "admin-uuid",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
]
```

### Ejemplo 3: Actualizar Inventario

**Request:**
```bash
PATCH /company-inventories/inv-uuid-1
Content-Type: application/json

{
  "newData": {
    "inventory": [
      {
        "device_type": "laptop",
        "brand": "Dell",
        "model": "XPS 15",
        "service_tag": "ABC123XYZ",
        "ram": "32GB",  // ✅ Actualizado
        "storage": "1TB SSD"  // ✅ Actualizado
      }
    ]
  },
  "updatedBy": "admin-user-uuid"
}
```

---

## FAQs

### ¿Necesito cambiar mi código frontend inmediatamente?

**No.** El API mantiene 100% compatibilidad. Puedes migrar gradualmente.

### ¿Qué pasa con mis datos existentes?

Se migran automáticamente al iniciar la aplicación o mediante script manual.

### ¿El campo `company` sigue funcionando?

Sí, pero usa `company_id` para nuevas integraciones.

### ¿Cómo busco inventarios por atributos específicos?

Próximamente se habilitará endpoint `/search` con filtros avanzados.

### ¿Qué son los `item_key` con formato `0.laptop_model`?

Es el índice del array + nombre del campo. Ejemplo:
- `0.laptop_model` = Primer laptop, campo "laptop_model"
- `1.ram` = Segundo ítem, campo "ram"

### ¿Cómo rollback si hay problemas?

```sql
-- Restaurar desde backup
DROP TABLE company_inventories;
DROP TABLE company_inventory_items;
RENAME TABLE company_inventories_backup TO company_inventories;
```

---

## 🚀 Próximas Mejoras

Con la nueva estructura normalizada, próximamente:

✅ **Búsqueda avanzada**: Filtrar por cualquier campo  
✅ **Estadísticas en tiempo real**: Totales por marca, tipo, ubicación  
✅ **Reportes optimizados**: Queries SQL nativos  
✅ **Validaciones por campo**: Esquemas dinámicos  
✅ **Auditoría granular**: Historial de cambios por ítem  

---

## 📞 Soporte

¿Problemas con la migración? Contacta al equipo de backend.

**Versión del documento:** 1.0  
**Última actualización:** 2025-12-03
