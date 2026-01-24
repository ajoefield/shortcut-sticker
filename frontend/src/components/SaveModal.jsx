import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../shell/AppShell';

export default function SaveModal({
    isOpen,
    onClose,
    onSaveToAccount,
    onSaveToBrowser,
    onDownloadJSON,
    onExportPNG,
    onExportSVG,
    layoutName,
    setLayoutName
}) {
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useDarkMode();
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSaveToAccount = async () => {
        setSaving(true);
        await onSaveToAccount();
        setSaving(false);
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
                maxWidth: '500px',
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
                    marginBottom: '8px',
                    color: isDarkMode ? '#ffffff' : '#0f172a'
                }}>
                    Save Layout
                </h2>

                {/* Layout Name Input */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isDarkMode ? '#ffffff' : '#0f172a'
                    }}>
                        Layout Name
                    </label>
                    <input
                        type="text"
                        value={layoutName}
                        onChange={(e) => setLayoutName(e.target.value)}
                        placeholder="My VSCode Layout"
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

                {isAuthenticated ? (
                    /* Logged In - Save to Account */
                    <div>
                        <button
                            onClick={handleSaveToAccount}
                            disabled={saving || !layoutName}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: saving || !layoutName ? '#9ca3af' : '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: saving || !layoutName ? 'not-allowed' : 'pointer',
                                marginBottom: '16px'
                            }}
                        >
                            {saving ? 'Saving...' : 'Save to My Layouts'}
                        </button>

                        <div style={{
                            padding: '12px',
                            background: isDarkMode ? '#374151' : '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}>
                            <p style={{
                                fontSize: '12px',
                                color: isDarkMode ? '#9ca3af' : '#64748b',
                                margin: 0
                            }}>
                                💾 Your layout will be saved to your account and accessible from any device.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Guest - Warning + Options */
                    <div>
                        <div style={{
                            padding: '12px',
                            background: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}>
                            <p style={{
                                fontSize: '13px',
                                color: '#92400e',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                ⚠️ Sign in to save permanently
                            </p>
                            <p style={{
                                fontSize: '12px',
                                color: '#92400e',
                                margin: '4px 0 0 0'
                            }}>
                                Browser storage is temporary and may be cleared. Download as JSON to keep a backup.
                            </p>
                        </div>

                        <button
                            onClick={onSaveToBrowser}
                            disabled={!layoutName}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: !layoutName ? '#9ca3af' : isDarkMode ? '#374151' : '#f3f4f6',
                                color: isDarkMode ? '#ffffff' : '#0f172a',
                                border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: !layoutName ? 'not-allowed' : 'pointer',
                                marginBottom: '8px'
                            }}
                        >
                            Save to Browser (Temporary)
                        </button>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                        }}>
                            <a
                                href="/signin"
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#3b82f6',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    display: 'block'
                                }}
                            >
                                Sign In
                            </a>
                            <a
                                href="/signup"
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'transparent',
                                    color: '#3b82f6',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    display: 'block'
                                }}
                            >
                                Create Account
                            </a>
                        </div>
                    </div>
                )}

                {/* Export Options */}
                <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }}>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: isDarkMode ? '#ffffff' : '#0f172a'
                    }}>
                        Export Options
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={onDownloadJSON}
                            disabled={!layoutName}
                            style={{
                                padding: '10px 16px',
                                background: 'transparent',
                                color: isDarkMode ? '#ffffff' : '#0f172a',
                                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: !layoutName ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                opacity: !layoutName ? 0.5 : 1
                            }}
                        >
                            📄 Download as JSON (source file)
                        </button>

                        <button
                            onClick={onExportPNG}
                            style={{
                                padding: '10px 16px',
                                background: 'transparent',
                                color: isDarkMode ? '#ffffff' : '#0f172a',
                                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            🖼️ Export as PNG (print-ready)
                        </button>

                        <button
                            onClick={onExportSVG}
                            style={{
                                padding: '10px 16px',
                                background: 'transparent',
                                color: isDarkMode ? '#ffffff' : '#0f172a',
                                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            📐 Export as SVG (vector)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
