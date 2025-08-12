# 🚀 Configuración Completa de Study Buddy con Supabase

## 📋 Pasos de Configuración

### 1. **Instalar Dependencias**
```bash
cd study-buddy
npm install @supabase/supabase-js
```

### 2. **Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:
```bash
VITE_SUPABASE_URL=tu_url_del_proyecto_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 3. **Ejecutar Scripts SQL en Supabase**

#### Script 1: Esquema Inicial
Ejecuta `supabase/01_initial_schema.sql` en el SQL Editor de Supabase.

#### Script 2: Configuración de Storage
Ejecuta `supabase/03_storage_setup.sql` en el SQL Editor de Supabase.

### 4. **Configurar Storage en Supabase Dashboard**

1. Ve a **Storage** en tu proyecto de Supabase
2. Verifica que el bucket `study-materials` se haya creado
3. El bucket es privado por defecto (seguro)

### 5. **Configurar Autenticación**

1. En **Authentication > Settings**:
   - Habilita **Email confirmations** (opcional)
   - Configura **Site URL** con tu URL de desarrollo

2. En **Authentication > Policies**:
   - Las políticas RLS se configuran automáticamente

## 🔧 Funcionalidades Implementadas

### ✅ **Sistema de Subida de Archivos**
- **Drag & Drop**: Arrastra archivos al modal
- **Selección múltiple**: Sube varios archivos a la vez
- **Preview de archivos**: Vista previa de imágenes
- **Barra de progreso**: Seguimiento en tiempo real
- **Validación de tipos**: Solo archivos permitidos
- **Organización por carpetas**: Usuario → Subject → Topic → Archivos

### ✅ **Tipos de Archivo Soportados**
- **PDF**: Documentos académicos
- **Imágenes**: JPG, PNG, GIF, WebP
- **Audio**: MP3, WAV, OGG
- **Video**: MP4, AVI, MOV, WebM
- **Documentos**: DOC, DOCX, TXT

### ✅ **Seguridad y Permisos**
- **Bucket privado**: Solo el usuario puede acceder a sus archivos
- **RLS habilitado**: Row Level Security en todas las tablas
- **Políticas automáticas**: Usuarios solo ven sus propios datos
- **Estructura de carpetas**: Separación por usuario

### ✅ **Interfaz de Usuario**
- **Modal elegante**: Diseño limpio y minimalista
- **Colores femeninos**: Paleta de rosa, lavanda y menta
- **Responsive**: Optimizado para smartphones
- **Estados visuales**: Indicadores de progreso y estado

## 📱 Cómo Usar el Sistema de Subida

### 1. **Acceder a Library**
- Ve a la pestaña "Library" en la navegación inferior
- Toca el botón flotante "+" (rosa) en la esquina inferior derecha

### 2. **Seleccionar Subject y Topic**
- Elige un subject existente de la lista desplegable
- Escribe el nombre del topic (se crea automáticamente)

### 3. **Subir Archivos**
- **Opción A**: Arrastra archivos al área punteada
- **Opción B**: Toca "Choose Files" para seleccionar desde el dispositivo
- Selecciona múltiples archivos si es necesario

### 4. **Monitorear Progreso**
- Barra de progreso para cada archivo
- Estados: Pending → Uploading → Completed
- Indicadores visuales para cada estado

### 5. **Organización Automática**
- Los archivos se organizan automáticamente en la estructura:
  ```
  study-materials/
  └── {user_id}/
      └── {subject_id}/
          └── {topic_name}/
              └── {filename}
  ```

## 🔍 Estructura de la Base de Datos

### **Tablas Principales**
- `users`: Perfiles de usuario (extiende auth.users)
- `subjects`: Materias de estudio
- `topics`: Temas dentro de cada materia
- `study_materials`: Archivos y materiales de estudio
- `study_sessions`: Sesiones de estudio
- `weekly_goals`: Metas semanales

### **Relaciones**
```
users (1) ←→ (many) subjects
subjects (1) ←→ (many) topics
topics (1) ←→ (many) study_materials
users (1) ←→ (many) study_sessions
users (1) ←→ (many) weekly_goals
```

## 🚨 Solución de Problemas

### **Error: "must be owner of table objects"**
- ✅ **Solucionado**: Las políticas de storage se configuran automáticamente
- No necesitas modificar `storage.objects` manualmente

### **Error: "Missing Supabase environment variables"**
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor después de crear el archivo

### **Error: "Cannot find module '@supabase/supabase-js'"**
- Ejecuta `npm install @supabase/supabase-js`
- Verifica que esté en `package.json`

### **Archivos no se suben**
- Verifica que el bucket `study-materials` esté creado
- Confirma que las políticas RLS estén habilitadas
- Revisa la consola del navegador para errores

## 🎯 Próximos Pasos

### **Funcionalidades Futuras**
1. **Procesamiento AI**: Análisis automático de archivos PDF
2. **Búsqueda avanzada**: Búsqueda en contenido de archivos
3. **Compartir archivos**: Compartir entre usuarios
4. **Versiones**: Control de versiones de archivos
5. **Comentarios**: Sistema de comentarios en archivos

### **Mejoras de UX**
1. **Notificaciones push**: Alertas de subida completada
2. **Historial de subidas**: Lista de archivos recientes
3. **Favoritos**: Marcar archivos importantes
4. **Etiquetas**: Sistema de etiquetas para archivos

## 📚 Recursos Adicionales

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API de Storage](https://supabase.com/docs/reference/javascript/storage-createbucket)

## 🆘 Soporte

Si encuentras problemas:

1. **Verifica la consola del navegador** para errores
2. **Revisa los logs de Supabase** en el dashboard
3. **Confirma que todos los scripts SQL** se ejecutaron correctamente
4. **Verifica las variables de entorno** en el archivo `.env`

---

¡Tu sistema de subida de archivos está listo! 🎉 