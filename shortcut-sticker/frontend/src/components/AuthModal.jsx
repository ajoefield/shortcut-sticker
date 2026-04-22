import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../shell/AppShell';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const { isDarkMode } = useDarkMode();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (mode === 'login') {
                result = await login(email, password);
            } else {
                result = await register(email, password, firstName, lastName);
            }

            if (result.success) {
                onClose();
                // Reset form
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: isDarkMode ? '#1f2937' : '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                    }}
                >
                    ×
                </button>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '24px',
                    color: isDarkMode ? '#ffffff' : '#0f172a'
                }}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: isDarkMode ? '#ffffff' : '#0f172a'
                                }}>
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: isDarkMode ? '#374151' : '#ffffff',
                                        color: isDarkMode ? '#ffffff' : '#0f172a'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: isDarkMode ? '#ffffff' : '#0f172a'
                                }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: isDarkMode ? '#374151' : '#ffffff',
                                        color: isDarkMode ? '#ffffff' : '#0f172a'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isDarkMode ? '#ffffff' : '#0f172a'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: isDarkMode ? '#374151' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#0f172a'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isDarkMode ? '#ffffff' : '#0f172a'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: isDarkMode ? '#374151' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#0f172a'
                            }}
                        />
                        {mode === 'register' && (
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '4px'
                            }}>
                                Must be at least 6 characters
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: loading ? '#9ca3af' : '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button
                                onClick={() => {
                                    setMode('register');
                                    setError('');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => {
                                    setMode('login');
                                    setError('');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
