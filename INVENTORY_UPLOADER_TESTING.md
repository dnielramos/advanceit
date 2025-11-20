# 🧪 Guía de Testing - Inventory Uploader

## Información de Implementación

**Componente:** `inventory-uploader.component`  
**Ruta:** `/dashboard/inventory-uploader`  
**Archivos Modificados:**
- `inventory-uploader.component.ts` - Lógica con 7 nuevas signals
- `inventory-uploader.component.html` - UI con loaders y progreso
- `company-inventories.service.ts` - Validación y progreso

---

## 📋 Checklist de Testing

### ✅ Fase 1: Visualización Inicial

```
□ Abrir /dashboard/inventory-uploader
□ Verificar que se muestren las empresas registradas
□ Verificar que aparezca botón "Nuevo" en header
□ Verificar que se muestre selector de vista (Grid/List)
□ Verificar que el botón "Refrescar" actualice la lista
□ Verificar responsividad en mobile
```

**Resultado esperado:** Página carga correctamente sin errores en consola.

---

### ✅ Fase 2: Estados de Carga

#### 2.1 Cuando la lista está cargando

```
□ Hacer clic en "Refrescar"
□ Verificar que aparezcan skeleton loaders
□ En vista Grid: Ver 3 tarjetas placeholder animadas
□ En vista List: Ver tabla con 5 filas placeholder
□ Verificar que el título muestre "Cargando..." con spinner
□ Verificar que después de 2-3 seg se muestre la lista real
□ Verificar que los loaders desaparezcan
```

**Resultado esperado:** Skeleton loaders animan suavemente con efecto pulse.

#### 2.2 Cuando NO hay empresas

```
□ Vaciar la base de datos (o usar cuenta sin inventarios)
□ Abrir /dashboard/inventory-uploader
□ Verificar que se muestre mensaje "No hay inventarios registrados"
□ Verificar que aparezca botón "Registrar inventario" en el mensaje
□ Verificar que se pueda hacer clic en el botón
□ Verificar que abra el modal de creación
```

**Resultado esperado:** Mensaje amigable con CTA clara.

---

### ✅ Fase 3: Creación de Inventario

#### 3.1 Abrir modal de creación

```
□ Hacer clic en "Nuevo"
□ Verificar que se abra el modal fijo
□ Verificar que tenga inputs: Nombre empresa, File input
□ Verificar que botones: Registrar inventario, Cancelar
□ Verificar que inputs estén habilitados
□ Verificar que botón "Registrar" esté deshabilitado (sin datos)
```

**Resultado esperado:** Modal se abre correctamente con todos los elementos.

#### 3.2 Validación de inputs vacíos

```
□ No llenar nombre de empresa
□ No seleccionar archivo
□ Verificar que botón "Registrar" esté deshabilitado
□ Llenar solo nombre (sin archivo)
□ Verificar que botón sigue deshabilitado
□ Seleccionar solo archivo (sin nombre)
□ Verificar que botón sigue deshabilitado
```

**Resultado esperado:** Botón se habilita solo cuando ambos campos tienen datos.

---

### ✅ Fase 4: Selección de Archivo

#### 4.1 Archivo válido pequeño (< 1 MB)

```
□ Hacer clic en "File input"
□ Seleccionar archivo Excel valid (.xlsx)
□ Verificar que aparezca mensaje "Máx. 50 MB (Excel/CSV)"
□ Verificar que se muestre barra azul de progreso
□ Verificar que aparezca "Leyendo archivo: X MB"
□ Verificar que aparezca porcentaje (0-100%)
□ Verificar que aparezca spinner "fa-hourglass-half" animado
□ Esperar a que complete (< 1 seg para archivo pequeño)
□ Verificar que aparezca "success" verde con checkmark
□ Verificar que desaparezca progreso después de 1.5 seg
□ Verificar que aparezca tabla de preview con datos
□ Verificar que se muestre "X filas encontradas"
□ Verificar que button "Registrar" ahora esté HABILITADO
```

**Resultado esperado:** Flujo suave sin errores, datos se muestran en preview.

#### 4.2 Archivo más grande (5-20 MB)

```
□ Seleccionar archivo Excel grande (5-20 MB)
□ Verificar que la barra de progreso anima lentamente
□ Verificar que el porcentaje se actualiza en tiempo real
□ Verificar que tamaño se muestra correctamente (ej: "12 MB")
□ Esperar a que complete
□ Verificar que todos los datos se cargan correctamente
□ Verificar que preview muestra las primeras 5 filas
```

**Resultado esperado:** Progreso se actualiza fluidamente, archivo se procesa.

#### 4.3 Archivo muy grande (45-55 MB)

```
□ CASO 1: Archivo de 50 MB exacto
  - Seleccionar
  - Verificar que se lee correctamente
  - Verificar que progreso llega a 100%
  
□ CASO 2: Archivo > 50 MB (55 MB)
  - Seleccionar
  - Verificar que aparezca error: "Archivo demasiado grande"
  - Verificar que error se muestre en caja roja
  - Verificar que uploadStatus = 'error'
  - Verificar que button "Registrar" esté deshabilitado
  - Verificar que inputs estén habilitados para intentar otro
```

**Resultado esperado:** 50 MB se acepta, > 50 MB se rechaza con mensaje claro.

#### 4.4 Validación de extensión

```
□ CASO 1: Extensión válida
  □ Seleccionar .xlsx → Funciona
  □ Seleccionar .xls → Funciona
  □ Seleccionar .csv → Funciona
  
□ CASO 2: Extensión inválida
  □ Intentar seleccionar .txt
  □ Verificar que aparezca error: "Formato de archivo no válido"
  □ Verificar caja roja con icono de exclamación
  □ Verificar que uploadStatus = 'error'
  
□ CASO 3: Archivo vacío
  □ Crear archivo Excel vacío (sin datos)
  □ Seleccionar
  □ Verificar que aparezca error: "El archivo está vacío..."
  □ Verificar caja roja
```

**Resultado esperado:** Solo Excel/CSV se aceptan, archivos vacíos se rechazan.

#### 4.5 Cambio de archivo

```
□ Seleccionar archivo 1
□ Ver preview de datos
□ Seleccionar archivo 2 (diferente)
□ Verificar que preview se actualiza con datos nuevos
□ Verificar que error anterior desaparezca
□ Verificar que no haya datos de ambos archivos mezclados
```

**Resultado esperado:** Preview actualiza correctamente con nuevo archivo.

---

### ✅ Fase 5: Guardado de Inventario

#### 5.1 Guardado exitoso

```
□ Llenar nombre de empresa (ej: "Mi Empresa")
□ Seleccionar archivo válido
□ Ver preview de datos
□ Hacer clic en "Registrar inventario"
□ Verificar que button muestre spinner + "Guardando..."
□ Verificar que inputs se deshabiliten
□ Verificar que aparezca barra verde "Guardando inventario en servidor..."
□ Verificar que barra verde tiene efecto pulse
□ Esperar respuesta del servidor (2-5 seg)
□ Verificar que aparezca checkmark verde: "¡Inventario procesado correctamente!"
□ Esperar 1.5 seg
□ Verificar que modal se cierre automáticamente
□ Verificar que lista de empresas se recargue
□ Verificar que aparezca la nueva empresa en la lista
□ Verificar que no haya errores en consola
```

**Resultado esperado:** Flujo completo sin errores, datos se guardan y lista se actualiza.

#### 5.2 Error en guardado

```
□ Simular error (desconectar red o error del backend)
□ Llenar formulario y enviar
□ Verificar que button siga mostrando spinner
□ Verificar que barra verde desaparezca después de unos seg
□ Verificar que aparezca caja ROJA de error
□ Verificar que muestre mensaje del backend
□ Verificar que isSavingInventory = false (button normal)
□ Verificar que inputs se habiliten
□ Verificar que pueda intentar guardar de nuevo
```

**Resultado esperado:** Error se maneja gracefully, user puede reintentar.

---

### ✅ Fase 6: Cancelación

#### 6.1 Cancelar sin cambios

```
□ Abrir modal
□ No hacer nada
□ Hacer clic en "Cancelar"
□ Verificar que modal se cierre
□ Verificar que no aparezca ningún error
```

**Resultado esperado:** Modal cierra sin lado effects.

#### 6.2 Cancelar con cambios

```
□ Abrir modal
□ Llenar nombre de empresa
□ Seleccionar archivo
□ Ver preview
□ Hacer clic en "Cancelar"
□ Verificar que modal se cierre
□ Abrir modal de nuevo
□ Verificar que nombre esté vacío
□ Verificar que NO haya preview
□ Verificar que todo esté limpio
```

**Resultado esperado:** Todos los campos se resetean.

#### 6.3 Cancelar durante lectura

```
□ Seleccionar archivo grande (5+ MB)
□ Mientras está procesando (barra azul activa)
□ Hacer clic en "Cancelar"
□ Verificar que modal se cierre
□ Verificar que barra de progreso desaparezca
□ Abrir modal de nuevo
□ Verificar que esté limpio
```

**Resultado esperado:** Lectura se cancela, modal limpio.

#### 6.4 Cancelar durante guardado (NO DEBE PASAR)

```
□ Seleccionar archivo y rellenar
□ Hacer clic en "Registrar"
□ Intentar hacer clic en "Cancelar" mientras está guardando
□ Verificar que "Cancelar" esté deshabilitado
□ Esperar a que termine guardado
□ Verificar que luego se cierre automáticamente
```

**Resultado esperado:** Botón deshabilitado durante guardado.

---

### ✅ Fase 7: Validación de Campos

#### 7.1 Nombre de empresa

```
□ Seleccionar archivo
□ Ver preview
□ Dejar campo "Nombre empresa" vacío
□ Verificar que button "Registrar" esté DESHABILITADO
□ Escribir nombre
□ Verificar que button se HABILITE
□ Verificar que nombre se guarde correctamente
```

**Resultado esperado:** Validación funciona.

#### 7.2 Caracteres especiales en nombre

```
□ Escribir nombre con caracteres especiales: "Empresa & Cia. Ltd. (2025)"
□ Seleccionar archivo
□ Guardar
□ Verificar que se guarde correctamente
□ Verificar en backend que caracteres se sanitizaron o guardaron bien
```

**Resultado esperado:** Manejo correcto de caracteres especiales.

---

### ✅ Fase 8: Responsividad

#### 8.1 Desktop (>1024px)

```
□ Abrir en desktop (1440x900)
□ Verificar que inputs estén en fila horizontal
□ Verificar que 3 botones estén juntos
□ Verificar que tabla de preview tenga todas columnas visibles
□ Verificar que lista de empresas en Grid tenga 3 columnas
□ Verificar que tabla de lista tenga todas columnas
```

**Resultado esperado:** Layout óptimo en desktop.

#### 8.2 Tablet (768px-1024px)

```
□ Abrir en tablet (768x1024 o simular en DevTools)
□ Verificar que inputs estén en fila con gap
□ Verificar que botones tengan tamaño legible
□ Verificar que lista de empresas en Grid tenga 2 columnas
□ Verificar que tabla tenga scroll horizontal si es necesario
□ Verificar que esté todo usable (sin problemas de tap)
```

**Resultado esperado:** Layout ajustado para tablet.

#### 8.3 Mobile (< 768px)

```
□ Abrir en mobile (375x812 o simular en DevTools)
□ Verificar que inputs estén apilados verticalmente
□ Verificar que botones ocupen ancho completo o estén ajustados
□ Verificar que lista de empresas en Grid tenga 1 columna
□ Verificar que tabla tenga scroll horizontal
□ Verificar que todo sea usable sin horizontal scroll
□ Probar tap en todos los botones
```

**Resultado esperado:** Completamente usable en mobile.

---

### ✅ Fase 9: Persistencia y Estados

#### 9.1 Estado después de reload

```
□ Guardar un inventario
□ Hacer F5 (refresh)
□ Verificar que nueva empresa aparezca en lista
□ Verificar que datos se mantienen
□ No hacer refresh, volver a listar
□ Verificar que sigue apareciendo
```

**Resultado esperado:** Datos persisten en backend.

#### 9.2 Modal cerrado después de guardado

```
□ Guardar inventario
□ Verificar que modal se cierre automáticamente
□ Verificar que no haya que hacer clic en nada
□ Verificar que lista se recargue automáticamente
□ Verificar que nueva empresa esté visible
```

**Resultado esperado:** Flujo completamente automático.

---

### ✅ Fase 10: Animaciones

#### 10.1 Spinners

```
□ Ver spinner en "Cargando..." del título - ✓ Gira
□ Ver spinner "Registrar" durante guardado - ✓ Gira
□ Ver spinner en caja de error - ✓ Gira
□ Todos deben girar continuamente sin saltos
```

**Resultado esperado:** Spinners rotan suavemente.

#### 10.2 Barras de progreso

```
□ Barra azul mientras lee archivo - ✓ Anima desde 0-100%
□ Barra verde mientras guarda - ✓ Tiene efecto pulse
□ Barra azul en tabla de loading - ✓ Smooth
□ Todas las animaciones deben ser suaves
```

**Resultado esperado:** Animaciones fluidas sin saltos.

#### 10.3 Skeleton loaders

```
□ Al recargar empresas - ✓ Cartas aparecen con efecto pulse
□ Los efectos deben ser suaves
□ Deben desaparecer cuando carga
□ No debe haber parpadeo
```

**Resultado esperado:** Transiciones suaves.

---

### ✅ Fase 11: Accesibilidad

#### 11.1 Teclado

```
□ Tab por todos los inputs
□ Verificar que orden de tab sea lógico
□ Verificar que botones sean accesibles con Tab
□ Presionar Enter en campo de file input (si aplica)
□ Presionar Enter en botón Registrar
```

**Resultado esperado:** Navegación completa con teclado.

#### 11.2 Mensajes claros

```
□ Error en archivo grande - ✓ Mensaje claro y legible
□ Error en formato - ✓ Mensaje específico
□ Éxito - ✓ Checkmark + mensaje
□ Loading - ✓ Indicador claro de que está procesando
```

**Resultado esperado:** Mensajes accesibles y claros.

---

### ✅ Fase 12: Casos Edge

#### 12.1 Red lenta

```
□ Simular red lenta (throttle en DevTools a 3G)
□ Seleccionar archivo grande (10 MB)
□ Verificar que progreso se actualiza lentamente pero correctamente
□ Guardar inventario
□ Verificar que se muestre "Guardando..." por más tiempo
□ Verificar que finalmente se completa
```

**Resultado esperado:** Funciona correctamente con red lenta.

#### 12.2 Desconexión durante carga

```
□ Desconectar red (Offline en DevTools)
□ Intentar cargar archivo
□ Verificar que muestre error de red
□ Reconectar
□ Intentar de nuevo
□ Verificar que funcione de nuevo
```

**Resultado esperado:** Error se maneja, no hay crash.

#### 12.3 Archivo corrupto

```
□ Crear archivo Excel corrupto (cambiar extensión de .pdf a .xlsx)
□ Seleccionar
□ Verificar que muestre error: "Error al procesar el archivo..."
□ Verificar que no crash la app
□ Poder intentar otro archivo
```

**Resultado esperado:** Error amigable, app sigue funcionando.

#### 12.4 Memoria (archivo muy grande)

```
□ Intentar con archivo de 100 MB (si quieres probar límite)
□ Verificar que se rechace con "Archivo demasiado grande"
□ Verificar que no consuma memoria excesiva
□ Verificar que app siga responsivo
```

**Resultado esperado:** Validación de cliente previene problemas.

---

## 📝 Notas de Testing

### Cómo crear archivos de prueba

**Excel pequeño (100 KB):**
```
1. Abrir Excel
2. Llenar con datos:
   - Col A: SKU
   - Col B: Nombre
   - Col C: Precio
3. Agregar 100-500 filas
4. Guardar como .xlsx
```

**Excel grande (5 MB):**
```
1. Crear archivo Excel con muchas filas (50,000+)
2. Agregar varias columnas
3. Guardar
```

**CSV:**
```
SKU,Nombre,Precio
001,Producto 1,100
002,Producto 2,200
...
```

### Herramientas útiles

**DevTools (Chrome):**
- F12 → Network Tab: Ver tiempo de carga
- F12 → Network Tab: Throttling: Simular red lenta
- F12 → DevTools: Toggle device (simular mobile)

**Simulación de errores:**
- Desconectar red (DevTools → Network → Offline)
- Simular red lenta (DevTools → Network → 3G)

---

## ✅ Checklist Final

```
□ Todos los tests de Fase 1-12 pasaron
□ No hay errores en consola (F12)
□ No hay memory leaks
□ Responsive en mobile/tablet/desktop
□ Animaciones son fluidas
□ Mensajes son claros
□ Comportamiento es consistente
□ Datos persisten correctamente
□ Auto-reload funciona
□ Modal se cierra automáticamente
□ Todos los loaders aparecen/desaparecen correctamente
```

---

## 🎯 Resultado Final

Si todos los tests pasan: ✅ **LISTO PARA PRODUCCIÓN**

---

*Última actualización: 19 de Noviembre, 2025*
