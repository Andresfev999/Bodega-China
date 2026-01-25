import React, { useState } from 'react';
import { X, LogIn, UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase';

const AuthModal = ({ isOpen, onClose, onAuthChange }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onAuthChange(data.user);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (error) throw error;

                // Create profile
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            { id: data.user.id, full_name: fullName }
                        ]);
                    if (profileError) console.error('Error profile:', profileError);
                }

                alert('¡Registro exitoso! Por favor verifica tu correo electrónico.');
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
                    <button style={styles.closeBtn} onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleAuth} style={styles.form}>
                    {!isLogin && (
                        <div style={styles.formGroup}>
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Juan Pérez"
                            />
                        </div>
                    )}
                    <div style={styles.formGroup}>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
                        {loading ? ' Procesando...' : (isLogin ? ' Entrar' : ' Registrarme')}
                    </button>

                    <p style={styles.switchText}>
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <button type="button" style={styles.switchBtn} onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? ' Regístrate aquí' : ' Inicia sesión'}
                        </button>
                    </p>
                </form>
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
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '400px',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
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
        gap: '1.25rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    submitBtn: {
        width: '100%',
        marginTop: '0.5rem',
        padding: '1rem'
    },
    error: {
        color: 'var(--error)',
        fontSize: '0.85rem',
        textAlign: 'center',
        backgroundColor: '#fee2e2',
        padding: '0.75rem',
        borderRadius: '8px'
    },
    switchText: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
    },
    switchBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--primary)',
        fontWeight: '700',
        cursor: 'pointer'
    }
};

export default AuthModal;
