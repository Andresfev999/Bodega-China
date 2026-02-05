import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, Save, Loader2, Video, Link as LinkIcon, Download, FileJson, Code, Eye, Share2, Copy, MessageCircle } from 'lucide-react';
import { getAdminProducts, getCategories, saveProduct, deleteProduct, uploadProductImage, getVisitCount } from '../store';
import { improveDescription } from '../services/gemini';
import { Sparkles } from 'lucide-react'; // Assuming Sparkles icon exists or use generic

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [totalVisits, setTotalVisits] = useState(0);

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

    // Share Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareProduct, setShareProduct] = useState(null);
    const [shareText, setShareText] = useState('');




    useEffect(() => {
        loadData();
        getVisitCount().then(count => setTotalVisits(count));
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

    // --- WhatsApp Sharing Logic ---
    const handleOpenShare = (product) => {
        setShareProduct(product);

        // Generate Slug for URL: lowercase, replace spaces with hyphens, remove special chars
        const slug = product.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Trim hyphens

        const productUrl = `https://protondev.space?product=${slug}`;

        const text = `✨ *NUEVO DISPONIBLE* ✨\n\n` +
            `📦 *${product.name}*\n` +
            `💰 *Precio:* $${product.price ? product.price.toLocaleString() : '0'}\n` +
            (product.sale_price ? `🔥 *OFERTA:* $${product.sale_price.toLocaleString()}\n` : '') +
            `🏷️ *Categoría:* ${product.category}\n\n` +
            `📝 ${product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : ''}\n\n` +
            `🛒 *Haz tu pedido en nuestra web:* ${productUrl}\n` +
            `--------------------------------`;

        setShareText(text);
        setShareModalOpen(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareText);
        alert('¡Texto copiado al portapapeles!');
    };

    const copyImageToClipboard = async () => {
        if (!shareProduct || !shareProduct.image) return;

        try {
            const response = await fetch(shareProduct.image);
            const blob = await response.blob();

            // Clipboard API requires PNG usually, but modern browsers support others.
            // We'll try to write directly.
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
            alert('¡Imagen copiada! Ahora pégala en WhatsApp (Ctrl+V).');
        } catch (error) {
            console.error('Error copying image:', error);
            alert('No se pudo copiar la imagen automáticamante. Intenta guardar la imagen primero.');
        }
    };

    const sendToWhatsapp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

                    {/* Visitor Stats Widget */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--bg-pure)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        marginRight: '1rem'
                    }}>
                        <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                            <Eye size={18} color="#0ea5e9" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visitas Web</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: 1 }}>{totalVisits.toLocaleString()}</div>
                        </div>
                    </div>

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
                                        <button className="btn-icon" onClick={() => handleOpenShare(product)} title="Compartir en WhatsApp" style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                            <Share2 size={18} />
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
                        backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '0',
                        width: '100%', maxWidth: 'none', height: '100%', maxHeight: 'none', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{
                            display: 'grid',
                            gridTemplateColumns: '350px 1fr',
                            gap: '2rem',
                            height: 'calc(100vh - 150px)', // Fixed height to fit in view
                            overflow: 'hidden'
                        }}>

                            {/* LEFT COLUMN: IMAGES */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {/* Main Image */}
                                <div>
                                    <label>Imagen Principal</label>
                                    {formData.image ? (
                                        <div
                                            style={{
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                height: '300px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#020617',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                                <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    onError={(e) => e.target.style.display = 'none'} />
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: '' }); }}
                                                    style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', zIndex: 10 }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            style={{
                                                border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                                                borderRadius: '8px',
                                                height: '300px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: dragActive ? 'rgba(56, 189, 248, 0.1)' : '#020617',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                                <p style={{ fontSize: '0.9rem' }}>Arrastra o click para subir</p>
                                            </div>
                                            <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                                        </label>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="O pega URL de imagen..."
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem' }}
                                    />
                                </div>

                                {/* Gallery */}
                                <div style={{ flex: 1 }}>
                                    <label>Galería Adicional</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {(formData.gallery || []).map((img, idx) => (
                                            <div key={idx} style={{ aspectRatio: '1/1', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => removeGalleryImage(idx)}
                                                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        <label
                                            onDragEnter={handleGalleryDrag}
                                            onDragLeave={handleGalleryDrag}
                                            onDragOver={handleGalleryDrag}
                                            onDrop={handleGalleryDrop}
                                            style={{
                                                aspectRatio: '1/1',
                                                border: `2px dashed ${galleryDragActive ? 'var(--primary)' : 'var(--border)'}`,
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                backgroundColor: galleryDragActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                color: 'var(--text-muted)'
                                            }}
                                        >
                                            <Plus size={20} color={galleryDragActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                            <input type="file" onChange={handleGalleryUpload} style={{ display: 'none' }} accept="image/*,video/mp4,video/webm" multiple />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: DETAILS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>

                                {/* JSON Import Toggle (Compact) */}
                                {!editingProduct && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setShowJsonImport(!showJsonImport)}
                                            style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileJson size={14} /> Importar JSON
                                        </button>
                                    </div>
                                )}
                                {showJsonImport && (
                                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <textarea
                                            placeholder='Pega tu JSON aquí...'
                                            rows={3}
                                            value={jsonInput}
                                            onChange={(e) => setJsonInput(e.target.value)}
                                            style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="button" onClick={handleJsonImport} style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Cargar</button>
                                        </div>
                                    </div>
                                )}

                                {/* Row 1: Name & Category */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label>Nombre del Producto</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ fontSize: '1.1rem', fontWeight: '600' }} />
                                    </div>
                                    <div>
                                        <label>Categoría</label>
                                        <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} list="categories" placeholder="Seleccionar..." />
                                        <datalist id="categories">
                                            {categories.map(cat => <option key={cat.id} value={cat.name} />)}
                                        </datalist>
                                    </div>
                                </div>

                                {/* Row 2: Prices & Stock */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                        <label>Precio (Público)</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                                            <input
                                                type="text"
                                                required
                                                value={formData.price ? formData.price.toLocaleString('es-CO') : ''}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value.replace(/\./g, '')) || 0;
                                                    setFormData({ ...formData, price: val });
                                                }}
                                                style={{ paddingLeft: '1.5rem', fontWeight: 'bold' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ color: '#d97706' }}>Costo (Privado)</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                                            <input
                                                type="text"
                                                value={formData.cost_price ? formData.cost_price.toLocaleString('es-CO') : ''}
                                                onChange={e => {
                                                    const cost = parseInt(e.target.value.replace(/\./g, '')) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        cost_price: cost,
                                                        price: Math.ceil(cost / 0.55) // Calculate price for 45% profit margin: Cost / (1 - 0.45)
                                                    });
                                                }}
                                                style={{ paddingLeft: '1.5rem', borderColor: '#fdba74' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Oferta (Opcional)</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                                            <input
                                                type="text"
                                                value={formData.sale_price ? formData.sale_price.toLocaleString('es-CO') : ''}
                                                onChange={e => {
                                                    const val = e.target.value ? (parseInt(e.target.value.replace(/\./g, '')) || 0) : null;
                                                    setFormData({ ...formData, sale_price: val });
                                                }}
                                                style={{ paddingLeft: '1.5rem', color: 'var(--success)' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Stock</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                                    </div>
                                </div>

                                {/* Row 3: Supplier & External ID */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label>Proveedor</label>
                                        <input type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                                    </div>
                                    <div>
                                        <label>ID / SKU Externo</label>
                                        <input type="text" value={formData.external_id} onChange={e => setFormData({ ...formData, external_id: e.target.value })} />
                                    </div>
                                </div>

                                {/* Row 4: Description (Takes remaining space) */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label>Descripción</label>
                                        <button type="button" onClick={async () => {
                                            if (!formData.name) return alert('Ingresa nombre');
                                            setImproving(true);
                                            try {
                                                const improved = await improveDescription(formData.name, formData.description);
                                                setFormData(prev => ({ ...prev, description: improved }));
                                            } catch (err) { alert(err.message); } finally { setImproving(false); }
                                        }}
                                            disabled={improving}
                                            style={{ border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Sparkles size={14} /> {improving ? 'Generando...' : 'Mejorar con IA'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{ flex: 1, minHeight: '100px', resize: 'none', fontFamily: 'inherit' }}
                                    />
                                </div>

                                {/* Footer Action */}
                                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn-primary" disabled={uploading} style={{ minWidth: '150px', justifyContent: 'center' }}>
                                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {uploading ? ' Guardando...' : ' Guardar Producto'}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && shareProduct && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setShareModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px',
                        width: '90%', maxWidth: '450px', border: '1px solid var(--border)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(37, 211, 102, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Share2 size={32} color="#25D366" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Compartir Producto</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Comparte este producto con tus clientes de forma creativa.</p>
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-pure)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <img src={shareProduct.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{shareProduct.name}</div>
                                    <div style={{ color: 'var(--primary)' }}>${shareProduct.price?.toLocaleString()}</div>
                                </div>
                            </div>
                            <textarea
                                value={shareText}
                                onChange={(e) => setShareText(e.target.value)}
                                style={{
                                    width: '100%', height: '150px', backgroundColor: 'transparent',
                                    border: 'none', color: 'var(--text-main)', fontSize: '0.9rem',
                                    resize: 'none', fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <button onClick={copyImageToClipboard} className="btn" style={{
                                backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border)',
                                color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.8rem'
                            }}>
                                <ImageIcon size={16} /> Copiar Img
                            </button>
                            <button onClick={copyToClipboard} className="btn" style={{
                                backgroundColor: 'var(--bg-pure)', border: '1px solid var(--border)',
                                color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.8rem'
                            }}>
                                <Copy size={16} /> Copiar Txt
                            </button>
                            <button onClick={sendToWhatsapp} className="btn" style={{
                                backgroundColor: '#25D366', border: 'none',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.8rem'
                            }}>
                                <MessageCircle size={16} /> Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
