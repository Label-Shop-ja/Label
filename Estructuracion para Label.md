PS C:\Respaldo Jhosber\Proyectos\Label> tree /f
Listado de rutas de carpetas
El número de serie del volumen es 6EF5-DBAA
C:.
│   .gitignore
│   Estructuracion para Label.md
│   Lable v1.0
│   package-lock.json
│   package.json
│   tailwind.config.js
│
├───backend
│   │   .prettierrc.json
│   │   globalProductCleanupJob.js
│   │   package-lock.json
│   │   package.json
│   │   server.js
│   │
│   ├───.husky
│   │       pre-commit
│   │
│   ├───config
│   │       cloudinaryConfig.js
│   │       db.js
│   │
│   ├───controllers
│   │       authController.js
│   │       clientController.js
│   │       customExchangeRateController.js
│   │       exchangeRateController.js
│   │       globalProductController.js
│   │       productController.js
│   │       saleController.js
│   │       statsController.js
│   │       transactionController.js
│   │       uploadController.js
│   │       userController.js
│   │
│   ├───middleware
│   │       authMiddleware.js
│   │       errorMiddleware.js
│   │       uploadMiddleware.js
│   │
│   ├───models
│   │       Client.js
│   │       customExchangeRateModel.js
│   │       ExchangeRate.js
│   │       GlobalProduct.js
│   │       InventoryLog.js
│   │       productModel.js
│   │       Sale.js
│   │       Transaction.js
│   │       userModel.js
│   │
│   ├───routes
│   │       authRoutes.js
│   │       clientRoutes.js
│   │       customExchangeRateRoutes.js
│   │       exchangeRateRoutes.js
│   │       globalProductRoutes.js
│   │       productRoutes.js
│   │       saleRoutes.js
│   │       statsRoutes.js
│   │       transactionRoutes.js
│   │       uploadRoutes.js
│   │       userRoutes.js
│   │
│   └───utils
│           currencyCalculator.js
│           generateToken.js
│           inventoryLogger.js
│
└───frontend
    │   .env.development
    │   .env.production
    │   .gitignore
    │   .prettierrc.json
    │   eslint.config.js
    │   index.html
    │   package-lock.json
    │   package.json
    │   README.md
    │   vite.config.js
    │
    ├───.husky
    │       pre-commit
    │
    ├───Interfaces
    │       Inventario
    │
    ├───public
    │       vite.svg
    │
    └───src
        │   App.css
        │   App.jsx
        │   i18n.js
        │   index.css
        │   main.jsx
        │
        ├───api
        │       axiosInstance.js
        │
        ├───assets
        │       background.jpg
        │       logo.svg
        │       react.svg
        │
        ├───components
        │   │   ClientsPage.jsx
        │   │   DashboardLayout.jsx
        │   │   FinancialPage.jsx
        │   │   Header.jsx
        │   │   PosPage.jsx
        │   │   ProtectedRoute.jsx
        │   │   SettingsPage.jsx
        │   │   Sidebar.jsx
        │   │   StatsPage.jsx
        │   │
        │   ├───Auth
        │   │       # Code Citations.md
        │   │       AccessModal.jsx
        │   │
        │   ├───Common
        │   │       Breadcrumbs.jsx
        │   │       Button.jsx
        │   │       ConfirmModal.jsx
        │   │       ErrorBoundary.jsx
        │   │       LanguageSelector.jsx
        │   │       Loader.jsx
        │   │       MessageDisplay.jsx
        │   │       PaginationControls.jsx
        │   │       ProductModal.jsx
        │   │       ThemeSwitcher.jsx
        │   │       Toast.jsx
        │   │
        │   ├───Currency
        │   │       ExchangeRateDisplay.jsx
        │   │       ExchangeRateModal.jsx
        │   │
        │   ├───Dashboard
        │   │       DashboardHome.jsx
        │   │       StatsCard.jsx
        │   │
        │   ├───Inventory
        │   │   │   AddEditProductForm.jsx
        │   │   │   AddEditProductFormLogic.jsx
        │   │   │   InventoryAlerts.jsx
        │   │   │   InventoryPage.jsx
        │   │   │   ProductCard.jsx
        │   │   │   ProductFilterAndSearch.jsx
        │   │   │   ProductList.jsx
        │   │   │   VariantForm.jsx
        │   │   │   VariantReportTable.jsx
        │   │   │
        │   │   └───hooks
        │   │           useProductFormLogic.js
        │   │
        │   └───Pos
        │           PaymentModal.jsx
        │           PaymentSection.jsx
        │           ProductSearchPanel.jsx
        │           ProductSelectItem.jsx
        │           SaleCartPanel.jsx
        │           VariantSelectModal.jsx
        │           WeightInputModal.jsx
        │
        ├───constants
        │       messages.js
        │       routes.js
        │
        ├───context
        │       CurrencyContext.jsx
        │       NotificationContext.jsx
        │       ThemeContext.jsx
        │
        ├───hooks
        │       useAuth.js
        │       useCurrency.js
        │       useDebounce.js
        │       useForm.js
        │
        ├───locales
        │       en.js
        │       en.json
        │       es.js
        │       es.json
        │
        ├───pages
        │   │   LoginPage.jsx
        │   │   ProductsPage.jsx
        │   │   RegisterPage.jsx
        │   │
        │   ├───Admin
        │   │       AdminPanel.jsx
        │   │
        │   ├───Common
        │   │       UnauthorizedPage.jsx
        │   │
        │   └───Settings
        │           CustomRatesSettings.jsx
        │
        ├───redux
        │       authService.js
        │       authSlice.js
        │       store.js
        │
        ├───schemas
        │       authSchemas.js
        │
        └───utils
                api.js
                currencyCalculator.js
                formatters.js
                unitConversion.js
                validators.js