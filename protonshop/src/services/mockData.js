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
  { id: 1, name: "Belleza y Cuidado Personal", slug: "belleza-y-cuidado-personal" },
  { id: 2, name: "Celulares", slug: "celulares" },
  { id: 3, name: "Hogar y Cocina", slug: "hogar-y-cocina" },
  { id: 4, name: "Iluminación", slug: "iluminacion" },
  { id: 5, name: "Niños & Videojuegos", slug: "ninos-y-videojuegos" },
  { id: 6, name: "Electrónica", slug: "electronica" },
  { id: 7, name: "Proyector & TVs", slug: "proyector-y-tvs" },
  { id: 8, name: "Accesorios", slug: "accesorios" }
];

export const mockOrders = [
  {
    id: "ORD-001",
    customer: "Cliente Demo",
    total: 45.99,
    status: "Confirmado",
    date: new Date().toISOString()
  }
];
