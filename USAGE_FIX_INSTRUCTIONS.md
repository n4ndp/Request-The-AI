# Fix para el Historial de Uso (Usage History)

## Problema solucionado

Este fix resuelve dos problemas importantes:

1. **Historial de uso se borra**: Cuando eliminabas una conversación, tu historial de uso desaparecía porque la referencia se rompía.
2. **Usuario "Unknown" en panel admin**: Aparecía "Unknown" en el panel de administrador cuando se eliminaban mensajes.

## Cambios realizados

### 1. Entidad Usage actualizada
- ✅ Agregada referencia directa al Usuario (`user_id`)
- ✅ Agregado campo para nombre del modelo (`model_name`)
- ✅ Los registros de uso ahora son independientes de las conversaciones eliminadas

### 2. Consultas optimizadas
- ✅ Las consultas ya no dependen de la cadena Message → Conversation → User
- ✅ Usan referencias directas para mejor rendimiento

### 3. Lógica de eliminación mejorada
- ✅ Los registros de uso se mantienen aunque se eliminen conversaciones
- ✅ La información del usuario y modelo se conserva

### 4. Integración en el backend
- ✅ **Esquema automático**: Hibernate maneja automáticamente los cambios de esquema
- ✅ **data.sql actualizado**: Incluye migración de datos existentes y modelos actualizados
- ✅ **Sin archivos separados**: Todo integrado en el backend

## Instrucciones de aplicación

### Paso 1: Reiniciar la aplicación

```bash
# Parar la aplicación si está corriendo
docker-compose down

# Reconstruir y iniciar (esto aplicará automáticamente todos los cambios)
docker-compose up --build
```

### Paso 2: Verificar que funciona

1. **Elimina una conversación** y verifica que tu historial de uso se mantiene
2. **En el panel de admin**, verifica que ya no aparece "Unknown" en los registros

## Qué sucede automáticamente

### Durante el inicio de la aplicación:

1. **Hibernate actualiza el esquema**:
   - Agrega columnas `user_id` y `model_name` a la tabla `usages`
   - Crea índices para optimizar consultas

2. **data.sql se ejecuta**:
   - Actualiza modelos con nombres correctos
   - Migra datos existentes de Usage (pobla `user_id` y `model_name`)
   - Corrige información de proveedores (OpenAI en lugar de Anthropic)

3. **El sistema queda actualizado**:
   - Historial de uso permanente e independiente
   - Usuarios siempre visibles en panel admin

## Verificación

Puedes verificar que todo funcionó correctamente:

```sql
-- Ver la estructura actualizada de usages
\d usages

-- Verificar que los datos se migraron correctamente
SELECT user_id, model_name, COUNT(*) 
FROM usages 
WHERE user_id IS NOT NULL 
GROUP BY user_id, model_name;

-- Ver modelos actualizados
SELECT name, provider, description FROM models ORDER BY name;
```

## Beneficios de esta integración

- 🔄 **Automático**: No requiere migración manual
- 🛡️ **Seguro**: Hibernate maneja los cambios de esquema de forma segura
- 📦 **Integrado**: Todo en un solo lugar, fácil de mantener
- 🔄 **Retrocompatible**: Migra automáticamente datos existentes
- 🚀 **Más rápido**: Una sola operación en lugar de múltiples pasos

## En caso de problemas

Si encuentras algún problema:

1. **Revisa los logs de la aplicación** para ver si hay errores de Hibernate
2. **Verifica la conexión a la base de datos** en `application.properties`
3. **Asegúrate de que la base de datos esté funcionando** antes de iniciar la app

El fix ahora está completamente integrado en tu backend y se aplica automáticamente al iniciar la aplicación! 🎉 