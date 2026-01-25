import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { createOrder, getProfile } from '../store';

const CartModal = ({ isOpen, onClose, cart, onClearCart, user }) => {
    const [step, setStep] = useState(1); // 1: Review, 2: Checkout, 3: Success
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        customer_municipio: '',
        customer_departamento: ''
    });

    // Pre-fill from profile when modal opens
    useEffect(() => {
        const loadProfileData = async () => {
            if (user && isOpen && !formData.customer_name) {
                try {
                    const profile = await getProfile(user.id);
                    if (profile) {
                        setFormData({
                            customer_name: profile.full_name || '',
                            customer_phone: profile.phone || '',
                            customer_address: profile.address || '',
                            customer_municipio: profile.municipio || '',
                            customer_departamento: profile.departamento || ''
                        });
                    }
                } catch (error) {
                    console.error('Error pre-filling profile:', error);
                }
            }
        };
        loadProfileData();
    }, [user, isOpen]);

    const handleManualFill = async () => {
        if (!user) return alert('Por favor inicia sesión para cargar tus datos.');
        setLoading(true);
        try {
            const profile = await getProfile(user.id);
            if (profile) {
                setFormData({
                    customer_name: profile.full_name || '',
                    customer_phone: profile.phone || '',
                    customer_address: profile.address || '',
                    customer_municipio: profile.municipio || '',
                    customer_departamento: profile.departamento || ''
                });
            } else {
                alert('No se encontraron datos en tu perfil. Ve a "Mi Perfil" para guardarlos.');
            }
        } catch (error) {
            alert('Error al cargar datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const total = cart.reduce((sum, item) => {
        const finalPrice = item.sale_price && item.sale_price < item.price ? item.sale_price : item.price;
        return sum + finalPrice;
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                ...formData,
                total,
                items: cart.map(item => ({
                    ...item,
                    price: item.sale_price && item.sale_price < item.price ? item.sale_price : item.price
                })),
                status: 'Pendiente',
                user_id: user?.id || null
            };
            await createOrder(orderData);
            setStep(3);
            onClearCart();
        } catch (error) {
            alert('Error al procesar el pedido: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>{step === 3 ? '¡Pedido Exitoso!' : 'Tu Carrito'}</h3>
                    <button style={styles.closeBtn} onClick={onClose} disabled={loading}>
                        <X size={24} />
                    </button>
                </div>

                <div style={styles.content}>
                    {step === 1 && (
                        <>
                            {cart.length === 0 ? (
                                <div style={styles.empty}>
                                    <ShoppingBag size={48} color="var(--text-muted)" />
                                    <p>Tu carrito está vacío</p>
                                </div>
                            ) : (
                                <>
                                    <div style={styles.itemList}>
                                        {cart.map((item, index) => (
                                            <div key={`${item.id}-${index}`} style={styles.item}>
                                                <img src={item.image} alt={item.name} style={styles.itemImage} />
                                                <div style={styles.itemInfo}>
                                                    <h4>{item.name}</h4>
                                                    {item.sale_price && item.sale_price < item.price ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                                ${item.price.toLocaleString()}
                                                            </span>
                                                            <span style={{ color: 'var(--success)', fontWeight: '700' }}>
                                                                ${item.sale_price.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span>${item.price.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={styles.totalRow}>
                                        <span>Total:</span>
                                        <span style={styles.totalPrice}>${total.toLocaleString()}</span>
                                    </div>
                                    <button className="btn btn-primary" style={styles.btnFull} onClick={() => setStep(2)}>
                                        Llenar datos
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formHeaderRow}>
                                <div>
                                    <p style={styles.formNote}>Paga al recibir el producto.</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        * El valor del envío será calculado al confirmar el pedido.
                                    </p>
                                </div>
                                {user && (
                                    <button
                                        type="button"
                                        onClick={handleManualFill}
                                        style={styles.btnMini}
                                        disabled={loading}
                                    >
                                        {loading ? 'Cargando...' : 'Cargar mis datos'}
                                    </button>
                                )}
                            </div>
                            <div style={styles.formGroup}>
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Teléfono de Contacto</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.customer_phone}
                                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Dirección de Entrega</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={formData.customer_address}
                                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                />
                            </div>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label>Departamento</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_departamento}
                                        onChange={(e) => setFormData({ ...formData, customer_departamento: e.target.value })}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label>Municipio</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_municipio}
                                        onChange={(e) => setFormData({ ...formData, customer_municipio: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={styles.totalRow}>
                                <span>Total a Pagar:</span>
                                <span style={styles.totalPrice}>${total.toLocaleString()}</span>
                            </div>
                            <div style={styles.actions}>
                                <button type="button" style={styles.btnGhost} onClick={() => setStep(1)} disabled={loading}>Volver</button>
                                <button type="submit" className="btn btn-primary" style={styles.btnFlex} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Pedido'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div style={styles.success}>
                            <CheckCircle size={64} color="var(--success)" />
                            <h4>¡Gracias por tu compra!</h4>
                            <p>Tu pedido ha sido registrado con éxito. Nos pondremos en contacto pronto para coordinar la entrega física y el pago.</p>
                            <button className="btn btn-primary" style={styles.btnFull} onClick={() => { onClose(); setStep(1); }}>
                                Seguir Comprando
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '500px',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
        padding: '1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)'
    },
    content: {
        padding: '1.5rem',
        maxHeight: '70vh',
        overflowY: 'auto'
    },
    empty: {
        textAlign: 'center',
        padding: '3rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--text-muted)'
    },
    itemList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-soft)',
        borderRadius: '1rem'
    },
    itemImage: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        objectFit: 'cover'
    },
    itemInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '2px dashed var(--border)',
        marginBottom: '1.5rem',
        fontSize: '1.1rem',
        fontWeight: '700'
    },
    totalPrice: {
        color: 'var(--primary)',
        fontSize: '1.5rem'
    },
    btnFull: {
        width: '100%',
        padding: '1rem',
        justifyContent: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
    },
    formHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.5rem'
    },
    btnMini: {
        padding: '0.4rem 0.8rem',
        fontSize: '0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--primary)',
        color: 'var(--primary)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontWeight: '700'
    },
    formNote: {
        fontSize: '0.85rem',
        color: '#0369a1',
        backgroundColor: '#e0f2fe',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '0.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    actions: {
        display: 'flex',
        gap: '1rem'
    },
    btnGhost: {
        flex: 1,
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontWeight: '600'
    },
    btnFlex: {
        flex: 2,
        justifyContent: 'center'
    },
    success: {
        textAlign: 'center',
        padding: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
    }
};

export default CartModal;
