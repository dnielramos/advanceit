# Guía: Operaciones Granulares de Ítems de Inventario

## 📋 Índice

1. [Introducción](#introducción)
2. [Casos de Uso](#casos-de--uso)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Ejemplos Detallados](#ejemplos-detallados)
5. [Manejo de Errores](#manejo-de-errores)
6. [Best Practices](#best-practices)

---

## Introducción

### ¿Por qué Operaciones Granulares?

**Problema Anterior:**
```javascript
// ❌ Para agregar 1 laptop, tenías que enviar TODO el inventario
const inventario = await getInventory(id); // 500 equipos
inventario.inventory.push(nuevoLaptop);
await updateInventory(id, inventario); // Reenviar 501 equipos
```

**Solución Nueva:**
```javascript
// ✅ Agregar solo el nuevo laptop
await addItemsToInventory(id, [nuevoLaptop]);
```

### Ventajas

✅ **Eficiencia**: Envía solo los datos necesarios  
✅ **Simplicidad**: Operaciones específicas y claras  
✅ **Seguridad**: Menos errores de sobrescritura  
✅ **Performance**: Menos datos transferidos y procesados  

---

## Casos de Uso

### Caso 1: Nueva Compra de Equipos

**Escenario**: La empresa compró 3 laptops nuevas.

**Antes (❌):**
1. Obtener inventario completo
2. Agregar 3 laptops al array
3. Enviar inventario completo de vuelta

**Ahora (✅):**
```javascript
POST /company-inventories/:id/items
{
  "items": [laptop1, laptop2, laptop3],
  "updated_by": "user-uuid"
}
```

### Caso 2: Reasignación de Equipo

**Escenario**: Un laptop en índice 5 fue reasignado a otro empleado.

**Antes (❌):**
1. Obtener inventario completo
2. Modificar solo el índice 5
3. Enviar inventario completo

**Ahora (✅):**
```javascript
PATCH /company-inventories/:id/items/5
{
  "item": {
    ...datosActualizados,
    "assigned_to": "nuevo_empleado"
  },
  "updated_by": "user-uuid"
}
```

### Caso 3: Dar de Baja un Equipo

**Escenario**: Un monitor en índice 12 fue dado de baja.

**Antes (❌):**
1. Obtener inventario completo
2. Eliminar índice 12 del array
3. Enviar inventario completo

**Ahora (✅):**
```javascript
DELETE /company-inventories/:id/items/12
{
  "updated_by": "user-uuid"
}
```

---

## Endpoints Disponibles

### 1. Agregar Ítems a Inventario Existente

```
POST /company-inventories/:id/items
```

**Descripción**: Agrega nuevos ítems al final del inventario existente.

**Parámetros URL:**
- `id` (UUID): ID del inventario

**Request Body:**
```json
{
  "items": [
    {
      "device_type": "laptop",
      "brand": "Dell",
      "model": "XPS 15",
      "service_tag": "NEW123",
      "ram": "32GB"
    },
    {
      "device_type": "monitor",
      "brand": "LG",
      "model": "27UK850",
      "serial_number": "MON456"
    }
  ],
  "updated_by": "user-uuid"
}
```

**Response Exitoso (200):**
```json
{
  "message": "2 items agregados al inventario correctamente.",
  "items_added": 2,
  "total_items": 27
}
```

### 2. Actualizar Ítem Específico

```
PATCH /company-inventories/:id/items/:itemIndex
```

**Descripción**: Actualiza completamente un ítem específico por su índice (0-based).

**Parámetros URL:**
- `id` (UUID): ID del inventario
- `itemIndex` (number): Índice del ítem a actualizar

**Request Body:**
```json
{
  "item": {
    "device_type": "laptop",
    "brand": "Dell",
    "model": "XPS 15",
    "service_tag": "ABC123",
    "ram": "64GB",
    "storage": "1TB SSD",
    "assigned_to": "María García",
    "location": "Oficina Central"
  },
  "updated_by": "admin-user-uuid"
}
```

**Response Exitoso (200):**
```json
{
  "message": "Item en índice 5 actualizado correctamente."
}
```

### 3. Eliminar Ítem Específico

```
DELETE /company-inventories/:id/items/:itemIndex
```

**Descripción**: Elimina un ítem específico y re-indexa automáticamente los ítems subsiguientes.

**Parámetros URL:**
- `id` (UUID): ID del inventario
- `itemIndex` (number): Índice del ítem a eliminar

**Request Body:**
```json
{
  "updated_by": "admin-user-uuid"
}
```

**Response Exitoso (200):**
```json
{
  "message": "Item en índice 3 eliminado correctamente.",
  "remaining_items": 25
}
```

**🔄 Re-indexación Automática:**
```
Antes:  Item 0, Item 1, Item 2, Item 3, Item 4
DELETE índice 2
Después: Item 0, Item 1, Item 2 (era 3), Item 3 (era 4)
```

---

## Ejemplos Detallados

### Ejemplo 1: Agregar Nueva Compra

**Contexto**: Compraste 2 laptops Dell para el departamento de desarrollo.

```javascript
// Frontend
const response = await fetch(
  '/company-inventories/inv-uuid-123/items',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        {
          device_type: 'laptop',
          brand: 'Dell',
          model: 'XPS 15 9520',
          service_tag: 'DELL001',
          serial_number: 'SN123456',
          ram: '32GB',
          storage: '1TB SSD',
          processor: 'Intel i7-12700H',
          purchase_date: '2025-12-01',
          department: 'Desarrollo',
          status: 'Disponible'
        },
        {
          device_type: 'laptop',
          brand: 'Dell',
          model: 'XPS 15 9520',
          service_tag: 'DELL002',
          serial_number: 'SN123457',
          ram: '32GB',
          storage: '1TB SSD',
          processor: 'Intel i7-12700H',
          purchase_date: '2025-12-01',
          department: 'Desarrollo',
          status: 'Disponible'
        }
      ],
      updated_by: 'admin-uuid-789'
    })
  }
);

const data = await response.json();
console.log(data);
// {
//   message: "2 items agregados al inventario correctamente.",
//   items_added: 2,
//   total_items: 15
// }
```

### Ejemplo 2: Actualizar Asignación de Equipo

**Contexto**: El laptop en índice 0 fue asignado a un nuevo empleado.

**Paso 1: Obtener el inventario actual (para ver qué está en índice 0)**
```javascript
const inventario = await fetch('/company-inventories/inv-uuid-123').then(r => r.json());
console.log(inventario.inventory[0]);
// {
//   service_tag: 'DELL001',
//   assigned_to: 'Juan Pérez',  // ← Queremos cambiar esto
//   status: 'En uso'
// }
```

**Paso 2: Actualizar solo ese ítem**
```javascript
await fetch('/company-inventories/inv-uuid-123/items/0', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    item: {
      device_type: 'laptop',
      brand: 'Dell',
      model: 'XPS 15 9520',
      service_tag: 'DELL001',
      serial_number: 'SN123456',
      ram: '32GB',
      storage: '1TB SSD',
      processor: 'Intel i7-12700H',
      assigned_to: 'María García',  // ✅ Actualizado
      department: 'Desarrollo',
      status: 'En uso'
    },
    updated_by: 'admin-uuid-789'
  })
});
```

**⚠️ IMPORTANTE**: Al actualizar, debes enviar TODOS los campos del ítem, no solo los que cambiaron.

### Ejemplo 3: Dar de Baja un Equipo

**Contexto**: El monitor en índice 10 se dañó irreparablemente.

```javascript
await fetch('/company-inventories/inv-uuid-123/items/10', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    updated_by: 'admin-uuid-789'
  })
});

// ✅ El monitor en índice 10 se elimina
// ✅ Los ítems 11, 12, 13... se reindexan a 10, 11, 12...
```

### Ejemplo 4: Workflow Completo

**Escenario**: Inventario inicial de 10 equipos, múltiples operaciones.

```javascript
// Estado inicial: 10 equipos (índices 0-9)

// Operación 1: Agregar 2 laptops nuevos
await addItems(id, [laptop1, laptop2]);
// Ahora: 12 equipos (índices 0-11)
// laptop1 está en índice 10
// laptop2 está en índice 11

// Operación 2: Actualizar el laptop recién agregado (índice 10)
await updateItem(id, 10, { ...laptop1, assigned_to: 'Carlos' });
// Ahora: 12 equipos (índices 0-11)
// laptop1 en índice 10 tiene asignación a Carlos

// Operación 3: Eliminar un equipo antiguo (índice 3)
await deleteItem(id, 3);
// Ahora: 11 equipos (índices 0-10)
// ⚠️ CUIDADO: laptop1 ahora está en índice 9 (no 10)
// laptop2 ahora está en índice 10 (no 11)
```

---

## Manejo de Errores

### Error 400: Bad Request

**Causa**: Datos inválidos en el request.

```json
{
  "statusCode": 400,
  "message": "El campo \"updated_by\" es requerido.",
  "error": "Bad Request"
}
```

**Soluciones:**
- Verificar que `updated_by` esté presente
- Verificar que `items` sea un array no vacío (al agregar)
- Verificar que `item` sea un objeto (al actualizar)
- Verificar que `itemIndex` sea un número válido

### Error 404: Not Found

**Causa**: Inventario o ítem no encontrado.

```json
{
  "statusCode": 404,
  "message": "Inventario con ID \"inv-uuid-123\" no encontrado.",
  "error": "Not Found"
}
```

**Soluciones:**
- Verificar que el `id` del inventario sea correcto
- Verificar que el `itemIndex` exista en el inventario

### Error 500: Internal Server Error

**Causa**: Error del servidor.

```json
{
  "statusCode": 500,
  "message": "Error interno al agregar items al inventario.",
  "error": "Internal Server Error"
}
```

**Soluciones:**
- Revisar logs del servidor
- Contactar al equipo de backend

---

## Best Practices

### 1. Siempre Usa updated_by

```javascript
// ❌ Malo
await addItems(id, [item]);

// ✅ Bueno
await addItems(id, [item], { updated_by: currentUser.id });
```

### 2. Valida Índices Antes de Actualizar/Eliminar

```javascript
// ✅ Bueno: Verificar que el índice existe
const inventory = await getInventory(id);
if (index < inventory.inventory.length) {
  await updateItem(id, index, newData);
} else {
  console.error('Índice inválido');
}
```

### 3. Actualiza con Objeto Completo

```javascript
// ❌ Malo: Solo enviar campos modificados
await updateItem(id, 5, {
  assigned_to: 'María'  // Faltan otros campos
});

// ✅ Bueno: Enviar objeto completo
const currentItem = inventory.inventory[5];
await updateItem(id, 5, {
  ...currentItem,
  assigned_to: 'María'  // Modificar solo este campo
});
```

### 4. Ten Cuidado con Re-indexación al Eliminar

```javascript
// Guardar referencia al índice ANTES de eliminar
const targetIndex = 5;
await deleteItem(id, targetIndex);

// ⚠️ Ahora los índices cambiaron
// Lo que estaba en índice 6 ahora está en índice 5
```

### 5. Usa Transacciones para Operaciones Múltiples

Si necesitas hacer varias operaciones, considera:

**Opción A: Usar el endpoint de actualización completa**
```javascript
// Si vas a modificar muchos ítems, mejor usar PATCH /inventories/:id
```

**Opción B: Hacer operaciones secuencialmente**
```javascript
// Agregar 3 items
await addItems(id, [item1, item2, item3]);

// Luego actualizar uno específico
await updateItem(id, 10, modifiedItem);
```

---

## 🚀 Comparación: Antes vs Ahora

### Agregar 1 Laptop

**Antes (Endpoint Antiguo):**
```javascript
// Paso 1: GET inventario completo (500 items = ~500KB)
const inv = await fetch('/inventories/id').then(r => r.json());

// Paso 2: Modificar localmente
inv.inventory.push(nuevoLaptop);

// Paso 3: PATCH inventario completo (501 items = ~501KB)
await fetch('/inventories/id', {
  method: 'PATCH',
  body: JSON.stringify(inv)  // 501KB
});
```
**Total transferido: ~1MB**

**Ahora (Endpoint Granular):**
```javascript
// POST solo el nuevo item (~1KB)
await fetch('/inventories/id/items', {
  method: 'POST',
  body: JSON.stringify({
    items: [nuevoLaptop],
    updated_by: 'user'
  })  // 1KB
});
```
**Total transferido: ~1KB** ✅ **99% menos datos**

---

## 📞 Soporte

¿Preguntas sobre estos endpoints? Contacta al equipo de backend.

**Versión del documento:** 1.0  
**Última actualización:** 2025-12-03
