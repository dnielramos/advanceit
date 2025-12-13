# Guía de Integración: Envíos Normales y Envíos RMA

> **Versión:** 1.0  
> **Fecha:** Diciembre 2024  
> **Módulo:** Shippings

---

## Resumen de Cambios

El módulo de envíos ahora soporta dos tipos de asociación:

| Tipo de Envío | Campo Requerido | Campo Nulo |
|---------------|-----------------|------------|
| **Envío Normal** | `order_id` | `rma_id = null` |
| **Envío por RMA** | `rma_id` | `order_id = null` |

**Regla importante:** Solo uno de los dos campos puede tener valor. Nunca ambos al mismo tiempo, nunca ambos nulos.

---

## Comportamiento Automático al Crear Envío RMA

> **¡IMPORTANTE!** Al crear un envío asociado a un RMA, el sistema actualiza automáticamente el RMA.

Cuando se crea un envío con `rma_id`, el backend realiza las siguientes acciones automáticamente:

| Campo del RMA | Valor Asignado |
|---------------|----------------|
| `estado` | `'approved'` |
| `shipping_id` | ID del envío recién creado |
| `fecha_resolucion` | Fecha/hora actual |
| `historial` | Se agrega entrada: "RMA aprobado - Envío de reposición creado" |

### Flujo de la Transacción

```
1. Frontend envía POST /shippings con rma_id
2. Backend crea el envío (estado: 'preparando')
3. Backend actualiza el RMA automáticamente:
   - estado → 'approved'
   - shipping_id → nuevo shipping.id
   - fecha_resolucion → NOW()
   - historial → nueva entrada agregada
4. Se retorna el envío creado
```

**Nota:** Todo ocurre en una sola transacción. Si falla cualquier paso, se revierte todo.

---

## Endpoint de Creación

### `POST /shippings`

#### Campos del Request Body

| Campo | Tipo | Envío Normal | Envío RMA | Descripción |
|-------|------|--------------|-----------|-------------|
| `order_id` | `string` (UUID) | **Requerido** | No enviar | ID de la orden asociada |
| `rma_id` | `string` (UUID) | No enviar | **Requerido** | ID del RMA asociado |
| `direccion_entrega` | `string` | **Requerido** | **Requerido** | Dirección de entrega |
| `transportadora` | `string` | **Requerido** | **Requerido** | Nombre de la transportadora |
| `guia` | `string` | Opcional | Opcional | Número de guía |
| `fechaEstimada` | `string` (YYYY-MM-DD) | **Requerido** | **Requerido** | Fecha estimada de entrega |
| `notas` | `string` | Opcional | Opcional | Notas adicionales |
| `user_id` | `string` (UUID) | **Requerido** | **Requerido** | ID del usuario que crea el envío |

---

## Ejemplos de Request

### Crear Envío Normal (asociado a Order)

```json
POST /shippings
Content-Type: application/json

{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "direccion_entrega": "Calle 123 #45-67, Bogotá",
  "transportadora": "Servientrega",
  "guia": "1234567890",
  "fechaEstimada": "2024-12-20",
  "notas": "Entregar en horario de oficina",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Crear Envío por RMA (asociado a RMA)

```json
POST /shippings
Content-Type: application/json

{
  "rma_id": "660e8400-e29b-41d4-a716-446655440001",
  "direccion_entrega": "Bodega principal - Zona Industrial",
  "transportadora": "Coordinadora",
  "guia": "9876543210",
  "fechaEstimada": "2024-12-22",
  "notas": "Devolución por garantía",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

## Respuesta del Servidor

### Estructura del Objeto Shipping

```typescript
interface Shipping {
  id: string;
  order_id?: string;           // Solo presente en envíos normales
  rma_id?: string;             // Solo presente en envíos RMA
  order?: ShippingOrderInfo;   // Objeto poblado si es envío normal
  rma?: ShippingRmaInfo;       // Objeto poblado si es envío RMA
  direccion_entrega?: string;
  transportadora?: string;
  guia?: string;
  estado: 'preparando' | 'en_transito' | 'entregado' | 'fallido';
  historial?: HistoryEvent[];
  notas?: string;
  fechaEstimada?: string;
  fechaEntregaReal?: string;
  created_by: string | ShippingUserInfo;
  updated_by: string | ShippingUserInfo;
  created_at: string;
  updated_at: string;
}
```

### Objeto Order (solo en envíos normales)

```typescript
interface ShippingOrderInfo {
  id: string;
  numeroOrden: string;
  quotation_id: string;
  company: {
    id: number;
    razon_social: string;
    nit: string;
  };
  user: {
    id: string;
    name: string;
    email?: string;
  };
}
```

### Objeto RMA (solo en envíos RMA)

```typescript
interface RmaProductInfo {
  product_id: string;
  product_name: string;
  quantity: number;
  serial?: string;
}

interface ShippingRmaInfo {
  id: string;
  rma_number: string;
  motivo: string;
  estado: string;
  company?: ShippingCompanyInfo;  // Empresa del usuario que creó el envío
  user?: ShippingUserInfo;        // Usuario que creó el envío
  productos?: RmaProductInfo[];   // Productos asociados al RMA
}
```

> **Nota:** Para envíos RMA:
> - `company` y `user` se obtienen del usuario que creó el envío (`created_by`)
> - `productos` se obtiene del campo `evidencias` del RMA (parseado automáticamente)

---

## Endpoint de Productos RMA

Similar al endpoint de órdenes, se puede obtener los productos de un RMA directamente:

### GET /rmas/:id/products

```bash
GET http://localhost:3002/rmas/c410007e-e132-45ce-8e26-7f8f683dba42/products
```

**Respuesta:**
```json
{
  "total": 1,
  "data": [
    {
      "product_id": "89BFG74",
      "product_name": "Dell Latitude 5450",
      "quantity": 1,
      "serial": "89BFG74"
    }
  ]
}
```

---

## Ejemplo de Respuesta

### Envío Normal Creado

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "rma_id": null,
  "direccion_entrega": "Calle 123 #45-67, Bogotá",
  "transportadora": "Servientrega",
  "guia": "1234567890",
  "estado": "preparando",
  "fechaEstimada": "2024-12-20",
  "notas": "Entregar en horario de oficina",
  "historial": [
    {
      "timestamp": "2024-12-12T07:58:00.000Z",
      "status": "preparando",
      "description": "Los Administradores han validado los productos y procesado la orden.",
      "updated_by": { "id": "...", "name": "Admin User" }
    }
  ],
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "updated_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2024-12-12T07:58:00.000Z",
  "updated_at": "2024-12-12T07:58:00.000Z"
}
```

### Envío RMA (al consultar con GET)

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "order_id": null,
  "rma_id": "660e8400-e29b-41d4-a716-446655440001",
  "rma": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "rma_number": "RMA-MJ2ZLE1S-Q49T",
    "motivo": "Cambio de RAM",
    "estado": "approved",
    "company": {
      "id": 15,
      "razon_social": "Empresa del Cliente S.A.S",
      "nit": "900123456-7"
    },
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Juan Pérez",
      "email": "juan.perez@empresa.com"
    },
    "productos": [
      {
        "product_id": "89BFG74",
        "product_name": "Dell Latitude 5450",
        "quantity": 1,
        "serial": "89BFG74"
      }
    ]
  },
  "direccion_entrega": "Bodega principal - Zona Industrial",
  "transportadora": "Coordinadora",
  "guia": "9876543210",
  "estado": "preparando",
  "fechaEstimada": "2024-12-22",
  "notas": "Devolución por garantía",
  "historial": [...],
  "created_by": { "id": "a1b2c3d4-...", "name": "Juan Pérez" },
  "updated_by": { "id": "a1b2c3d4-...", "name": "Juan Pérez" },
  "created_at": "2024-12-12T08:00:00.000Z",
  "updated_at": "2024-12-12T08:00:00.000Z"
}
```

> **Importante:** En envíos RMA, `rma.company` y `rma.user` contienen la información del usuario que creó el envío y su empresa asociada. Esto permite al frontend mostrar la misma información de cliente/empresa que en los envíos normales.

---

## Errores Comunes

### Error: Datos de envío inválidos

```json
{
  "statusCode": 400,
  "message": "Datos de envío inválidos.",
  "error": "Bad Request"
}
```

**Causas posibles:**
- No se envió ni `order_id` ni `rma_id`
- Se enviaron ambos `order_id` y `rma_id`
- Faltan campos requeridos: `transportadora`, `fechaEstimada`, `direccion_entrega`

---

## Endpoints Existentes (Sin Cambios)

Los siguientes endpoints funcionan igual para ambos tipos de envío:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/shippings` | Obtener todos los envíos |
| `GET` | `/shippings/:id` | Obtener envío por ID |
| `PATCH` | `/shippings/:id` | Actualizar envío (estado, guía, etc.) |
| `PATCH` | `/shippings/:id/history` | Agregar eventos al historial |

---

## Lógica de Frontend Recomendada

### Determinar Tipo de Envío

```typescript
function getTipoEnvio(shipping: Shipping): 'normal' | 'rma' {
  if (shipping.order_id && !shipping.rma_id) return 'normal';
  if (shipping.rma_id && !shipping.order_id) return 'rma';
  throw new Error('Estado inválido de envío');
}
```

### Mostrar Información Asociada

```typescript
function getInfoAsociada(shipping: Shipping) {
  if (shipping.order) {
    return {
      tipo: 'Orden',
      numero: shipping.order.numeroOrden,
      empresa: shipping.order.company.razon_social,
      nit: shipping.order.company.nit,
      cliente: shipping.order.user.name,
      email: shipping.order.user.email
    };
  }
  
  if (shipping.rma) {
    return {
      tipo: 'RMA',
      numero: shipping.rma.rma_number,
      motivo: shipping.rma.motivo,
      estadoRma: shipping.rma.estado,
      // Info de usuario/empresa del creador del envío
      empresa: shipping.rma.company?.razon_social || 'N/A',
      nit: shipping.rma.company?.nit || 'N/A',
      cliente: shipping.rma.user?.name || 'N/A',
      email: shipping.rma.user?.email || 'N/A'
    };
  }
  
  return null;
}
```

### Obtener Usuario y Empresa de Forma Unificada

```typescript
// Función helper para obtener info de empresa/usuario independientemente del tipo de envío
function getShippingClientInfo(shipping: Shipping) {
  // Envío normal: info viene de la orden
  if (shipping.order) {
    return {
      company: shipping.order.company,
      user: shipping.order.user
    };
  }
  
  // Envío RMA: info viene del usuario creador
  if (shipping.rma) {
    return {
      company: shipping.rma.company,
      user: shipping.rma.user
    };
  }
  
  return { company: null, user: null };
}

// Uso en componentes
const { company, user } = getShippingClientInfo(shipping);
console.log(company?.razon_social); // Funciona igual para ambos tipos
console.log(user?.name);
```

### Formulario de Creación

```typescript
interface CreateShippingForm {
  // Selector de tipo
  tipoEnvio: 'normal' | 'rma';
  
  // Campos condicionales
  order_id?: string;  // Solo si tipoEnvio === 'normal'
  rma_id?: string;    // Solo si tipoEnvio === 'rma'
  
  // Campos siempre requeridos
  direccion_entrega: string;
  transportadora: string;
  fechaEstimada: string;
  
  // Campos opcionales
  guia?: string;
  notas?: string;
}

function buildPayload(form: CreateShippingForm, userId: string) {
  const payload: any = {
    direccion_entrega: form.direccion_entrega,
    transportadora: form.transportadora,
    fechaEstimada: form.fechaEstimada,
    guia: form.guia,
    notas: form.notas,
    user_id: userId
  };
  
  if (form.tipoEnvio === 'normal') {
    payload.order_id = form.order_id;
  } else {
    payload.rma_id = form.rma_id;
  }
  
  return payload;
}
```

---

## Tabla Resumen de Cambios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| `order_id` | Obligatorio | Opcional (requerido si no hay `rma_id`) |
| `rma_id` | No existía | Opcional (requerido si no hay `order_id`) |
| Objeto `rma` en respuesta | No existía | Presente si el envío está asociado a RMA |
| Validación | Solo validaba `order_id` | Valida que exista exactamente uno de los dos |
| Actualización automática de RMA | No aplicaba | Al crear envío con `rma_id`: RMA pasa a `approved`, se asigna `shipping_id` y `fecha_resolucion` |

---

## Diagrama de Flujo: Envío RMA

```
┌─────────────────────────────────────────────────────────────┐
│                    CREAR ENVÍO RMA                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /shippings                                            │
│  {                                                          │
│    "rma_id": "...",                                         │
│    "direccion_entrega": "...",                              │
│    "transportadora": "...",                                 │
│    "fechaEstimada": "...",                                  │
│    "user_id": "..."                                         │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND - Transacción Atómica                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. INSERT shipping (estado: 'preparando')              │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 2. UPDATE rma SET                                      │ │
│  │    - estado = 'approved'                               │ │
│  │    - shipping_id = nuevo_shipping.id                   │ │
│  │    - fecha_resolucion = NOW()                          │ │
│  │    - historial += nueva entrada                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  RESPUESTA: Shipping creado                                 │
│  RMA actualizado automáticamente                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Contacto

Para dudas sobre esta integración, contactar al equipo de backend.
