import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../shell/AppShell';

export default function UserHome() {
    const { user, isAuthenticated, updateProfile, changePassword, deleteAccount } = useAuth();
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [layouts, setLayouts] = useState([]);
    const [loadingLayouts, setLoadingLayouts] = useState(false);

    // Profile form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Delete account
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'layouts' && isAuthenticated) {
            fetchLayouts();
        }
    }, [activeTab, isAuthenticated]);

    const fetchLayouts = async () => {
        setLoadingLayouts(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/layouts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setLayouts(data.layouts);
            }
        } catch (error) {
            console.error('Failed to load layouts:', error);
        } finally {
            setLoadingLayouts(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setSavingProfile(true);

        const result = await updateProfile(firstName, lastName, email);

        if (result.success) {
            setProfileSuccess('Profile updated successfully!');
        } else {
            setProfileError(result.error);
        }

        setSavingProfile(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setChangingPassword(true);

        const result = await changePassword(currentPassword, newPassword);

        if (result.success) {
            setPasswordSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPasswordError(result.error);
        }

        setChangingPassword(false);
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');
        setDeleting(true);

        const result = await deleteAccount(deletePassword);

        if (result.success) {
            navigate('/');
        } else {
            setDeleteError(result.error);
            setDeleting(false);
        }
    };

    const handleDeleteLayout = async (layoutId) => {
        if (!confirm('Are you sure you want to delete this layout?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/layouts/${layoutId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setLayouts(layouts.filter(l => l.id !== layoutId));
            }
        } catch (error) {
            console.error('Failed to delete layout:', error);
        }
    };

    const handleLoadLayout = (layout) => {
        localStorage.setItem('loadLayout', JSON.stringify(layout));
        navigate('/create');
    };

    if (!user) return null;

    return (
        <div style={{
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            minHeight: '100vh',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: isDarkMode ? '#ffffff' : '#0f172a'
                }}>
                    My Account
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: isDarkMode ? '#9ca3af' : '#64748b',
                    marginBottom: '32px'
                }}>
                    Manage your profile, layouts, and account settings
                </p>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                    overflowX: 'auto'
                }}>
                    {[
                        { id: 'profile', label: 'Profile' },
                        { id: 'layouts', label: 'My Layouts' },
                        { id: 'security', label: 'Security' },
                        { id: 'danger', label: 'Danger Zone' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                                color: activeTab === tab.id ? (isDarkMode ? '#ffffff' : '#0f172a') : (isDarkMode ? '#9ca3af' : '#64748b'),
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                cursor: 'pointer',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    background: isDarkMode ? '#1f2937' : '#ffffff',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                marginBottom: '24px',
                                color: isDarkMode ? '#ffffff' : '#0f172a'
                            }}>
                                Profile Information
                            </h2>

                            {profileSuccess && (
                                <div style={{
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px'
                                }}>
                                    {profileSuccess}
                                </div>
                            )}

                            {profileError && (
                                <div style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px'
                                }}>
                                    {profileError}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
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

                                    <div>
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
                                </div>

                                <div style={{ marginBottom: '24px' }}>
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

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    style={{
                                        padding: '10px 20px',
                                        background: savingProfile ? '#9ca3af' : '#3b82f6',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: savingProfile ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* My Layouts Tab */}
                    {activeTab === 'layouts' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    margin: 0,
                                    color: isDarkMode ? '#ffffff' : '#0f172a'
                                }}>
                                    Saved Layouts ({layouts.length}/10)
                                </h2>
                                {layouts.length >= 10 && (
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        Limit reached
                                    </span>
                                )}
                            </div>

                            {loadingLayouts ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                                    Loading layouts...
                                </div>
                            ) : layouts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: isDarkMode ? '#9ca3af' : '#64748b', marginBottom: '16px' }}>
                                        You haven't saved any layouts yet
                                    </p>
                                    <button
                                        onClick={() => navigate('/create')}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#3b82f6',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Create Your First Layout
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {layouts.map(layout => (
                                        <div
                                            key={layout.id}
                                            style={{
                                                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                background: isDarkMode ? '#374151' : '#f8fafc'
                                            }}
                                        >
                                            <h3 style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                marginBottom: '8px',
                                                color: isDarkMode ? '#ffffff' : '#0f172a'
                                            }}>
                                                {layout.name}
                                            </h3>
                                            <p style={{
                                                fontSize: '12px',
                                                color: isDarkMode ? '#9ca3af' : '#64748b',
                                                marginBottom: '12px'
                                            }}>
                                                {new Date(layout.updatedAt).toLocaleDateString()}
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleLoadLayout(layout)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: '#3b82f6',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Load
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLayout(layout.id)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        background: '#ef4444',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Tab - Password Change */}
                    {activeTab === 'security' && (
                        <div>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                marginBottom: '24px',
                                color: isDarkMode ? '#ffffff' : '#0f172a'
                            }}>
                                Change Password
                            </h2>

                            {passwordSuccess && (
                                <div style={{
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px'
                                }}>
                                    {passwordSuccess}
                                </div>
                            )}

                            {passwordError && (
                                <div style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px'
                                }}>
                                    {passwordError}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#0f172a'
                                    }}>
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
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

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#0f172a'
                                    }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#0f172a'
                                    }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                </div>

                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    style={{
                                        padding: '10px 20px',
                                        background: changingPassword ? '#9ca3af' : '#3b82f6',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: changingPassword ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {changingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Danger Zone Tab */}
                    {activeTab === 'danger' && (
                        <div>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                marginBottom: '8px',
                                color: '#ef4444'
                            }}>
                                Danger Zone
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: isDarkMode ? '#9ca3af' : '#64748b',
                                marginBottom: '24px'
                            }}>
                                Once you delete your account, there is no going back. All your layouts will be permanently deleted.
                            </p>

                            {deleteError && (
                                <div style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '14px'
                                }}>
                                    {deleteError}
                                </div>
                            )}

                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#ef4444',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete My Account
                                </button>
                            ) : (
                                <div style={{
                                    border: '2px solid #ef4444',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    background: isDarkMode ? '#7f1d1d' : '#fef2f2'
                                }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        marginBottom: '12px',
                                        color: '#ef4444'
                                    }}>
                                        Are you absolutely sure?
                                    </h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: isDarkMode ? '#fca5a5' : '#991b1b',
                                        marginBottom: '16px'
                                    }}>
                                        This action cannot be undone. Please enter your password to confirm.
                                    </p>

                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter your password"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ef4444',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            marginBottom: '16px',
                                            background: isDarkMode ? '#374151' : '#ffffff',
                                            color: isDarkMode ? '#ffffff' : '#0f172a'
                                        }}
                                    />

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleting || !deletePassword}
                                            style={{
                                                padding: '10px 20px',
                                                background: deleting || !deletePassword ? '#9ca3af' : '#ef4444',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: deleting || !deletePassword ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false);
                                                setDeletePassword('');
                                                setDeleteError('');
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'transparent',
                                                color: isDarkMode ? '#ffffff' : '#0f172a',
                                                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
