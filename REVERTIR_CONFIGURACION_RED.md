# INSTRUCCIONES PARA REVERTIR CONFIGURACIÓN DE RED

## Cuando termines de trabajar en equipo, sigue estos pasos:

### 1. Backend - server.js
```javascript
// Cambia esta línea:
app.listen(PORT, '0.0.0.0', () =>

// Por esta línea:
app.listen(PORT, () =>
```

### 2. Backend - app.js
```javascript
// Reemplaza todo el bloque corsOptions por:
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
```

### 3. Frontend - vite.config.js
```javascript
// Elimina todo el bloque server, deja solo:
export default defineConfig({
  plugins: [react()]
})
```

### 4. Frontend - Eliminar archivo
```bash
del frontend\.env.local
```

## Resultado final:
- Solo funcionará en localhost
- Más seguro para trabajo individual
- Sin acceso desde red externa