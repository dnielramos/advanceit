# Integración de Pagos - Cambios Backend y Frontend

## Resumen de Cambios

Se actualizó el módulo de pagos para incluir:
- Campos de auditoría: `created_by`, `updated_by`, `created_at`, `updated_at`
- Datos poblados de la orden, cotización, compañía y usuario al recuperar pagos
- Requiere `user_id` en todas las operaciones de escritura

---

## 📝 Cambios por Endpoint

### 1. CREAR PAGO - `POST /payments`

#### ❌ Antes (Request)
```json
{
  "order_id": "uuid-orden",
  "monto": 1500000,
  "fechaLimitePago": "2025-12-25",
  "metodo": "transferencia",
  "createdBy": "uuid-usuario"  // <-- Campo anterior (opcional)
}
```

#### ✅ Ahora (Request)
```json
{
  "order_id": "uuid-orden",
  "monto": 1500000,
  "fechaLimitePago": "2025-12-25",
  "metodo": "transferencia",
  "user_id": "uuid-usuario"    // <-- REQUERIDO: ID del usuario que crea
}
```

#### 🔄 Cambios en Angular
```typescript
// Antes
createPayment(payment: { order_id: string; monto: number; fechaLimitePago: string; metodo: string; createdBy?: string })

// Ahora
createPayment(payment: { order_id: string; monto: number; fechaLimitePago: string; metodo: string; user_id: string })
```

---

### 2. OBTENER TODOS LOS PAGOS - `GET /payments`

#### Sin cambios en la petición

#### 🆕 Nueva Respuesta
```json
[
  {
    "id": "uuid-pago",
    "order_id": "uuid-orden",
    "order": {
      "id": "uuid-orden",
      "numeroOrden": "ORD-1EF01D4F",
      "quotation_id": "uuid-cotizacion",
      "company": {
        "id": 1,
        "razon_social": "Soluciones Tecnológicas S.A.S.",
        "nit": "123456789-0"
      },
      "user": {
        "id": "uuid-usuario-cotizacion",
        "name": "Daniel Javier Martinez",
        "email": "danielramos9991@gmail.com"
      }
    },
    "monto": 1500000,
    "fechaLimitePago": "2025-12-25",
    "metodo": "transferencia",
    "estado": "pendiente",
    "created_by": {
      "id": "uuid-creador",
      "name": "Admin Usuario"
    },
    "updated_by": {
      "id": "uuid-actualizador", 
      "name": "Admin Usuario"
    },
    "created_at": "2025-12-10T05:23:51.000Z",
    "updated_at": "2025-12-10T05:23:51.000Z",
    "fechaPago": null,
    "comprobante": ""
  }
]
```

#### 🔄 Cambios en Angular - Interface
```typescript
// Antes
export interface Payment {
  id: string;
  order_id: string;
  monto: number;
  fechaLimitePago: string;
  metodo: 'transferencia' | 'tarjeta' | 'credito';
  estado: 'pendiente' | 'pagado' | 'no_pagado' | 'atrasado';
  createdBy?: string;
  fechaPago?: string;
  comprobante?: string;
}

// Ahora
export interface PaymentUserInfo {
  id: string;
  name: string;
  email?: string;
}

export interface PaymentCompanyInfo {
  id: number;
  razon_social: string;
  nit: string;
}

export interface PaymentOrderInfo {
  id: string;
  numeroOrden: string;
  quotation_id: string;
  company: PaymentCompanyInfo;
  user: PaymentUserInfo;
}

export interface Payment {
  id: string;
  order_id: string;
  order?: PaymentOrderInfo;                    // 🆕 NUEVO
  monto: number;
  fechaLimitePago: string;
  metodo: 'transferencia' | 'tarjeta' | 'credito';
  estado: 'pendiente' | 'pagado' | 'no_pagado' | 'atrasado';
  created_by: string | PaymentUserInfo;        // 🔄 CAMBIÓ
  updated_by: string | PaymentUserInfo;        // 🆕 NUEVO
  created_at: string;                          // 🆕 NUEVO
  updated_at: string;                          // 🆕 NUEVO
  fechaPago?: string;
  comprobante?: string;
}
```

---

### 3. OBTENER PAGO POR ID - `GET /payments/:id`

#### Sin cambios en la petición
#### Misma nueva estructura de respuesta que GET /payments

---

### 4. OBTENER PAGO POR ORDEN - `GET /payments/order/:orderId`

#### Sin cambios en la petición
#### Misma nueva estructura de respuesta que GET /payments

---

### 5. ACTUALIZAR ESTADO - `PATCH /payments/:id/status`

#### ❌ Antes (Request)
```json
{
  "estado": "pagado"
}
```

#### ✅ Ahora (Request)
```json
{
  "estado": "pagado",
  "user_id": "uuid-usuario"    // <-- REQUERIDO: ID del usuario que actualiza
}
```

#### 🔄 Cambios en Angular
```typescript
// Antes
updatePaymentStatus(id: string, estado: string): Observable<Payment>

// Ahora
updatePaymentStatus(id: string, estado: string, userId: string): Observable<Payment>

// Llamada al servicio
this.paymentsService.updatePaymentStatus(paymentId, 'pagado', this.currentUser.id)
```

---

### 6. ACTUALIZAR FECHA DE PAGO - `PATCH /payments/:id/date`

#### ❌ Antes (Request)
```json
{
  "fechaPago": "2025-12-15"
}
```

#### ✅ Ahora (Request)
```json
{
  "fechaPago": "2025-12-15",
  "user_id": "uuid-usuario"    // <-- REQUERIDO: ID del usuario que actualiza
}
```

#### 🔄 Cambios en Angular
```typescript
// Antes
updatePaymentDate(id: string, fechaPago: string): Observable<Payment>

// Ahora
updatePaymentDate(id: string, fechaPago: string, userId: string): Observable<Payment>
```

---

### 7. SUBIR COMPROBANTE - `POST /payments/:id/voucher`

#### ❌ Antes (FormData)
```
comprobante: [archivo]
```

#### ✅ Ahora (FormData)
```
comprobante: [archivo]
user_id: "uuid-usuario"        // <-- REQUERIDO: ID del usuario que sube
```

#### 🔄 Cambios en Angular
```typescript
// Antes
uploadVoucher(id: string, file: File): Observable<void> {
  const formData = new FormData();
  formData.append('comprobante', file);
  return this.http.post<void>(`${this.apiUrl}/${id}/voucher`, formData);
}

// Ahora
uploadVoucher(id: string, file: File, userId: string): Observable<void> {
  const formData = new FormData();
  formData.append('comprobante', file);
  formData.append('user_id', userId);  // <-- AGREGAR ESTO
  return this.http.post<void>(`${this.apiUrl}/${id}/voucher`, formData);
}
```

---

### 8. OBTENER COMPROBANTE - `GET /payments/:id/voucher`

#### Sin cambios - Solo lectura

---

## 📋 Resumen de Cambios Requeridos en Frontend

| Endpoint | Método | ¿Cambió Request? | ¿Cambió Response? | Cambio Principal |
|----------|--------|------------------|-------------------|------------------|
| `/payments` | POST | ✅ SÍ | ✅ SÍ | Agregar `user_id`, quitar `createdBy` |
| `/payments` | GET | ❌ NO | ✅ SÍ | Nueva estructura con `order`, `created_by`, `updated_by` como objetos |
| `/payments/:id` | GET | ❌ NO | ✅ SÍ | Misma nueva estructura |
| `/payments/order/:orderId` | GET | ❌ NO | ✅ SÍ | Misma nueva estructura |
| `/payments/:id/status` | PATCH | ✅ SÍ | ✅ SÍ | Agregar `user_id` |
| `/payments/:id/date` | PATCH | ✅ SÍ | ✅ SÍ | Agregar `user_id` |
| `/payments/:id/voucher` | POST | ✅ SÍ | ❌ NO | Agregar `user_id` en FormData |
| `/payments/:id/voucher` | GET | ❌ NO | ❌ NO | Sin cambios |

---

## 🛠️ Ejemplo Completo - Servicio Angular Actualizado

```typescript
// payments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface PaymentUserInfo {
  id: string;
  name: string;
  email?: string;
}

export interface PaymentCompanyInfo {
  id: number;
  razon_social: string;
  nit: string;
}

export interface PaymentOrderInfo {
  id: string;
  numeroOrden: string;
  quotation_id: string;
  company: PaymentCompanyInfo;
  user: PaymentUserInfo;
}

export type PaymentStatus = 'pendiente' | 'pagado' | 'no_pagado' | 'atrasado';
export type PaymentMethod = 'transferencia' | 'tarjeta' | 'credito';

export interface Payment {
  id: string;
  order_id: string;
  order?: PaymentOrderInfo;
  monto: number;
  fechaLimitePago: string;
  metodo: PaymentMethod;
  estado: PaymentStatus;
  created_by: string | PaymentUserInfo;
  updated_by: string | PaymentUserInfo;
  created_at: string;
  updated_at: string;
  fechaPago?: string;
  comprobante?: string;
}

export interface CreatePaymentDto {
  order_id: string;
  monto: number;
  fechaLimitePago: string;
  metodo: PaymentMethod;
  user_id: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // GET - Sin cambios en la llamada
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentByOrderId(orderId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/order/${orderId}`);
  }

  // POST - Cambió: requiere user_id
  createPayment(payment: CreatePaymentDto): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  // PATCH - Cambió: requiere user_id
  updatePaymentStatus(id: string, estado: PaymentStatus, userId: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/${id}/status`, { estado, user_id: userId });
  }

  updatePaymentDate(id: string, fechaPago: string, userId: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/${id}/date`, { fechaPago, user_id: userId });
  }

  // POST FormData - Cambió: requiere user_id
  uploadVoucher(id: string, file: File, userId: string): Observable<void> {
    const formData = new FormData();
    formData.append('comprobante', file);
    formData.append('user_id', userId);
    return this.http.post<void>(`${this.apiUrl}/${id}/voucher`, formData);
  }

  // GET - Sin cambios
  getVoucher(id: string): Observable<{ comprobante: string }> {
    return this.http.get<{ comprobante: string }>(`${this.apiUrl}/${id}/voucher`);
  }
}
```

---

## 🎨 Ejemplo de Uso en Componente

```typescript
// payment-detail.component.ts
export class PaymentDetailComponent {
  payment: Payment;
  currentUserId: string; // Obtener del servicio de autenticación

  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getCurrentUser().id;
  }

  // Crear pago
  crearPago() {
    const nuevoPago: CreatePaymentDto = {
      order_id: this.selectedOrderId,
      monto: 1500000,
      fechaLimitePago: '2025-12-25',
      metodo: 'transferencia',
      user_id: this.currentUserId  // <-- NUEVO: Obligatorio
    };
    
    this.paymentsService.createPayment(nuevoPago).subscribe(payment => {
      console.log('Pago creado:', payment);
    });
  }

  // Actualizar estado
  marcarComoPagado(paymentId: string) {
    this.paymentsService.updatePaymentStatus(
      paymentId, 
      'pagado', 
      this.currentUserId  // <-- NUEVO: Obligatorio
    ).subscribe(payment => {
      console.log('Estado actualizado:', payment);
      // Ahora payment.updated_by tiene { id, name }
    });
  }

  // Subir comprobante
  onFileSelected(event: Event, paymentId: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.paymentsService.uploadVoucher(
        paymentId, 
        file, 
        this.currentUserId  // <-- NUEVO: Obligatorio
      ).subscribe(() => {
        console.log('Comprobante subido');
      });
    }
  }

  // Mostrar datos poblados en template
  // payment.order?.numeroOrden
  // payment.order?.company.razon_social
  // payment.order?.user.name
  // payment.created_by (puede ser string o { id, name })
}
```

---

## 📌 Helper para manejar created_by/updated_by

Como `created_by` y `updated_by` pueden ser string u objeto, usa este helper:

```typescript
// utils/payment.utils.ts
export function getUserName(user: string | PaymentUserInfo | undefined): string {
  if (!user) return 'Desconocido';
  if (typeof user === 'string') return user;
  return user.name;
}

export function getUserId(user: string | PaymentUserInfo | undefined): string {
  if (!user) return '';
  if (typeof user === 'string') return user;
  return user.id;
}

// Uso en template con pipe o en componente
// {{ getUserName(payment.created_by) }}
```

---

## ⚠️ Notas Importantes

1. **Todos los endpoints de escritura ahora requieren `user_id`** - El backend rechazará peticiones sin este campo.

2. **Las respuestas tienen nueva estructura** - Actualiza tus interfaces y templates.

3. **`created_by` y `updated_by` pueden ser string u objeto** - Depende de si el usuario existe en la base de datos.

4. **El campo `order` puede ser `undefined`** - Si la orden no tiene cotización asociada.

5. **Migración de datos existentes** - Los pagos creados antes de este cambio tendrán `created_at`, `updated_at`, `updated_by` como null hasta que se actualicen.
