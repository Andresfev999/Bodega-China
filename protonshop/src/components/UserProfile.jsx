import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Save, Loader2, CheckCircle } from 'lucide-react';
import { getProfile, updateProfile } from '../store';

const UserProfile = ({ user, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        municipio: '',
        departamento: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfile(user.id);
                if (profile) {
                    setFormData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        municipio: profile.municipio || '',
                        departamento: profile.departamento || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user.id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await updateProfile(user.id, formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            alert('Error al actualizar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={styles.loading}>Cargando tu perfil...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Mi Perfil</h2>
                <p style={styles.subtitle}>Gestiona tu información de contacto y dirección para tus pedidos.</p>
            </div>

            <div style={styles.card}>
                <form onSubmit={handleSave} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label><User size={16} /> Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

                    <div className="profile-form-row" style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label><Phone size={16} /> Teléfono</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="300 123 4567"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label><MapPin size={16} /> Dirección</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle 123 #45-67"
                            />
                        </div>
                    </div>

                    <div className="profile-form-row" style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label>Departamento</label>
                            <input
                                type="text"
                                value={formData.departamento}
                                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                placeholder="Ej. Antioquia"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Municipio</label>
                            <input
                                type="text"
                                value={formData.municipio}
                                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                                placeholder="Ej. Medellín"
                            />
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button type="button" style={styles.btnBack} onClick={onBack}>Volver al Catálogo</button>
                        <button type="submit" className="btn btn-primary" style={styles.btnSave} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" size={18} /> : (success ? <CheckCircle size={18} /> : <Save size={18} />)}
                            {saving ? ' Guardando...' : (success ? ' ¡Guardado!' : ' Guardar Cambios')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 1rem'
    },
    header: {
        marginBottom: '2rem',
        textAlign: 'center'
    },
    title: {
        fontSize: '2rem',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: 'var(--text-muted)'
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem'
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1rem',
        gap: '1rem'
    },
    btnBack: {
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        backgroundColor: 'transparent',
        fontWeight: '600',
        cursor: 'pointer'
    },
    btnSave: {
        flex: 1,
        padding: '0.75rem 1.5rem',
        justifyContent: 'center'
    },
    loading: {
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-muted)'
    }
};

export default UserProfile;
