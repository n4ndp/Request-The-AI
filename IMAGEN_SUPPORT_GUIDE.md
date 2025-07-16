# Guía de Soporte de Imágenes en Request The AI

## 🖼️ Nueva Funcionalidad: Envío de Imágenes

¡Ahora puedes enviar imágenes junto con tus mensajes para que la IA las analice! Esta funcionalidad está disponible para modelos que soportan visión.

## 🤖 Modelos Compatibles

Los siguientes modelos soportan el análisis de imágenes:
- **GPT-4o** - Modelo principal con capacidades de visión
- **GPT-4o-mini** - Versión más eficiente con visión
- **GPT-4-vision-preview** - Modelo de vista previa

## 🚀 Cómo Usar

### 1. Seleccionar un Modelo Compatible
Asegúrate de seleccionar un modelo que soporte visión (aparecerá el ícono de imagen en el input cuando esté disponible).

### 2. Enviar Imágenes
1. Haz clic en el ícono 📷 junto al campo de texto
2. Selecciona una o múltiples imágenes (formatos: JPG, PNG, GIF, WebP)
3. Verás una vista previa de las imágenes seleccionadas
4. Escribe tu pregunta sobre las imágenes (opcional)
5. Presiona enviar

### 3. Tipos de Análisis Disponibles

#### Descripción de Imágenes
```
"¿Qué ves en esta imagen?"
"Describe detalladamente lo que aparece en la foto"
```

#### Análisis Técnico
```
"¿Qué problemas técnicos puedes identificar en esta captura de pantalla?"
"Explica el código que se muestra en esta imagen"
```

#### Reconocimiento de Texto (OCR)
```
"Transcribe el texto que aparece en esta imagen"
"¿Qué dice el documento en la foto?"
```

#### Análisis Comparativo
```
"¿Cuáles son las diferencias entre estas dos imágenes?"
"Compara los elementos visuales de estas fotos"
```

## 💡 Consejos de Uso

### Calidad de Imagen
- Usa imágenes claras y bien iluminadas
- Evita imágenes muy borrosas o pixeladas
- El tamaño máximo recomendado es 10MB por imagen

### Preguntas Efectivas
- Sé específico en lo que quieres saber
- Puedes hacer múltiples preguntas sobre la misma imagen
- Combina texto e imágenes para mejor contexto

### Limitaciones
- No todas las imágenes médicas o contenido sensible pueden ser procesados
- Las imágenes muy pequeñas pueden no ser analizadas correctamente
- El modelo funciona mejor con imágenes en orientación correcta

## 🔧 Características Técnicas

### Formatos Soportados
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG (limitado)

### Procesamiento
- Las imágenes se envían en formato base64
- Se procesan junto con el texto en una sola solicitud
- El costo incluye tokens adicionales por imagen (~200 tokens por imagen)

### Seguridad
- Las imágenes se procesan de forma segura
- No se almacenan permanentemente en nuestros servidores
- Se respeta la privacidad del usuario

## 📊 Costos

El análisis de imágenes consume tokens adicionales:
- **Texto**: Costo normal según el modelo
- **Imágenes**: ~200 tokens adicionales por imagen
- **Total**: Suma del texto + imágenes

## 🔄 Historial

Las conversaciones con imágenes se guardan en el historial, pero las imágenes en sí no se conservan por motivos de privacidad y espacio.

## ❓ Ejemplos de Uso

### Ejemplo 1: Análisis de Documento
```
Usuario: [Sube imagen de una factura]
Mensaje: "Extrae la información principal de esta factura"

IA: Analiza y extrae datos como fecha, monto, empresa, etc.
```

### Ejemplo 2: Debugging de Código
```
Usuario: [Sube captura de pantalla con error]
Mensaje: "¿Qué error está ocurriendo aquí y cómo lo soluciono?"

IA: Identifica el error y proporciona soluciones
```

### Ejemplo 3: Análisis Creativo
```
Usuario: [Sube foto de paisaje]
Mensaje: "Describe este paisaje en estilo poético"

IA: Crea una descripción artística de la imagen
```

## 🐛 Solución de Problemas

### El botón de imagen no aparece
- Verifica que estés usando un modelo compatible (GPT-4o, GPT-4o-mini)
- Actualiza la página si es necesario

### Error al cargar imagen
- Verifica que el archivo sea una imagen válida
- Reduce el tamaño si es muy grande (>10MB)
- Intenta con otro formato de imagen

### La IA no entiende la imagen
- Asegúrate de que la imagen sea clara y nítida
- Agrega contexto en texto sobre qué estás mostrando
- Intenta con una imagen de mejor calidad

## 📞 Soporte

Si encuentras problemas con la funcionalidad de imágenes:
1. Verifica que tengas créditos suficientes
2. Confirma que estás usando un modelo compatible
3. Intenta con imágenes más pequeñas o claras
4. Contacta al soporte si el problema persiste

¡Disfruta explorando las capacidades visuales de la IA! 🎉 