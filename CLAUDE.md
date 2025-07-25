# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

crea un mapa de mi repositorio, quiero ver como esta estructurado y conectado

*Session: d53b7def17dcce3425d123543a1f0294 | Generated: 6/7/2025, 14:34:50*

### Analysis Summary

# Mapa del Repositorio: Estructura y Conexiones

Este repositorio está estructurado como una aplicación de pila completa (full-stack) con un **backend** basado en Node.js y Express, y un **frontend** construido con React. Ambos componentes residen en directorios separados, [backend](backend/) y [frontend](frontend/), y se comunican a través de una API REST.

## 1. Backend

El [backend](backend/) es el corazón de la lógica de negocio y la gestión de datos de la aplicación. Está construido con Node.js y Express, y se encarga de la autenticación, la gestión de productos, ventas, usuarios, y otras operaciones relacionadas con la base de datos.

### 1.1 Componentes Principales del Backend

*   **Servidor Principal**: El punto de entrada de la aplicación es [server.js](backend/server.js), que configura el servidor Express, la conexión a la base de datos y las rutas de la API. [app.js](backend/app.js) centraliza la configuración de middleware y rutas.
*   **Configuración**: El directorio [config/](backend/config/) contiene archivos de configuración para la base de datos ([db.js](backend/config/db.js)), la autenticación (Passport.js en [passport-setup.js](backend/config/passport-setup.js)) y servicios externos como Cloudinary ([cloudinaryConfig.js](backend/config/cloudinaryConfig.js)).
*   **Modelos (Models)**: El directorio [models/](backend/models/) define los esquemas de la base de datos utilizando Mongoose. Cada archivo representa una entidad de datos (ej., [userModel.js](backend/models/userModel.js), [productModel.js](backend/models/productModel.js), [Sale.js](backend/models/Sale.js), [Client.js](backend/models/Client.js), [GlobalProduct.js](backend/models/GlobalProduct.js), [ExchangeRate.js](backend/models/ExchangeRate.js), [customExchangeRateModel.js](backend/models/customExchangeRateModel.js), [InventoryLog.js](backend/models/InventoryLog.js), [Transaction.js](backend/models/Transaction.js)). Estos modelos interactúan directamente con la base de datos.
*   **Controladores (Controllers)**: Ubicados en [controllers/](backend/controllers/), estos archivos contienen la lógica para manejar las solicitudes HTTP. Reciben datos de las rutas, interactúan con los modelos (y a veces con los servicios) para realizar operaciones de negocio y envían respuestas al cliente. Ejemplos incluyen [authController.js](backend/controllers/authController.js), [productController.js](backend/controllers/productController.js), [saleController.js](backend/controllers/saleController.js), [userController.js](backend/controllers/userController.js), [clientController.js](backend/controllers/clientController.js), [customExchangeRateController.js](backend/controllers/customExchangeRateController.js), [exchangeRateController.js](backend/controllers/exchangeRateController.js), [globalProductController.js](backend/controllers/globalProductController.js), [statsController.js](backend/controllers/statsController.js), [transactionController.js](backend/controllers/transactionController.js), [uploadController.js](backend/controllers/uploadController.js).
*   **Rutas (Routes)**: El directorio [routes/](backend/routes/) define los endpoints de la API y mapea las URLs a las funciones de los controladores. Por ejemplo, [authRoutes.js](backend/routes/authRoutes.js) maneja las rutas de autenticación, [productRoutes.js](backend/routes/productRoutes.js) las rutas de productos, etc. ([clientRoutes.js](backend/routes/clientRoutes.js), [customExchangeRateRoutes.js](backend/routes/customExchangeRateRoutes.js), [exchangeRateRoutes.js](backend/routes/exchangeRateRoutes.js), [globalProductRoutes.js](backend/routes/globalProductRoutes.js), [saleRoutes.js](backend/routes/saleRoutes.js), [statsRoutes.js](backend/routes/statsRoutes.js), [transactionRoutes.js](backend/routes/transactionRoutes.js), [uploadRoutes.js](backend/routes/uploadRoutes.js), [userRoutes.js](backend/routes/userRoutes.js)).
*   **Middleware**: En [middleware/](backend/middleware/), se encuentran funciones que se ejecutan antes de que las solicitudes lleguen a los controladores. Esto incluye [authMiddleware.js](backend/middleware/authMiddleware.js) para la protección de rutas y [errorMiddleware.js](backend/middleware/errorMiddleware.js) para el manejo centralizado de errores. [uploadMiddleware.js](backend/middleware/uploadMiddleware.js) maneja la subida de archivos.
*   **Servicios (Services)**: El directorio [services/](backend/services/) contiene lógica de negocio más compleja que puede ser reutilizada por múltiples controladores. Por ejemplo, [productService.js](backend/services/productService.js) podría contener funciones para manipular productos.
*   **Utilidades (Utils)**: El directorio [utils/](backend/utils/) contiene funciones de utilidad generales, como [generateToken.js](backend/utils/generateToken.js) para la generación de tokens JWT, [currencyCalculator.js](backend/utils/currencyCalculator.js) para cálculos de moneda, [emailTemplates.js](backend/utils/emailTemplates.js) y [sendEmail.js](backend/utils/sendEmail.js) para el envío de correos electrónicos, y [inventoryLogger.js](backend/utils/inventoryLogger.js) para el registro de inventario.
*   **Trabajos Programados**: [globalProductCleanupJob.js](backend/globalProductCleanupJob.js) es un ejemplo de un trabajo programado para la limpieza de productos globales.

### 1.2 Flujo de Datos en el Backend

Las solicitudes HTTP entran a través de las **rutas** ([routes/](backend/routes/)), pasan por el **middleware** ([middleware/](backend/middleware/)) para validación o autenticación, y luego son manejadas por los **controladores** ([controllers/](backend/controllers/)). Los controladores interactúan con los **modelos** ([models/](backend/models/)) para acceder y manipular la base de datos, y pueden utilizar **servicios** ([services/](backend/services/)) o **utilidades** ([utils/](backend/utils/)) para lógica de negocio específica o funciones auxiliares.

## 2. Frontend

El [frontend](frontend/) es la interfaz de usuario de la aplicación, construida con React y Vite. Se encarga de la presentación de datos, la interacción del usuario y el consumo de la API del backend.

### 2.1 Componentes Principales del Frontend

*   **Punto de Entrada**: La aplicación React se inicia en [main.jsx](frontend/src/main.jsx), que renderiza el componente principal [App.jsx](frontend/src/App.jsx).
*   **Componentes (Components)**: El directorio [components/](frontend/src/components/) contiene componentes reutilizables de la interfaz de usuario. Estos se organizan en subdirectorios lógicos como [Auth/](frontend/src/components/Auth/), [Common/](frontend/src/components/Common/), [Currency/](frontend/src/components/Currency/), [Dashboard/](frontend/src/components/Dashboard/), [Inventory/](frontend/src/components/Inventory/), [Pos/](frontend/src/components/Pos/), [Public/](frontend/src/components/Public/). Ejemplos de componentes de alto nivel incluyen [DashboardLayout.jsx](frontend/src/components/DashboardLayout.jsx), [Header.jsx](frontend/src/components/Header.jsx), [Sidebar.jsx](frontend/src/components/Sidebar.jsx), [ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx).
*   **Páginas (Pages)**: El directorio [pages/](frontend/src/pages/) contiene los componentes de nivel superior que representan vistas completas de la aplicación. Se organizan de manera similar a los componentes: [Admin/](frontend/src/pages/Admin/), [Auth/](frontend/src/pages/Auth/), [Common/](frontend/src/pages/Common/), [Dashboard/](frontend/src/pages/Dashboard/), [Public/](frontend/src/pages/Public/), [Settings/](frontend/src/pages/Settings/). Ejemplos incluyen [ProductsPage.jsx](frontend/src/pages/ProductsPage.jsx), [ClientsPage.jsx](frontend/src/components/ClientsPage.jsx), [FinancialPage.jsx](frontend/src/components/FinancialPage.jsx), [PosPage.jsx](frontend/src/components/PosPage.jsx), [SettingsPage.jsx](frontend/src/components/SettingsPage.jsx), [StatsPage.jsx](frontend/src/components/StatsPage.jsx).
*   **Redux**: El directorio [redux/](frontend/src/redux/) implementa la gestión del estado global de la aplicación utilizando Redux Toolkit. Contiene `slices` para diferentes partes del estado (ej., [authSlice.js](frontend/src/redux/authSlice.js), [productSlice.js](frontend/src/redux/productSlice.js)) y `services` para interactuar con la API ([authService.js](frontend/src/redux/authService.js), [productService.js](frontend/src/redux/productService.js)). El `store` se configura en [store.js](frontend/src/redux/store.js).
*   **API**: El directorio [api/](frontend/src/api/) contiene la configuración de la instancia de Axios para realizar solicitudes HTTP al backend ([axiosInstance.js](frontend/src/api/axiosInstance.js)).
*   **Contextos (Context)**: El directorio [context/](frontend/src/context/) proporciona contextos de React para compartir datos a través del árbol de componentes sin pasar props manualmente. Ejemplos incluyen [CurrencyContext.jsx](frontend/src/context/CurrencyContext.jsx), [NotificationContext.jsx](frontend/src/context/NotificationContext.jsx), [ThemeContext.jsx](frontend/src/context/ThemeContext.jsx).
*   **Hooks Personalizados (Hooks)**: En [hooks/](frontend/src/hooks/), se definen hooks de React reutilizables para encapsular lógica con estado. Ejemplos: [useAuth.js](frontend/src/hooks/useAuth.js), [useClickOutside.js](frontend/src/hooks/useClickOutside.js), [useCurrency.js](frontend/src/hooks/useCurrency.js), [useDebounce.js](frontend/src/hooks/useDebounce.js), [useForm.js](frontend/src/hooks/useForm.js), [useInventory.js](frontend/src/hooks/useInventory.js).
*   **Utilidades (Utils)**: El directorio [utils/](frontend/src/utils/) contiene funciones de utilidad generales para el frontend, como [api.js](frontend/src/utils/api.js) (posiblemente para llamadas API directas o helpers), [currencyCalculator.js](frontend/src/utils/currencyCalculator.js), [formatters.js](frontend/src/utils/formatters.js), [unitConversion.js](frontend/src/utils/unitConversion.js), y [validators.js](frontend/src/utils/validators.js).
*   **Constantes**: El directorio [constants/](frontend/src/constants/) almacena valores constantes utilizados en la aplicación, como mensajes ([messages.js](frontend/src/constants/messages.js)) y rutas ([routes.js](frontend/src/constants/routes.js)).
*   **Esquemas**: [schemas/authSchemas.js](frontend/src/schemas/authSchemas.js) define esquemas de validación para la autenticación.
*   **Internacionalización**: El directorio [locales/](frontend/src/locales/) contiene archivos de traducción para soportar múltiples idiomas ([en.js](frontend/src/locales/en.js), [es.js](frontend/src/locales/es.js), [en.json](frontend/src/locales/en.json), [es.json](frontend/src/locales/es.json)). [i18n.js](frontend/src/i18n.js) configura la librería de internacionalización.

### 2.2 Flujo de Datos en el Frontend

Las **páginas** ([pages/](frontend/src/pages/)) componen las vistas principales, utilizando **componentes** ([components/](frontend/src/components/)) para construir la UI. La interacción del usuario en los componentes o páginas puede disparar acciones de Redux que, a través de los `services` de Redux ([redux/](frontend/src/redux/)), realizan llamadas a la API del backend utilizando la instancia de Axios ([api/axiosInstance.js](frontend/src/api/axiosInstance.js)). La respuesta del backend actualiza el estado de Redux, lo que a su vez re-renderiza los componentes afectados. Los **contextos** ([context/](frontend/src/context/)) y **hooks personalizados** ([hooks/](frontend/src/hooks/)) proporcionan formas adicionales de gestionar y compartir el estado y la lógica.

## 3. Conexión entre Frontend y Backend

La comunicación entre el **frontend** y el **backend** se realiza a través de **solicitudes HTTP (API REST)**. El frontend ([frontend/src/api/axiosInstance.js](frontend/src/api/axiosInstance.js)) envía solicitudes a los endpoints definidos en las **rutas** del backend ([backend/routes/](backend/routes/)). El backend procesa estas solicitudes, interactúa con la base de datos a través de sus **modelos** y **controladores**, y envía respuestas JSON de vuelta al frontend.

