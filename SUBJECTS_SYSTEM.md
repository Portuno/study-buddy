# 🎓 Sistema de Subjects (Materias) - Study Buddy

## 📋 **Descripción General**

El sistema de Subjects permite a los usuarios crear y gestionar materias individuales dentro de sus programas de estudio. Cada subject puede tener información detallada opcional para mejorar la experiencia de estudio y la planificación.

## 🗄️ **Estructura de Base de Datos**

### **Tabla Principal: `subjects`**
- **Campos Obligatorios**: `name`, `user_id`, `program_id`
- **Campos Opcionales**: `syllabus_file_path`, `instructor_name`, `start_date`, `end_date`
- **Relaciones**: Conecta con `users` y `programs` (subjects padre)

### **Tabla de Eventos: `subject_events`**
- **Propósito**: Fechas importantes como exámenes, proyectos, presentaciones
- **Campos**: `name`, `event_type`, `event_date`, `description`
- **Tipos de Eventos**: Exam, Practical Activity, Project Submission, Presentation, etc.

### **Tabla de Horarios: `subject_schedules`**
- **Propósito**: Horarios de clase regulares
- **Campos**: `day_of_week`, `start_time`, `end_time`, `location`, `description`
- **Días**: 0=Sunday, 1=Monday, 2=Tuesday, etc.

## 🚀 **Funcionalidades Implementadas**

### **1. Modal "Add Subject"**
- **Sección 1 - Subject**: Nombre obligatorio + upload de syllabus opcional
- **Sección 2 - Additional Context**: Eventos, horarios, duración, instructor (todo opcional)
- **Diseño**: Ultra-minimalista con paleta de colores pasteles

### **2. Gestión de Subjects**
- **Crear**: Con información mínima (solo nombre) o completa
- **Editar**: Todos los campos son editables posteriormente
- **Eliminar**: Con confirmación y limpieza de datos relacionados

### **3. Upload de Syllabus**
- **Formatos**: Solo PDF
- **Almacenamiento**: Supabase Storage en bucket `study-materials`
- **Ruta**: `syllabi/{user_id}/{timestamp}_{filename}`

## 🎨 **Características de UX**

### **Experiencia Fricción Cero**
- **Creación Rápida**: Solo nombre requerido (10 segundos)
- **Detalles Opcionales**: Se pueden agregar en cualquier momento
- **Interfaz Intuitiva**: Botones claros y navegación simple

### **Flexibilidad Total**
- **Edición Continua**: Modificar cualquier campo en cualquier momento
- **Información Gradual**: Agregar detalles conforme estén disponibles
- **Persistencia**: Todos los cambios se guardan automáticamente

## 🔧 **Implementación Técnica**

### **Hooks de React**
- **`useSubjects`**: CRUD completo para subjects
- **`useSubjectEvents`**: Gestión de eventos (futuro)
- **`useSubjectSchedules`**: Gestión de horarios (futuro)

### **Seguridad**
- **Row Level Security (RLS)**: Usuarios solo ven sus propios subjects
- **Validación**: Campos obligatorios y tipos de datos
- **Integridad**: Referencias y cascadas apropiadas

### **Performance**
- **Índices**: En campos de búsqueda frecuente
- **Throttling**: Prevención de llamadas excesivas a la API
- **Caching**: Estado local optimizado

## 📱 **Flujo de Usuario**

### **Crear Subject Básico**
1. Toca botón flotante "+" → "Add Subject"
2. Escribe nombre de la materia
3. Toca "Create Subject" → ¡Listo!

### **Crear Subject Completo**
1. Sigue pasos básicos
2. Toca "Show Details"
3. Agrega eventos, horarios, fechas, instructor
4. Toca "Create Subject" → ¡Materia completa!

### **Editar Subject Existente**
1. Toca en la materia en la Library
2. Modifica cualquier campo
3. Los cambios se guardan automáticamente

## 🔮 **Próximas Funcionalidades**

### **Corto Plazo**
- [ ] Edición inline de subjects
- [ ] Vista de calendario de eventos
- [ ] Notificaciones de fechas próximas

### **Mediano Plazo**
- [ ] Templates de subjects por carrera
- [ ] Importación masiva desde Excel/CSV
- [ ] Sincronización con calendarios externos

### **Largo Plazo**
- [ ] IA para sugerir horarios óptimos
- [ ] Análisis de patrones de estudio
- [ ] Recomendaciones personalizadas

## 🐛 **Solución de Problemas**

### **Error: "Subject not found"**
- Verificar que el `program_id` existe
- Comprobar permisos de RLS
- Revisar logs de consola

### **Error: "File upload failed"**
- Verificar tamaño del archivo (< 50MB)
- Comprobar formato (solo PDF)
- Revisar permisos de Storage

### **Error: "Database constraint violation"**
- Verificar que todos los campos obligatorios están presentes
- Comprobar tipos de datos correctos
- Revisar integridad referencial

## 📚 **Referencias**

- **Supabase Docs**: [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- **React Docs**: [Custom Hooks](https://reactjs.org/docs/hooks-custom.html)
- **TypeScript**: [Interface Extensions](https://www.typescriptlang.org/docs/handbook/interfaces.html) 