import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { getStoreData, addProduct, updateProduct, deleteProduct, uploadImage } from '../store';

const AdminDashboard = () => {
    const [data, setData] = useState({ products: [], categories: [] });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: '',
        stock: ''
    });

    const refreshData = async () => {
        setLoading(true);
        try {
            const storeData = await getStoreData();
            setData(storeData);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleOpenModal = (product = null) => {
        setImageFile(null);
        if (product) {
            setEditingProduct(product);
            setFormData(product);
            setImagePreview(product.image);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                description: '',
                category: data.categories[0] || 'Electrónica',
                image: '',
                stock: ''
            });
            setImagePreview('');
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = formData.image;

            // Si hay una nueva imagen cargada, subirla primero
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            } else if (!imageUrl && !imagePreview) {
                throw new Error('Debes seleccionar una imagen para el producto.');
            }

            const productData = {
                ...formData,
                image: imageUrl,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0
            };

            if (editingProduct) {
                await updateProduct(productData);
            } else {
                await addProduct(productData);
            }
            await refreshData();
            setIsModalOpen(false);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await deleteProduct(id);
                await refreshData();
            } catch (error) {
                alert('Error al eliminar: ' + error.message);
            }
        }
    };

    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <h2 style={styles.title}>Gestión de Inventario</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={loading}>
                    <Plus size={18} /> Agregar Nuevo Producto
                </button>
            </header>

            <div style={styles.tableContainer}>
                {loading ? (
                    <div style={styles.loadingState}>Cargando inventario...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tr}>
                                <th style={styles.th}>Producto</th>
                                <th style={styles.th}>Categoría</th>
                                <th style={styles.th}>Precio</th>
                                <th style={styles.th}>Stock</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.products.map(product => (
                                <tr key={product.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.prodCell}>
                                            <img src={product.image} alt={product.name} style={styles.thumb} />
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{product.category}</td>
                                    <td style={styles.td}>${product.price.toLocaleString()}</td>
                                    <td style={styles.td}>{product.stock}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button style={styles.editBtn} onClick={() => handleOpenModal(product)}><Edit2 size={16} /></button>
                                            <button style={styles.deleteBtn} onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
                            <button style={styles.closeBtn} onClick={() => setIsModalOpen(false)} disabled={saving}><X /></button>
                        </div>
                        <form onSubmit={handleSave} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label>Nombre del Producto</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    required
                                    disabled={saving}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label>Categoría</label>
                                    <select
                                        value={formData.category}
                                        disabled={saving}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label>Precio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        required
                                        disabled={saving}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={styles.imageUploadSection}>
                                <label>Imagen del Producto</label>
                                <div style={styles.uploadContainer}>
                                    {imagePreview ? (
                                        <div style={styles.previewBox}>
                                            <img src={imagePreview} alt="Preview" style={styles.previewImg} />
                                            <button
                                                type="button"
                                                style={styles.removeImgBtn}
                                                onClick={() => { setImageFile(null); setImagePreview(''); setFormData({ ...formData, image: '' }); }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label style={styles.dropzone}>
                                            <Upload size={24} color="var(--primary)" />
                                            <span>Subir Imagen</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                                disabled={saving}
                                            />
                                        </label>
                                    )}
                                    <div style={styles.urlOption}>
                                        <span>O usa una URL externa:</span>
                                        <input
                                            type="url"
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            value={formData.image}
                                            disabled={saving}
                                            onChange={(e) => {
                                                setFormData({ ...formData, image: e.target.value });
                                                setImagePreview(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label>Descripción</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    required
                                    disabled={saving}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label>Stock (Inventario)</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    required
                                    disabled={saving}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
                                {saving ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : <Save size={18} />}
                                {saving ? ' Procesando...' : (editingProduct ? ' Actualizar Producto' : ' Crear Producto')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

const styles = {
    dashboard: {
        padding: '2rem 0'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '700'
    },
    tableContainer: {
        backgroundColor: 'var(--bg-pure)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        minHeight: '200px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    th: {
        padding: '1rem 1.5rem',
        backgroundColor: '#f8fafc',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)'
    },
    td: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.9rem'
    },
    tr: {
        cursor: 'default',
        '&:hover': {
            backgroundColor: '#f1f5f9'
        }
    },
    prodCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    thumb: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        objectFit: 'cover'
    },
    actions: {
        display: 'flex',
        gap: '0.5rem'
    },
    editBtn: {
        padding: '0.4rem',
        borderRadius: '6px',
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteBtn: {
        padding: '0.4rem',
        borderRadius: '6px',
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        color: 'var(--text-muted)'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(3px)'
    },
    modal: {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
    },
    imageUploadSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    uploadContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        border: '2px dashed var(--border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-soft)'
    },
    dropzone: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        transition: 'var(--transition)',
        '&:hover': {
            borderColor: 'var(--primary)',
            backgroundColor: '#f0f9ff'
        }
    },
    previewBox: {
        position: 'relative',
        width: '100%',
        height: '150px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
    },
    previewImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    removeImgBtn: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--error)'
    },
    urlOption: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
    }
};

export default AdminDashboard;
