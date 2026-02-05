export const mockProducts = [
    {
        id: 1,
        name: "Audífonos Bluetooth Pro",
        price: 15.99,
        category: "Tecnología",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        description: "Sonido de alta fidelidad con cancelación de ruido."
    },
    {
        id: 2,
        name: "Smartwatch Deportivo",
        price: 25.50,
        category: "Tecnología",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
        description: "Monitoreo de salud y notificaciones inteligentes."
    },
    {
        id: 3,
        name: "Lámpara LED Escritorio",
        price: 12.00,
        category: "Hogar",
        image: "https://images.unsplash.com/photo-1534073828943-ef8010915479?w=500&auto=format&fit=crop&q=60",
        description: "Iluminación ajustable y puerto de carga USB."
    },
    {
        id: 4,
        name: "Robot Juguete Educativo",
        price: 35.00,
        category: "Juguetes",
        image: "https://images.unsplash.com/photo-1485827404703-89f5520c27eae?w=500&auto=format&fit=crop&q=60",
        description: "Aprende programación básica mientras juegas."
    },
    {
        id: 5,
        name: "Cámara de Seguridad WiFi",
        price: 29.99,
        category: "Tecnología",
        image: "https://images.unsplash.com/photo-1557324232-b8917d3c3d63?w=500&auto=format&fit=crop&q=60",
        description: "Vigilancia 24/7 con visión nocturna."
    },
    {
        id: 6,
        name: "Set de Organizadores",
        price: 18.50,
        category: "Hogar",
        image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
        description: "Maximiza el espacio en tu hogar con estilo."
    }
];

export const mockCategories = [
    { id: 1, name: "Tecnología", slug: "tecnologia" },
    { id: 2, name: "Hogar", slug: "hogar" },
    { id: 3, name: "Juguetes", slug: "juguetes" }
];

export const mockOrders = [
    {
        id: "ORD-2026-1001",
        customer_name: "María Pérez",
        customer_phone: "3001234567",
        customer_address: "Calle 123 #45-67",
        customer_municipio: "Bogotá",
        customer_departamento: "Cundinamarca",
        total: 105900,
        status: "Pendiente",
        shipping_cost: 0,
        items: [
            { name: "Smartwatch Ultra", price: 85900, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" },
            { name: "Correa Deportiva", price: 20000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" }
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
    },
    {
        id: "ORD-2026-0998",
        customer_name: "Carlos Rodríguez",
        customer_phone: "3109876543",
        customer_address: "Carrera 7 #20-10",
        customer_municipio: "Medellín",
        customer_departamento: "Antioquia",
        total: 459000,
        status: "Confirmado",
        shipping_cost: 15000,
        items: [
            { name: "Cámara WiFi 360", price: 120000, image: "https://images.unsplash.com/photo-1557324232-b8917d3c3d63?w=500" },
            { name: "Kit Smart Home", price: 339000, image: "https://images.unsplash.com/photo-1558002038-109177381792?w=500" }
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
        id: "ORD-2026-0995",
        customer_name: "Ana Gomez",
        customer_phone: "3155551234",
        customer_address: "Av. Siempre Viva 123",
        customer_municipio: "Cali",
        customer_departamento: "Valle",
        total: 89900,
        status: "Enviado",
        shipping_cost: 12000,
        items: [
            { name: "Audífonos Pro", price: 89900, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" }
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
        id: "ORD-2026-0990",
        customer_name: "Jorge Martinez",
        customer_phone: "3203334444",
        customer_address: "Calle 10 #5-20",
        customer_municipio: "Barranquilla",
        customer_departamento: "Atlántico",
        total: 250000,
        status: "Completado",
        shipping_cost: 10000,
        items: [
            { name: "Tablet Educativa", price: 250000, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500" }
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    }
];
