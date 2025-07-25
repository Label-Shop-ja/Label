# Label - Herramienta de Gestión Empresarial

Label es una herramienta completa para gestionar, controlar y escalar tu negocio. Diseñada para pequeñas y medianas empresas que buscan optimizar sus operaciones y tomar decisiones basadas en datos.

## 🚀 Características Principales

- **Gestión de Inventario**: Control completo de productos, stock y movimientos
- **Sistema POS**: Punto de venta integrado para transacciones rápidas
- **Gestión de Clientes**: Base de datos de clientes con historial de compras
- **Análisis Financiero**: Reportes y estadísticas de ventas y rentabilidad
- **Tasas de Cambio**: Manejo automático de múltiples monedas
- **Autenticación Múltiple**: Login con Google OAuth y cuentas locales
- **Sistema de Roles**: Administrador, Gerente, Cajero (en desarrollo)

## 🏗️ Arquitectura Técnica

### Frontend
- **React 18** con Vite
- **Redux Toolkit** para manejo de estado
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **React Hook Form** con validación Yup
- **Axios** para peticiones HTTP

### Backend
- **Node.js** con Express
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Passport.js** para OAuth (Google)
- **Cloudinary** para manejo de imágenes
- **Nodemailer** para emails

### Características de Seguridad
- Autenticación JWT con refresh tokens
- Middleware de protección de rutas
- Validación de datos en frontend y backend
- Manejo seguro de sesiones OAuth

## 📱 Funcionalidades Implementadas

### Sistema de Autenticación
- ✅ Login/Registro con validación
- ✅ Autenticación con Google OAuth
- ✅ Recuperación de contraseña por email
- ✅ Gestión de múltiples cuentas guardadas
- ✅ Selector inteligente de cuentas Google
- ✅ Logout con persistencia de estado

### Dashboard y Navegación
- ✅ Dashboard responsivo con sidebar
- ✅ Navegación con breadcrumbs
- ✅ Tema claro/oscuro
- ✅ Modo pantalla completa
- ✅ Animaciones fluidas entre páginas

### Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Categorización y filtrado
- ✅ Control de stock e inventario
- ✅ Historial de movimientos
- ✅ Productos globales y locales

### Sistema Financiero
- ✅ Tasas de cambio automáticas (API externa)
- ✅ Tasas personalizadas por usuario
- ✅ Cálculos multi-moneda
- ✅ Reportes de ventas y transacciones

## 🔧 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- MongoDB
- Cuentas de servicios (Google OAuth, Cloudinary, etc.)

### Configuración del Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Configuración del Frontend
```bash
cd frontend
npm install
cp .env.example .env.development
# Configurar variables de entorno
npm run dev
```

## 🆕 Últimos Cambios (Esta Sesión)

### Sistema de Múltiples Cuentas Google
- **Selector de Cuenta**: Al hacer logout y volver a iniciar con Google, muestra la última cuenta usada
- **Opción "Usar Otra Cuenta"**: Redirige a Google para seleccionar cuenta diferente
- **Login Directo**: Click en cuenta guardada loguea inmediatamente sin redirigir
- **Gestión de Cuentas**: Sistema para guardar y administrar múltiples cuentas (preparado para roles futuros)

### Mejoras de Autenticación
- **Persistencia de Logout**: La aplicación recuerda cuando el usuario se deslogueó intencionalmente
- **Optimización de Verificación**: Evita verificaciones innecesarias de tokens para mejor rendimiento
- **AccountManager**: Servicio para gestionar cuentas guardadas con limpieza automática (7 días)

### Configuración de Red
- **Desarrollo Colaborativo**: Configuración para trabajo en equipo con acceso de red local
- **Documentación de Reversión**: Instrucciones para volver a configuración local

## 🔮 Próximas Funcionalidades

- **Sistema de Roles**: Implementación completa de permisos por rol
- **Refresh Tokens Google**: Renovación automática de tokens OAuth
- **Reportes Avanzados**: Dashboard con métricas y KPIs
- **Notificaciones**: Sistema de alertas y notificaciones
- **API REST**: Documentación completa de endpoints

## 🤝 Contribución

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario de Label.

---

**Label** - Gestiona, controla y escala tu negocio 🚀