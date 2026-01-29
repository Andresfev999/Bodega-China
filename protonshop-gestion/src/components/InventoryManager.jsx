import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, Save, Loader2, Video, Link as LinkIcon, Download, FileJson, Code } from 'lucide-react';
import { getAdminProducts, getCategories, saveProduct, deleteProduct, uploadProductImage } from '../store';
import { improveDescription } from '../services/gemini';
import { Sparkles } from 'lucide-react'; // Assuming Sparkles icon exists or use generic

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        cost_price: '',
        sale_price: '',
        category: '',
        image: '',
        gallery: [],
        description: '',
        stock: 0,
        supplier: '',
        external_id: ''
    });
    const [uploading, setUploading] = useState(false);
    const [improving, setImproving] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [galleryDragActive, setGalleryDragActive] = useState(false);

    // JSON Import State
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonPreviewData, setJsonPreviewData] = useState([]);




    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                getAdminProducts(),
                getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await getAdminProducts();
            setProducts(data);
            // Refresh categories too in case a new one was added
            const cats = await getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
        } else {
            setEditingProduct(null);
            setEditingProduct(null);
            setFormData({ name: '', price: '', cost_price: '', sale_price: '', category: '', image: '', gallery: [], description: '', stock: 0, supplier: '', external_id: '' });
        }
        setShowJsonImport(false); // Reset JSON view
        setIsModalOpen(true);
    };

    const handleJsonImport = async () => {
        try {
            if (!jsonInput.trim()) return;
            const data = JSON.parse(jsonInput);

            const normalize = (item) => {
                const parsePrice = (val) => {
                    if (typeof val === 'number') return val;
                    if (!val) return 0;
                    // Simple cleaning: remove everything except digits. 
                    // Adjust this if you need decimals (e.g. replace ',' with '.' before stripping)
                    return Number(String(val).replace(/[^\d]/g, ''));
                };

                return {
                    name: item.name || item.title || item.nombre || item.titulo || item['Título'] || '',
                    price: parsePrice(item.price || item.valor || item.precio || item.precio_sugerido || item.sugerido || item['Precio'] || 0),
                    cost_price: parsePrice(item.cost_price || item.costo || item.precio_proveedor || item.proveedor_precio || 0),
                    sale_price: parsePrice(item.sale_price || item.salePrice || item.precio_oferta || 0),
                    category: item.category || item.categoria || (item['Atributos'] && item['Atributos']['Categorías'] ? item['Atributos']['Categorías'][0] : '') || '',
                    image: item.image || item.imagen || item.img || (Array.isArray(item['Imágenes']) ? item['Imágenes'][0] : item['Imágenes']) || '',
                    description: item.description || item.descripcion || item.desc || item['Descripción'] || '',
                    stock: Number(item.stock || item.cantidad || 0),
                    gallery: Array.isArray(item.gallery) ? item.gallery : (Array.isArray(item['Imágenes']) ? item['Imágenes'].slice(1) : []),
                    supplier: item.supplier || item.proveedor || '',
                    external_id: item.external_id || item.id_externo || item.sku || item.id || (item['Atributos'] ? item['Atributos']['SKU'] : '') || ''
                };
            };

            const items = Array.isArray(data) ? data : [data];
            const normalizedItems = items.map(normalize);

            if (normalizedItems.length > 1) {
                setJsonPreviewData(normalizedItems);
            } else {
                // Single object -> Fill form
                const newProduct = normalizedItems[0];
                setFormData(prev => ({ ...prev, ...newProduct }));
                setShowJsonImport(false);
                setJsonInput('');
                alert('¡Datos cargados en el formulario! Revisa y guarda.');
            }

        } catch (error) {
            setUploading(false);
            console.error(error);
            alert('Error al leer JSON: ' + error.message);
        }
    };

    const handleConfirmBatchImport = async () => {
        if (!window.confirm(`¿Vas a importar ${jsonPreviewData.length} productos directamente al inventario?`)) return;

        setUploading(true);
        let successCount = 0;
        let errors = [];

        for (const product of jsonPreviewData) {
            try {
                if (!product.name) continue;

                const payload = {
                    ...product,
                    external_id: product.external_id && String(product.external_id).trim() !== '' ? String(product.external_id) : null,
                    supplier: product.supplier && String(product.supplier).trim() !== '' ? String(product.supplier) : null
                };

                await saveProduct(payload);
                successCount++;
            } catch (err) {
                errors.push(product.name || 'Item desconodido');
                console.error(err);
            }
        }

        await loadProducts();
        setUploading(false);
        setJsonPreviewData([]);
        setShowJsonImport(false);
        setJsonInput('');

        let msg = `¡Importación completada! Agregados: ${successCount}.`;
        if (errors.length > 0) msg += `\nFallaron: ${errors.length}`;
        alert(msg);
    };

    const handleJsonFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setJsonInput(event.target.result);
        };
        reader.readAsText(file);
    };

    const handleCopyExample = () => {
        const example = {
            name: "Taladro De Alto Impacto",
            external_id: "627678",
            price: 550000,
            cost_price: 380000,
            sale_price: 0,
            supplier: "Gold Stone",
            category: "Herramientas",
            stock: 12,
            image: "https://ejemplo.com/taladro.jpg",
            description: "Taladro percutor...",
            gallery: []
        };
        const text = JSON.stringify(example, null, 2);
        navigator.clipboard.writeText(text);
        setJsonInput(text);
        alert('Ejemplo copiado y pegado en el campo de texto.');
    };

    const handleImport = async () => {
        if (!importUrl) return;
        setImporting(true);
        setDebugData(null);

        try {
            // Helper for fetch with timeout
            const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);
                try {
                    const response = await fetch(url, { ...options, signal: controller.signal });
                    clearTimeout(id);
                    return response;
                } catch (error) {
                    clearTimeout(id);
                    throw error;
                }
            };

            // --- Lógica Específica para Ofertix (API) ---
            if (importUrl.includes('ofertix.co')) {
                const idMatch = importUrl.match(/producto\/(\d+)/);
                if (idMatch && idMatch[1]) {
                    const productId = idMatch[1];
                    const apiUrl = `https://back.ofertix.co/producto/getProducto/${productId}`;
                    // Usamos proxy para evitar CORS, aunque sea una API pública
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

                    const response = await fetchWithTimeout(proxyUrl);
                    const proxyData = await response.json();

                    if (proxyData.contents) {
                        const productData = JSON.parse(proxyData.contents);

                        // Mapeo de datos basado en el análisis del JSON
                        const title = productData.descripcion || '';
                        const price = productData.valornormal || 0;
                        const salePrice = productData.valornormal2 || 0;
                        // Ofertix pone HTML en longdescription
                        const descriptionHtml = productData.longdescription || '';
                        // Limpiamos etiquetas HTML básicas para la descripción corta si se desea, 
                        // o dejamos el HTML si el text area lo soporta (actualmente es textarea simple)
                        const description = descriptionHtml.replace(/<[^>]*>?/gm, '').trim();

                        const image = productData.imagen || '';
                        const stock = productData.cantidad || 0;

                        setDebugData({
                            source: 'Ofertix API',
                            raw: productData
                        });

                        setFormData(prev => ({
                            ...prev,
                            name: title,
                            description: description.substring(0, 500), // Limitamos largo
                            image: image,
                            price: price,
                            sale_price: salePrice > 0 && salePrice < price ? salePrice : '',
                            stock: stock
                        }));

                        alert('¡Producto de Ofertix importado correctamente!');
                        return; // Terminamos aquí para Ofertix
                    }
                }
            }

            // --- Lógica Genérica (Scraping HTML) ---
            let contents = '';
            // ... (Resto del código original para otros sitios)
            // Try Primary Proxy (allorigins)
            try {
                const response = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(importUrl)}`);
                const data = await response.json();
                if (data.contents) contents = data.contents;
            } catch (e) {
                console.warn('Primary proxy failed, trying backup...', e);
                // Try Secondary Proxy (corsproxy.io) - direct HTML return
                try {
                    const response = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(importUrl)}`);
                    contents = await response.text();
                } catch (e2) {
                    throw new Error('No se pudo conectar con la página. Puede estar bloqueada.');
                }
            }

            if (contents) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(contents, 'text/html');

                let title = doc.querySelector('meta[property="og:title"]')?.content || doc.title;
                const description = doc.querySelector('meta[property="og:description"]')?.content || '';
                const image = doc.querySelector('meta[property="og:image"]')?.content || '';

                let price = 0;
                // Try to find price via JSON-LD
                const scriptTags = doc.querySelectorAll('script[type="application/ld+json"]');
                scriptTags.forEach(script => {
                    try {
                        const json = JSON.parse(script.innerText);
                        if (json['@type'] === 'Product' || json['@type'] === 'Offer') {
                            if (json.offers && json.offers.price) price = json.offers.price;
                            if (json.price) price = json.price;
                        }
                    } catch (e) { }
                });

                // Fallback regex for price
                if (!price) {
                    const priceMatch = contents.match(/\$[\d,.]+/);
                    if (priceMatch) {
                        price = parseFloat(priceMatch[0].replace(/[$,]/g, ''));
                    }
                }

                // --- Heuristics to improve data ---
                let urlDebugInfo = {};
                // 1. If title is generic (e.g. "Ofertix", "Amazon"), extract from URL
                if (!title || title.toLowerCase().includes('ofertix') || title.length < 5) {
                    try {
                        const urlObj = new URL(importUrl);
                        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
                        const hash = urlObj.hash;
                        const hashSegments = hash.replace(/^#/, '').split('/').filter(Boolean);

                        let candidate = '';
                        urlDebugInfo = { pathSegments, hash, hashSegments };

                        // Priority to hash if it has more segments (SPA router)
                        if (hashSegments.length > 0) {
                            candidate = [...hashSegments].reverse().find(s => isNaN(Number(s)) && s.length > 2) || '';
                        } else if (pathSegments.length > 0) {
                            candidate = [...pathSegments].reverse().find(s => isNaN(Number(s)) && s.length > 2) || '';
                        }

                        urlDebugInfo.candidate = candidate;

                        if (candidate) {
                            title = decodeURIComponent(candidate).replace(/-/g, ' ').toUpperCase();
                        }
                    } catch (e) {
                        console.error('URL parsing failed', e);
                        urlDebugInfo.error = e.message;
                    }
                }

                setDebugData({
                    url: importUrl,
                    finalName: title,
                    extractedImage: image,
                    extractedPrice: price,
                    rawOgTitle: doc.querySelector('meta[property="og:title"]')?.content,
                    rawTitleTag: doc.title,
                    ...urlDebugInfo
                });

                setFormData(prev => ({
                    ...prev,
                    name: title || prev.name,
                    description: description || prev.description,
                    image: image || prev.image,
                    price: price || prev.price
                }));
                alert('¡Datos importados! Revisa el Debug si algo falta.');
            }
        } catch (error) {
            console.error(error);
            alert('Error importando: ' + error.message);
        } finally {
            setImporting(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadProductImage(file);
            setFormData({ ...formData, image: url });
        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadProductImage(file);
            setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
        } catch (error) {
            alert('Error uploading gallery image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    // Drag and Drop Handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];

            // Reutilizar lógica de upload
            setUploading(true);
            try {
                const url = await uploadProductImage(file);
                setFormData(prev => ({ ...prev, image: url }));
            } catch (error) {
                alert('Error subiendo imagen arrastrada: ' + error.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleGalleryDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setGalleryDragActive(true);
        } else if (e.type === "dragleave") {
            setGalleryDragActive(false);
        }
    };

    const handleGalleryDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setGalleryDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setUploading(true);
            try {
                const files = Array.from(e.dataTransfer.files);
                const uploadPromises = files.map(file => uploadProductImage(file));
                const urls = await Promise.all(uploadPromises);

                setFormData(prev => ({
                    ...prev,
                    gallery: [...(prev.gallery || []), ...urls]
                }));
            } catch (error) {
                alert('Error subiendo imágenes a la galería: ' + error.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            // Prepare data for saving: convert empty strings to null/numbers
            const payload = {
                ...formData,
                price: (formData.price === '' || formData.price === null) ? 0 : Number(formData.price),
                cost_price: (formData.cost_price === '' || formData.cost_price === null) ? 0 : Number(formData.cost_price),
                sale_price: (formData.sale_price === '' || formData.sale_price === null) ? null : Number(formData.sale_price),
                stock: (formData.stock === '' || formData.stock === null) ? 0 : Number(formData.stock),
                external_id: (!formData.external_id || String(formData.external_id).trim() === '') ? null : String(formData.external_id).trim(),
                supplier: (!formData.supplier || String(formData.supplier).trim() === '') ? null : String(formData.supplier).trim()
            };

            await saveProduct(editingProduct ? { id: editingProduct.id, ...payload } : payload);
            await loadProducts();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Error saving product: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (error) {
                alert('Error deleting: ' + error.message);
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inventory-view">
            <div className="card-header">
                <h2>Inventario</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="search-box" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '200px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Nuevo
                    </button>
                </div>
            </div>

            <div className="data-card">
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Producto</th>
                                <th style={{ padding: '1rem' }}>Precio (Público)</th>
                                <th style={{ padding: '1rem' }}>Costo (Privado)</th>
                                <th style={{ padding: '1rem' }}>Stock</th>
                                <th style={{ padding: '1rem' }}>Categoría</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <span>{product.name}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>${product.price ? product.price.toLocaleString() : '0'}</div>
                                        {product.sale_price > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                                                Oferta: ${product.sale_price.toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#d97706', fontSize: '0.9rem' }}>
                                        ${product.cost_price ? product.cost_price.toLocaleString() : '0'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{product.stock || 0}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn-icon" onClick={() => handleOpenModal(product)} style={{ marginRight: '0.5rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius)',
                        width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* JSON Import Toggle */}
                            {!editingProduct && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowJsonImport(!showJsonImport)}
                                        style={{
                                            background: 'none', border: 'none', color: '#0ea5e9',
                                            cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <FileJson size={16} />
                                        {showJsonImport ? 'Ocultar Importación JSON' : 'Importar desde JSON'}
                                    </button>

                                    {showJsonImport && (
                                        <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px border #e2e8f0' }}>
                                            {jsonPreviewData.length > 0 ? (
                                                <div>
                                                    <h4 style={{ marginBottom: '0.5rem', color: '#334155' }}>Vista Previa ({jsonPreviewData.length} productos)</h4>
                                                    <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                                            <thead>
                                                                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                                                                    <th style={{ padding: '0.5rem' }}>Nombre</th>
                                                                    <th style={{ padding: '0.5rem' }}>Precio</th>
                                                                    <th style={{ padding: '0.5rem' }}>Costo</th>
                                                                    <th style={{ padding: '0.5rem' }}>Prov.</th>
                                                                    <th style={{ padding: '0.5rem' }}>IMG</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {jsonPreviewData.map((item, i) => (
                                                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                                        <td style={{ padding: '0.5rem' }}>{item.name}</td>
                                                                        <td style={{ padding: '0.5rem' }}>${item.price}</td>
                                                                        <td style={{ padding: '0.5rem', color: '#d97706' }}>${item.cost_price}</td>
                                                                        <td style={{ padding: '0.5rem' }}>{item.supplier}</td>
                                                                        <td style={{ padding: '0.5rem' }}>{item.image ? '✅' : '❌'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setJsonPreviewData([])}
                                                            style={{ backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleConfirmBatchImport}
                                                            disabled={uploading}
                                                            style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            {uploading ? <Loader2 className="animate-spin" size={14} /> : null}
                                                            Confirmar Importación
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Subir archivo JSON (del Extractor o respaldo):</label>
                                                        <input type="file" accept=".json" onChange={handleJsonFileUpload} style={{ fontSize: '0.8rem' }} />
                                                    </div>
                                                    <textarea
                                                        placeholder='O pega tu JSON aquí... Ej: { "name": "Zapato", ... }'
                                                        rows={5}
                                                        value={jsonInput}
                                                        onChange={(e) => setJsonInput(e.target.value)}
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            type="button"
                                                            onClick={handleJsonImport}
                                                            style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >
                                                            Analizar Datos
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyExample}
                                                            style={{ backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >
                                                            Copiar Ejemplo
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}


                            <div>
                                <label>Imagen del Producto</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        style={{
                                            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            backgroundColor: dragActive ? 'rgba(56, 189, 248, 0.1)' : '#f8fafc',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {formData.image ? (
                                            <div style={{ position: 'relative' }}>
                                                <img src={formData.image} alt="Preview" style={{ maxHeight: '150px', margin: '0 auto', display: 'block', borderRadius: '4px' }}
                                                    onError={(e) => e.target.style.display = 'none'} />
                                            </div>
                                        ) : (
                                            <div style={{ color: dragActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                <ImageIcon style={{ marginBottom: '0.5rem' }} />
                                                <br />
                                                {dragActive ? "¡Suelta la imagen aquí!" : "Click para subir o arrastra una imagen aquí"}
                                            </div>
                                        )}
                                        <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" id="img-upload" />
                                        <label htmlFor="img-upload" style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, cursor: 'pointer' }}></label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>O pega URL:</span>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            style={{ flex: 1, fontSize: '0.85rem' }}
                                        />
                                        {formData.image && <button type="button" onClick={() => setFormData({ ...formData, image: '' })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label>Galería (Opcional)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                    {(formData.gallery || []).map((img, idx) => {
                                        const isVideo = img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm');
                                        return (
                                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                {isVideo ? (
                                                    <video src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', background: '#000' }} />
                                                ) : (
                                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(idx)}
                                                    style={{
                                                        position: 'absolute', top: -5, right: -5,
                                                        background: 'var(--error)', color: 'white',
                                                        border: 'none', borderRadius: '50%',
                                                        width: '20px', height: '20px',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        );
                                    })}
                                    <div
                                        onDragEnter={handleGalleryDrag}
                                        onDragLeave={handleGalleryDrag}
                                        onDragOver={handleGalleryDrag}
                                        onDrop={handleGalleryDrop}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            border: `2px dashed ${galleryDragActive ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            backgroundColor: galleryDragActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Plus size={20} color={galleryDragActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                        <input type="file" onChange={handleGalleryUpload} style={{ display: 'none' }} accept="image/*,video/mp4,video/webm" id="gallery-upload" multiple />
                                        <label htmlFor="gallery-upload" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} title="Subir archivo(s)"></label>
                                    </div>
                                    <div style={{ width: '60px', height: '60px', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f1f5f9' }}
                                        onClick={() => {
                                            const url = prompt('Ingresa la URL de la imagen o video:');
                                            if (url) setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
                                        }}
                                        title="Agregar desde URL"
                                    >
                                        <LinkIcon size={20} color="var(--text-muted)" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>Nombre</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>ID Externo</label>
                                            <input type="text" value={formData.external_id} onChange={e => setFormData({ ...formData, external_id: e.target.value })} style={{ fontSize: '0.85rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Proveedor</label>
                                            <input type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} style={{ fontSize: '0.85rem' }} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label>Precio Sugerido (Público)</label>
                                        <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} style={{ fontWeight: 'bold' }} />
                                    </div>
                                    <div style={{ padding: '0.5rem', backgroundColor: '#fff7ed', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                                        <label style={{ color: '#d97706', fontSize: '0.85rem' }}>Precio Costo (Privado)</label>
                                        <input type="number" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: Number(e.target.value) })} style={{ borderColor: '#fdba74' }} />
                                    </div>
                                    <div>
                                        <label>Precio Oferta (Opcional)</label>
                                        <input
                                            type="number"
                                            value={formData.sale_price || ''}
                                            onChange={e => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : null })}
                                            placeholder="Dejar vacío si no hay oferta"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>Categoría</label>
                                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} list="categories" placeholder="Escribe o selecciona..." />
                                    <datalist id="categories">
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label>Stock</label>
                                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ marginBottom: 0 }}>Descripción</label>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!formData.name) return alert('Ingresa primero el nombre del producto');
                                            setImproving(true);
                                            try {
                                                const improved = await improveDescription(formData.name, formData.description);
                                                setFormData(prev => ({ ...prev, description: improved }));
                                            } catch (error) {
                                                alert('Error al mejorar descripción: ' + error.message);
                                            } finally {
                                                setImproving(false);
                                            }
                                        }}
                                        disabled={improving}
                                        style={{
                                            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '20px',
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Sparkles size={12} />
                                        {improving ? 'Generando...' : 'Mejorar con IA'}
                                    </button>
                                </div>
                                <textarea
                                    rows="5"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }} disabled={uploading}>
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {uploading ? ' Guardando...' : ' Guardar Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
