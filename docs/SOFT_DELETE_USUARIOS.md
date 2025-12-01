# Soft Delete para Usuarios

## Objetivo

Implementar funcionalidad de **soft delete** para que los administradores puedan "eliminar" usuarios sin perderlos realmente de la base de datos. Los usuarios eliminados se marcan como `INACTIVE` y pueden ser reactivados posteriormente.

---

## Cambios Implementados

### 1. Base de Datos

**Migración SQL:** [add_user_status_field.sql](file:///d:/Dev/advance/genai/migrations/add_user_status_field.sql)

```sql
ALTER TABLE users
ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE';

UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
```

**Nuevo campo:**
- `status`: ENUM con valores `ACTIVE` o `INACTIVE`
- Por defecto: `ACTIVE`
- Usuarios existentes se actualizan automáticamente a `ACTIVE`

---

### 2. Entidad User

**Archivo:** [user.entity.ts](file:///d:/Dev/advance/genai/src/modules/users/user.entity.ts#L23)

Agregado campo:
```typescript
export interface User {
  // ... campos existentes
  status: 'ACTIVE' | 'INACTIVE';
}
```

---

### 3. Servicio de Usuarios

**Archivo:** [user-crud.service.ts](file:///d:/Dev/advance/genai/src/modules/users/user-crud.service.ts#L365-L434)

#### Método: `softDelete(id: string)`

**Descripción:** Marca un usuario como `INACTIVE` sin eliminarlo físicamente.

**Funcionamiento:**
1. Verifica que el usuario existe
2. Actualiza `status` a `INACTIVE`
3. Actualiza `updatedAt` con timestamp actual
4. Registra en logs el cambio
5. Devuelve el usuario actualizado (sin password)

**Código:**
```typescript
async softDelete(id: string): Promise<Omit<User, 'password'>> {
  this.logger.log(`Soft deleting user with ID: ${id}`);
  
  const user = await this.findOneById(id);
  if (!user) {
    throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
  }

  const [result] = await this.sqlProcesor.executeQuery(
    `UPDATE users 
     SET status = 'INACTIVE', updatedAt = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [id],
  );

  this.logger.log(`User ${id} (${user.email}) soft deleted successfully`);

  const updatedUser = await this.findOneById(id);
  const { password, ...userWithoutPassword } = updatedUser!;
  return userWithoutPassword;
}
```

#### Método: `reactivate(id: string)`

**Descripción:** Reactiva un usuario marcado como `INACTIVE`.

**Funcionamiento:**
1. Verifica que el usuario existe
2. Actualiza `status` a `ACTIVE`
3. Actualiza `updatedAt` con timestamp actual
4. Registra en logs el cambio
5. Devuelve el usuario actualizado (sin password)

**Código:**
```typescript
async reactivate(id: string): Promise<Omit<User, 'password'>> {
  this.logger.log(`Reactivating user with ID: ${id}`);
  
  const user = await this.findOneById(id);
  if (!user) {
    throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
  }

  const [result] = await this.sqlProcesor.executeQuery(
    `UPDATE users 
     SET status = 'ACTIVE', updatedAt = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [id],
  );

  this.logger.log(`User ${id} (${user.email}) reactivated successfully`);

  const updatedUser = await this.findOneById(id);
  const { password, ...userWithoutPassword } = updatedUser!;
  return userWithoutPassword;
}
```

---

### 4. Controlador de Usuarios

**Archivo:** [user.controller.ts](file:///d:/Dev/advance/genai/src/modules/users/user.controller.ts#L169-L194)

#### Endpoint: `DELETE /users/:id`

**Descripción:** Marca un usuario como inactivo (soft delete)

**Método HTTP:** `DELETE`

**Autorización:** Solo Admin (comentado por ahora)

**Request:**
```bash
DELETE http://localhost:3000/users/{user-id}
```

**Response (200 OK):**
```json
{
  "message": "Usuario marcado como inactivo exitosamente",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "status": "INACTIVE",
    "updatedAt": "2025-11-30T20:00:00.000Z"
  }
}
```

**Ejemplo con curl:**
```bash
curl -X DELETE http://localhost:3000/users/uuid-del-usuario \
  -H "Content-Type: application/json"
```

---

#### Endpoint: `PATCH /users/:id/reactivate`

**Descripción:** Reactiva un usuario inactivo

**Método HTTP:** `PATCH`

**Autorización:** Solo Admin (comentado por ahora)

**Request:**
```bash
PATCH http://localhost:3000/users/{user-id}/reactivate
```

**Response (200 OK):**
```json
{
  "message": "Usuario reactivado exitosamente",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "status": "ACTIVE",
    "updatedAt": "2025-11-30T20:05:00.000Z"
  }
}
```

**Ejemplo con curl:**
```bash
curl -X PATCH http://localhost:3000/users/uuid-del-usuario/reactivate \
  -H "Content-Type: application/json"
```

---

## Flujo de Uso

### 1. Soft Delete (Administrador)

```
Admin quiere "eliminar" un usuario
        ↓
DELETE /users/{id}
        ↓
Sistema marca status = 'INACTIVE'
        ↓
Usuario ya no puede iniciar sesión
        ↓
Datos conservados en BD
```

### 2. Reactivar Usuario

```
Admin quiere reactivar usuario
        ↓
PATCH /users/{id}/reactivate
        ↓
Sistema marca status = 'ACTIVE'
        ↓
Usuario puede iniciar sesión nuevamente
```

---

## Ventajas del Soft Delete

✅ **Preserva datos históricos** - No se pierde información  
✅ **Reversible** - Se puede reactivar en cualquier momento  
✅ **Auditoría completa** - Se mantiene historial  
✅ **Seguridad** - Evita eliminación accidental permanente  
✅ **Cumplimiento legal** - Algunos datos deben conservarse  

---

## Consideraciones

### Filtrar usuarios inactivos

Si deseas que `GET /users` solo devuelva usuarios activos, actualiza el servicio:

```typescript
async findAll(): Promise<User[]> {
  const [rows] = await this.sqlProcesor.executeQuery<RowDataPacket[]>(
    'SELECT * FROM users WHERE status = ? ORDER BY createdAt DESC',
    ['ACTIVE']
  );
  return rows as User[];
}
```

### Login solo para usuarios activos

Actualiza la validación de login en `auth.service.ts`:

```typescript
async validateUser(email: string, pass: string): Promise<any> {
  const user = await this.usersService.findOneByEmail(email);
  
  if (!user) return null;
  
  // Verificar si el usuario está activo
  if (user.status === 'INACTIVE') {
    throw new UnauthorizedException('Esta cuenta ha sido desactivada');
  }
  
  if (await bcrypt.compare(pass, user.password || '')) {
    const { password, ...result } = user;
    return result;
  }
  return null;
}
```

---

## Logs Generados

Cuando se hace soft delete:
```
[UserCrudService] Soft deleting user with ID: uuid-123
[UserCrudService] User uuid-123 (usuario@example.com) soft deleted successfully
```

Cuando se reactiva:
```
[UserCrudService] Reactivating user with ID: uuid-123
[UserCrudService] User uuid-123 (usuario@example.com) reactivated successfully
```

---

## Migración de Datos Existentes

**Ejecutar migración:**
```bash
# Conectar a MySQL
mysql -u usuario -p nombre_bd < migrations/add_user_status_field.sql
```

**Verificar:**
```sql
-- Ver estructura actualizada
DESCRIBE users;

-- Ver usuarios y su status
SELECT id, name, email, status FROM users;

-- Contar por status
SELECT status, COUNT(*) as total FROM users GROUP BY status;
```

---

## Testing Manual

### 1. Soft Delete
```bash
# Eliminar usuario
curl -X DELETE http://localhost:3000/users/uuid-usuario

# Verificar que está INACTIVE
curl http://localhost:3000/users/uuid-usuario
# Debería mostrar "status": "INACTIVE"
```

### 2. Reactivar
```bash
# Reactivar usuario
curl -X PATCH http://localhost:3000/users/uuid-usuario/reactivate

# Verificar que está ACTIVE
curl http://localhost:3000/users/uuid-usuario
# Debería mostrar "status": "ACTIVE"
```

---

## Estado de Implementación

| Componente | Estado |
|------------|--------|
| Migración SQL | ✅ Creada |
| Entidad User | ✅ Actualizada |
| Servicio softDelete | ✅ Implementado |
| Servicio reactivate | ✅ Implementado |
| Endpoint DELETE | ✅ Creado |
| Endpoint PATCH reactivate | ✅ Creado |
| Documentación | ✅ Completa |

---

## Archivos Modificados

1. **[migrations/add_user_status_field.sql](file:///d:/Dev/advance/genai/migrations/add_user_status_field.sql)** - Migración
2. **[user.entity.ts](file:///d:/Dev/advance/genai/src/modules/users/user.entity.ts)** - Agregado campo status
3. **[user-crud.service.ts](file:///d:/Dev/advance/genai/src/modules/users/user-crud.service.ts)** - Métodos softDelete y reactivate
4. **[user.controller.ts](file:///d:/Dev/advance/genai/src/modules/users/user.controller.ts)** - Endpoints DELETE y PATCH

---

## Próximos Pasos Recomendados

1. ✅ Ejecutar migración SQL en la base de datos
2. ✅ **IMPLEMENTADO** - Actualizar filtro en `findAll()` para excluir inactivos
3. ✅ **IMPLEMENTADO** - Actualizar `validateUser()` para rechazar usuarios inactivos
4. ⚠️ Habilitar guards `@Roles(Role.Admin)` en endpoints
5. ✅ **IMPLEMENTADO** - Agregar auditoría para registrar soft deletes y reactivaciones
6. ⚠️ Actualizar frontend para mostrar badge de status

---

## Mejoras Implementadas ✅

### 1. Filtrado de Usuarios Inactivos

**Archivo:** [user-crud.service.ts](file:///d:/Dev/advance/genai/src/modules/users/user-crud.service.ts#L277-L285)

El método `findAll()` ahora **solo devuelve usuarios ACTIVE** por defecto.

```typescript
async findAll(includeInactive: boolean = false): Promise<User[]> {
  const query = includeInactive
    ? 'SELECT * FROM users ORDER BY createdAt DESC'
    : 'SELECT * FROM users WHERE status = ? ORDER BY createdAt DESC';
  
  const params = includeInactive ? [] : ['ACTIVE'];
  
  const [rows] = await this.sqlProcesor.executeQuery<RowDataPacket[]>(query, params);
  return rows as User[];
}
```

**Uso:**
```typescript
// Solo usuarios activos (default)
const activeUsers = await userService.findAll();

// Todos los usuarios (activos + inactivos)
const allUsers = await userService.findAll(true);
```

---

### 2. Login Bloqueado para Usuarios Inactivos

**Archivo:** [auth.service.ts](file:///d:/Dev/advance/genai/src/auth/auth.service.ts#L26-L54)

El método `validateUser()` ahora **verifica el status** antes de permitir login.

```typescript
async validateUser(email: string, pass: string): Promise<any> {
  const user = await this.usersService.findOneByEmail(email);
  
  if (!user) {
    return null;
  }
  
  // Verificar si el usuario está activo
  if (user.status === 'INACTIVE') {
    this.auditService.logAction(Action.LOGIN_FAILED, 'auth_session', {
      userId: user.id,
      details: {
        auth_method: 'password',
        success: false,
        reason: 'inactive_account',
      },
      metadata: {
        error: 'Account is inactive',
        email: email,
      },
    });
    throw new UnauthorizedException('Esta cuenta ha sido desactivada. Contacte al administrador.');
  }
  
  if (await bcrypt.compare(pass, user.password || '')) {
    const { password, ...result } = user;
    return result;
  }
  return null;
}
```

**Flujo:**
```
Usuario inactivo intenta login
        ↓
Sistema detecta status = 'INACTIVE'
        ↓
Se registra intento en audit_logs
        ↓
Se lanza UnauthorizedException
        ↓
Usuario recibe: "Esta cuenta ha sido desactivada"
```

---

### 3. Auditoría de Soft Delete y Reactivaciones

**Archivo:** [user-crud.service.ts](file:///d:/Dev/advance/genai/src/modules/users/user-crud.service.ts#L392-L420)

Ambos métodos `softDelete()` y `reactivate()` ahora **registran en audit_logs**.

#### Registro de Soft Delete

```typescript
await this.auditService.logAction(
  Action.DELETE,
  'user',
  {
    userId: deletedBy,
    entityId: id,
    details: {
      action: 'soft_delete',
      user_email: user.email,
      user_name: user.name,
      previous_status: user.status,
      new_status: 'INACTIVE',
    },
    metadata: {
      user_role: user.type,
      deleted_at: new Date().toISOString(),
    }
  }
);
```

#### Registro de Reactivación

```typescript
await this.auditService.logAction(
  Action.UPDATE,
  'user',
  {
    userId: reactivatedBy,
    entityId: id,
    details: {
      action: 'reactivate',
      user_email: user.email,
      user_name: user.name,
      previous_status: user.status,
      new_status: 'ACTIVE',
    },
    metadata: {
      user_role: user.type,
      reactivated_at: new Date().toISOString(),
    }
  }
);
```

**Ejemplo de registro en `audit_logs`:**

```json
{
  "id": "audit-uuid",
  "user_id": "admin-uuid",
  "action_type": "delete",
  "entity_type": "user",
  "entity_id": "deleted-user-uuid",
  "details": {
    "action": "soft_delete",
    "user_email": "juan@example.com",
    "user_name": "Juan Pérez",
    "previous_status": "ACTIVE",
    "new_status": "INACTIVE"
  },
  "metadata": {
    "user_role": "user",
    "deleted_at": "2025-11-30T21:30:00.000Z"
  },
  "created_at": "2025-11-30T21:30:00.000Z"
}
```

---

## Consultas de Auditoría

### Ver todos los soft deletes
```sql
SELECT * FROM audit_logs 
WHERE action_type = 'delete' 
  AND entity_type = 'user' 
  AND JSON_EXTRACT(details, '$.action') = 'soft_delete'
ORDER BY created_at DESC;
```

### Ver todas las reactivaciones
```sql
SELECT * FROM audit_logs 
WHERE action_type = 'update' 
  AND entity_type = 'user' 
  AND JSON_EXTRACT(details, '$.action') = 'reactivate'
ORDER BY created_at DESC;
```

### Ver intentos de login de usuarios inactivos
```sql
SELECT * FROM audit_logs 
WHERE action_type = 'login_failed' 
  AND entity_type = 'auth_session' 
  AND JSON_EXTRACT(details, '$.reason') = 'inactive_account'
ORDER BY created_at DESC;
```

---

## Logs Actualizados

### Soft Delete con Auditoría
```
[UserCrudService] Soft deleting user with ID: uuid-123
[UserCrudService] User uuid-123 (usuario@example.com) soft deleted successfully
[UserCrudService] Soft delete of user uuid-123 registered in audit
```

### Reactivación con Auditoría
```
[UserCrudService] Reactivating user with ID: uuid-123
[UserCrudService] User uuid-123 (usuario@example.com) reactivated successfully
[UserCrudService] Reactivation of user uuid-123 registered in audit
```

### Login Bloqueado
```
[AuditService] Audit log created: login_failed on auth_session
[AuthService] Login attempt failed for inactive account: usuario@example.com
```

---

**Implementación completada** ✅
