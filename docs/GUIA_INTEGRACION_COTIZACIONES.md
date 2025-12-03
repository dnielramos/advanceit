# Guía de Integración: Creación de Cotizaciones

## Objetivo

Documentación completa del endpoint `POST /quotations` para crear cotizaciones con validación de cálculos, gestión de crédito y envío automático de emails.

---

## Flujo Completo

```
Frontend → Preview → Validación → Guardar → Deducir Crédito → Enviar Email
```

### 1. **Preview** (Opcional pero recomendado)
```
POST /quotations/preview
```
- Cliente obtiene cálculos del servidor
- Muestra info de crédito disponible
- Usuario revisa antes de confirmar

### 2. **Crear Cotización**
```
POST /quotations
```
- Valida todos los cálculos
- Guarda en base de datos
- Deduce del crédito de la empresa
- Registra en auditoría
- Envía email de confirmación

---

## Endpoint: POST /quotations

### Request Body

```typescript
{
  "quotation": {
    "company_id": "uuid",           // ID de la empresa
    "user_id": "uuid",              // ID del cliente/contacto
    "validity_days": 15,            // Días de variableidez
    "term": "30",                   // Plazo de pago
    "creation_mode": "MANUAL",      // MANUAL | AUTOMATIC
    "created_by": "uuid",           // ID del usuario creador
    
    // VALORES CALCULADOS - DEBEN VENIR DEL PREVIEW
    "total": 249900,
    "subtotal_productos": 200000,
    "porcentaje_descuento": 20,
    "valor_descuento": 40000,
    "valor_logistica": 50000,
    "base_gravable": 210000,
    "porcentaje_iva": 19,
    "valor_iva": 39900
  },
  "details": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 100000,
      "discount": 0,
      "subtotal": 200000,
      "taxes": 0
    }
  ]
}
```

### Validaciones Automáticas del Backend

#### 1. Validación de Cálculos

El backend **SIEMPRE** valida que los cálculos coincidan:

```typescript
// 1. Calcula valores esperados basados en:
// - Productos y cantidades
// - Descuentos de la empresa (descuento_base + descuento_especial)
// - Valor de logística de la empresa
// - IVA 19%

// 2. Compara con valores enviados por frontend
// Si NO coinciden → Error 400
```

**Fórmula de cálculo:**
```
1. subtotal_productos = Σ(unit_price × quantity)
2. porcentaje_descuento = empresa.descuento_base + empresa.descuento_especial
3. valor_descuento = subtotal_productos × (porcentaje_descuento / 100)
4. valor_logistica = empresa.valor_logistica
5. base_gravable = subtotal_productos - valor_descuento + valor_logistica
6. porcentaje_iva = 19%
7. valor_iva = base_gravable × 0.19
8. total = base_gravable + valor_iva
```

#### 2. Gestión de Crédito

Después de validar y guardar la cotización:

```typescript
// 1. Obtiene crédito actual de la empresa
const creditoDisponible = empresa.saldo_credito - empresa.saldo_gastado;

// 2. Deduce el total de la cotización
await companyService.deductCredit(empresa_id, total);

// Actualiza en BD:
// - saldo_gastado += total
// - fecha_actualizacion = NOW()

// 3. Registra en audit_logs
await auditService.logAction('UPDATE', 'company', {
  details: {
    action: 'credit_deduction',
    quotation_id: cotizacion.id,
    quotation_total: total,
    previous_spent: saldo_gastado_anterior,
    new_spent: saldo_gastado_nuevo
  }
});
```

#### 3. Envío de Email

Automáticamente envía email de confirmación al cliente:

```typescript
await quotationConfirmationMailService.send(user.email, {
  nombreCliente: user.name,
  numeroCotizacion: quotation.id,
  fechaCotizacion: new Date().toISOString(),
  razonSocial: company.razon_social,
  // ... más datos
});
```

---

## Response Exitoso (201 Created)

```json
{
  "id": "uuid-cotizacion",
  "company_id": "uuid-empresa",
  "user_id": "uuid-cliente",
  "creation_date": "2025-12-01T00:00:00.000Z",
  "expiration_date": "2025-12-16T00:00:00.000Z",
  "validity_days": 15,
  "term": "30",
  "status": "PENDING",
  "creation_mode": "MANUAL",
  "created_by": "uuid-creador",
  "total": 249900,
  "subtotal_productos": 200000,
  "porcentaje_descuento": 20,
  "valor_descuento": 40000,
  "valor_logistica": 50000,
  "base_gravable": 210000,
  "porcentaje_iva": 19,
  "valor_iva": 39900,
  "details": [
    {
      "id": "uuid-detail",
      "quotation_id": "uuid-cotizacion",
      "product_id": "uuid-producto",
      "quantity": 2,
      "unit_price": 100000,
      "discount": 0,
      "subtotal": 200000,
      "taxes": 0
    }
  ]
}
```

---

## Errores Comunes

### Error 400: Cálculos Incorrectos

```json
{
  "statusCode": 400,
  "message": "Los cálculos proporcionados no coinciden con los cálculos del servidor",
  "error": "Bad Request",
  "details": {
    "expected": {
      "subtotal_productos": 200000,
      "total": 249900
    },
    "received": {
      "subtotal_productos": 200000,
      "total": 250000
    }
  }
}
```

**Solución:** Usar siempre `POST /quotations/preview` primero y enviar esos valores exactos.

### Error 404: Empresa/Usuario no encontrado

```json
{
  "statusCode": 404,
  "message": "Company with ID uuid not found"
}
```

**Solución:** Verificar que los IDs existan en la base de datos.

### Error 500: Crédito insuficiente (Warning, NO bloquea)

El sistema permite crear cotizaciones incluso si el crédito es insuficiente, pero registra una advertencia en logs.

---

## Integración Frontend (Angular)

### Paso 1: Obtener Preview

```typescript
// quotation.service.ts
previewQuotation(data: PreviewQuotationRequest): Observable<QuotationPreviewResponse> {
  return this.http.post<QuotationPreviewResponse>(
    `${this.apiUrl}/quotations/preview`,
    data
  );
}
```

### Paso 2: Mostrar Preview al Usuario

```typescript
// quotation-create.component.ts
onPreview() {
  const previewData = {
    company_id: this.selectedCompany.id,
    user_id: this.selectedUser.id,
    products: this.products.map(p => ({
      product_id: p.id,
      quantity: p.quantity,
      unit_price: p.price
    })),
    validity_days: this.validityDays,
    term: this.paymentTerm,
    creation_mode: 'MANUAL',
    created_by: this.currentUser.id
  };

  this.quotationService.previewQuotation(previewData).subscribe({
    next: (preview) => {
      this.calculationBreakdown = preview.calculations;
      this.companyCredit = preview.company.credit;
      this.showPreviewModal = true;
    }
  });
}
```

### Paso 3: Crear Cotización con Datos del Preview

```typescript
onConfirmQuotation() {
  // IMPORTANTE: Usar exactamente los valores del preview
  const quotationData = {
    quotation: {
      company_id: this.selectedCompany.id,
      user_id: this.selectedUser.id,
      validity_days: this.validityDays,
      term: this.paymentTerm,
      creation_mode: 'MANUAL',
      created_by: this.currentUser.id,
      
      // Valores del preview - NO recalcular en frontend
      total: this.calculationBreakdown.total,
      subtotal_productos: this.calculationBreakdown.subtotal_productos,
      porcentaje_descuento: this.calculationBreakdown.porcentaje_descuento,
      valor_descuento: this.calculationBreakdown.valor_descuento,
      valor_logistica: this.calculationBreakdown.valor_logistica,
      base_gravable: this.calculationBreakdown.base_gravable,
      porcentaje_iva: this.calculationBreakdown.porcentaje_iva,
      valor_iva: this.calculationBreakdown.valor_iva
    },
    details: this.products.map(p => ({
      product_id: p.id,
      quantity: p.quantity,
      unit_price: p.price,
      discount: 0,
      subtotal: p.quantity * p.price,
      taxes: 0
    }))
  };

  this.quotationService.createQuotation(quotationData).subscribe({
    next: (quotation) => {
      this.toastr.success('Cotización creada exitosamente');
      this.router.navigate(['/quotations', quotation.id]);
    },
    error: (error) => {
      if (error.status === 400) {
        this.toastr.error('Error en los cálculos. Por favor genera un nuevo preview.');
      } else {
        this.toastr.error('Error al crear cotización');
      }
    }
  });
}
```

---

## Mejores Prácticas

### ✅ Hacer

1. **Siempre usar POST /quotations/preview antes de crear**
2. **Enviar los valores exactos del preview** al crear
3. **Mostrar el crédito disponible** al usuario antes de confirmar
4. **Manejar errores de validación** con mensajes claros
5. **Mostrar confirmación** cuando el email se envía

### ❌ Evitar

1. **NO recalcular en el frontend** - usar valores del preview
2. **NO hardcodear porcentajes** - vienen de la empresa
3. **NO ignorar errores de validación** - son críticos
4. **NO asumir que el email se envió** - verificar logs

---

## Testing Manual

### Caso 1: Cotización Básica

```bash
# 1. Preview
curl -X POST http://localhost:3000/quotations/preview \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "empresa-uuid",
    "user_id": "usuario-uuid",
    "products": [
      {"product_id": "producto-uuid", "quantity": 2, "unit_price": 100000}
    ],
    "validity_days": 15,
    "term": "30",
    "creation_mode": "MANUAL",
    "created_by": "creador-uuid"
  }'

# 2. Crear (usando valores del preview)
curl -X POST http://localhost:3000/quotations \
  -H "Content-Type: application/json" \
  -d '{
    "quotation": {
      "company_id": "empresa-uuid",
      "user_id": "usuario-uuid",
      "validity_days": 15,
      "term": "30",
      "creation_mode": "MANUAL",
      "created_by": "creador-uuid",
      "total": 249900,
      "subtotal_productos": 200000,
      "porcentaje_descuento": 20,
      "valor_descuento": 40000,
      "valor_logistica": 50000,
      "base_gravable": 210000,
      "porcentaje_iva": 19,
      "valor_iva": 39900
    },
    "details": [
      {
        "product_id": "producto-uuid",
        "quantity": 2,
        "unit_price": 100000,
        "discount": 0,
        "subtotal": 200000,
        "taxes": 0
      }
    ]
  }'
```

### Caso 2: Validar Crédito

```sql
-- Antes de crear
SELECT id, razon_social, saldo_credito, saldo_gastado,
       (saldo_credito - saldo_gastado) as disponible
FROM companies WHERE id = 'empresa-uuid';

-- Después de crear
SELECT id, razon_social, saldo_credito, saldo_gastado,
       (saldo_credito - saldo_gastado) as disponible
FROM companies WHERE id = 'empresa-uuid';

-- Ver registro de auditoría
SELECT * FROM audit_logs 
WHERE entity_type = 'company' 
  AND JSON_EXTRACT(details, '$.action') = 'credit_deduction'
ORDER BY created_at DESC LIMIT 1;
```

---

## Logs Generados

### Creación Exitosa

```
[QuotationCrudService] Creando una nueva cotización...
[QuotationCalculationService] Calculating quotation for company empresa-uuid
[QuotationCalculationService] Subtotal productos: 200000
[QuotationCalculationService] Porcentaje descuento total: 20% (base: 15%, especial: 5%)
[QuotationCalculationService] Valor logística: 50000
[QuotationCalculationService] Base gravable: 210000
[QuotationCalculationService] Valor IVA (19%): 39900
[QuotationCalculationService] Total final: 249900
[QuotationCrudService] Cotización creada con éxito.
[CompanyCrudService] Deducting 249900 from company empresa-uuid credit
[CompanyCrudService] Credit deducted successfully. New spent: 749900
[AuditService] Audit log created: update on company
[QuotationCrudService] Credit deducted: 249900. Company empresa-uuid new spent: 749900
[QuotationConfirmationMailService] Email sent to user@example.com
```

### Error de Validación

```
[QuotationCalculationService] Calculation validation failed
[QuotationCalculationService] Server calculation: {...}
[QuotationCalculationService] Provided calculation: {...}
[QuotationCrudService] Error: Los cálculos no coinciden
```

---

## Checklist de Integración

- [ ] Frontend llama a `/quotations/preview` antes de crear
- [ ] Se muestra el desglose de cálculos al usuario
- [ ] Se muestra el crédito disponible
- [ ] Usuario confirma antes de crear
- [ ] Se envían los valores exactos del preview
- [ ] Se maneja el error 400 de validación
- [ ] Se muestra mensaje de email enviado
- [ ] Se redirige a detalle de cotización después de crear

---

## Preguntas Frecuentes

### ¿Por qué validar en el backend si ya calculé en el frontend?

Para evitar manipulación de datos. El cliente podría modificar valores en la consola del navegador.

### ¿Qué pasa si el crédito es insuficiente?

El sistema **permite** crear la cotización y registra una advertencia en logs. El administrador puede revisar los reportes de crédito.

### ¿Siempre se envía el email?

Sí, automáticamente después de crear la cotización. Si falla, se registra en logs pero no bloquea la creación.

### ¿Puedo crear sin hacer preview?

Técnicamente sí, pero **NO es recomendado**. El preview garantiza que los cálculos son correctos.

---

**Última actualización:** 2025-12-01  
**Versión:** 1.0
