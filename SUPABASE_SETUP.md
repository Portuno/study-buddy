# Configuración de Supabase para Study Buddy

Este documento te guiará a través de la configuración de Supabase para la aplicación Study Buddy.

## 🚀 Pasos de Configuración

### 1. Instalar Dependencias

Primero, instala la dependencia de Supabase en tu proyecto:

```bash
cd study-buddy
npm install @supabase/supabase-js
```

### 2. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu **Project URL** y **anon public key**

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=tu_url_del_proyecto_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**⚠️ IMPORTANTE:** Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

### 4. Ejecutar Scripts SQL

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Ejecuta los scripts en este orden:

#### Script 1: Esquema Inicial
Copia y pega el contenido de `supabase/01_initial_schema.sql` y ejecútalo.

#### Script 2: Datos de Ejemplo (Opcional)
Después de crear tu cuenta de usuario, puedes ejecutar `supabase/05_sample_subjects.sql` para poblar la base de datos con subjects y topics de ejemplo.

**Nota:** Reemplaza `'00000000-0000-0000-0000-000000000000'` con tu ID de usuario real en el script de datos de ejemplo.

### 5. Configurar Autenticación

1. En tu proyecto de Supabase, ve a **Authentication > Settings**
2. Habilita **Email confirmations** si quieres verificar emails
3. Configura **Site URL** con tu URL de desarrollo (ej: `http://localhost:5173`)

### 6. Probar la Aplicación

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:5173`
3. Deberías ver la página de login
4. Crea una cuenta o inicia sesión

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **users**: Perfiles de usuario (extiende auth.users de Supabase)
- **subjects**: Materias de estudio (Programs/Degrees)
- **topics**: Temas dentro de cada materia
- **study_sessions**: Sesiones de estudio
- **study_materials**: Materiales de estudio (notas, documentos, archivos PDF, etc.)
- **weekly_goals**: Metas semanales

### Características de Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Políticas de seguridad configuradas automáticamente

## 🔧 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que tu archivo `.env` esté en la raíz del proyecto
- Asegúrate de que las variables tengan los nombres correctos
- Reinicia el servidor de desarrollo después de crear el archivo

### Error: "Cannot find module '@supabase/supabase-js'"
- Ejecuta `npm install @supabase/supabase-js`
- Verifica que esté en `package.json`

### Error de CORS
- Verifica que tu URL de desarrollo esté en la lista de **Site URLs** en Supabase
- Asegúrate de que la URL no termine con `/`

### Problemas de Autenticación
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el trigger `on_auth_user_created` esté funcionando

## 🚀 Próximos Pasos

Una vez que la configuración básica esté funcionando, puedes:

1. **Personalizar la UI** según tus necesidades
2. **Agregar más funcionalidades** como:
   - Subida de archivos
   - Notificaciones push
   - Integración con calendarios
3. **Implementar AI real** en la página de Chat
4. **Agregar analytics** y métricas de estudio

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API de Supabase](https://supabase.com/docs/reference/javascript/introduction)

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que todos los scripts SQL se hayan ejecutado correctamente
2. Revisa la consola del navegador para errores
3. Verifica los logs de Supabase en el dashboard
4. Asegúrate de que las variables de entorno estén configuradas correctamente 