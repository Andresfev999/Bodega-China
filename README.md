# ProtonDev - Ecosistema de Comercio Electrónico

Bienvenido al repositorio oficial de **ProtonDev**. Este proyecto es una solución integral de comercio electrónico compuesta por una tienda pública moderna y un potente panel de gestión administrativa.

## 🚀 Estructura del Proyecto

El repositorio se divide en dos aplicaciones principales:

### 1. 🛒 ProtonShop (Tienda Pública)
La interfaz orientada al cliente, diseñada para ofrecer una experiencia de compra fluida y atractiva.
*   **Tecnologías**: React, Vite, TailwindCSS (o CSS Modules).
*   **Características**:
    *   Catálogo de productos dinámico.
    *   Carrito de compras interactivo.
    *   Diseño responsive y moderno.
    *   Integración con pasarelas de pago (Daviplata, Nequi).

### 2. ⚡ ProtonShop Gestión (Panel Administrativo)
El cerebro de la operación. Una herramienta robusta para administrar el inventario y las órdenes.
*   **Tecnologías**: React, Vite, Supabase.
*   **Características**:
    *   **Gestión de Inventario**: CRUD completo de productos con soporte para imágenes y galerías.
    *   **Importación Masiva**: Carga de productos desde JSON (individual o en lote).
    *   **Listas de Precios**: Visualización clara de precios públicos vs. costos privados.
    *   **Categorización Automática**: Creación inteligente de categorías al vuelo.
    *   **Imágenes Flexibles**: Soporte para subida de archivos y enlaces URL externos.

## 🛠️ Instalación y Uso

Para correr el proyecto localmente, necesitas tener Node.js instalado.

### Configuración General
1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Andresfev999/protondev.git
    cd protondev
    ```

### Ejecutar ProtonShop (Tienda)
```bash
cd protonshop
npm install
npm run dev
```

### Ejecutar ProtonShop Gestión (Admin)
```bash
cd protonshop-gestion
npm install
npm run dev
```

## 📦 Despliegue

Ambas aplicaciones están configuradas para desplegarse fácilmente en servicios como Vercel o Netlify. Asegúrate de configurar las variables de entorno necesarias (Supabase URL, API Keys) en tu plataforma de despliegue.

## 📄 Licencia

Este proyecto es propiedad de ProtonDev. Todos los derechos reservados.
