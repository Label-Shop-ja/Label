PS F:\Proyectos\Label\frontend\src> tree /f
Listado de rutas de carpetas
El número de serie del volumen es 945A-7483
F:.
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
