import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui';
import { User, Lock, Bell, Mail, Globe, CreditCard, Palette, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Settings() {
    const { user, setUser, theme, setTheme } = useStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profile state
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Settings state
    const [settings, setSettings] = useState({
        theme: theme,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        email_notifications: true,
        push_notifications: true,
        default_split_mode: 'equal',
        default_category: '',
        default_payment_method: ''
    });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name,
                email: user.email,
                phone: user.phone
            });
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/${user.user_id}/settings`);
            setSettings(res.data);
        } catch (err) {
            console.error('Failed to fetch settings', err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await axios.put(`${API_URL}/users/${user.user_id}/profile`, profile);
            setUser(res.data);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_URL}/users/${user.user_id}/password`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setSuccess('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsUpdate = async (updates) => {
        // Handle theme update locally first for immediate feedback
        if (updates.theme) {
            setTheme(updates.theme);
        }

        try {
            const res = await axios.put(`${API_URL}/users/${user.user_id}/settings`, updates);
            setSettings(prev => ({ ...prev, ...updates }));
            setSuccess('Settings updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            // Revert theme if API fails
            if (updates.theme) {
                setTheme(settings.theme);
            }
            setError('Failed to update settings');
            setTimeout(() => setError(''), 3000);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences</p>
            </div>

            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
                    {success}
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <Card className="p-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </Card>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <Card className="p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Core Profile</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Update your personal information</p>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        required
                                    />

                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Account & Security</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your password and security settings</p>
                                </div>

                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        required
                                    />

                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Updating...' : 'Change Password'}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notification Settings</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Control how you receive notifications</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications for updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.push_notifications}
                                                onChange={(e) => handleSettingsUpdate({ push_notifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates and summaries</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.email_notifications}
                                                onChange={(e) => handleSettingsUpdate({ email_notifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-8">
                                {/* Theme */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Palette size={20} />
                                        Theme
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['light', 'dark'].map(themeOption => (
                                            <button
                                                key={themeOption}
                                                onClick={() => handleSettingsUpdate({ theme: themeOption })}
                                                className={`p-4 rounded-lg border-2 transition-all capitalize ${
                                                    theme === themeOption
                                                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            >
                                                {themeOption}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Language & Region */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Globe size={20} />
                                        Language & Region
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                                            <select
                                                value={settings.language}
                                                onChange={(e) => handleSettingsUpdate({ language: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary outline-none"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                            <select
                                                value={settings.currency}
                                                onChange={(e) => handleSettingsUpdate({ currency: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary outline-none"
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Expense Defaults */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <CreditCard size={20} />
                                        Expense Defaults
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Split Mode</label>
                                            <select
                                                value={settings.default_split_mode}
                                                onChange={(e) => handleSettingsUpdate({ default_split_mode: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary outline-none"
                                            >
                                                <option value="equal">Equal</option>
                                                <option value="percentage">Percentage</option>
                                                <option value="shares">Shares</option>
                                                <option value="unequal">Unequal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Category</label>
                                            <input
                                                type="text"
                                                value={settings.default_category || ''}
                                                onChange={(e) => setSettings({ ...settings, default_category: e.target.value })}
                                                onBlur={() => handleSettingsUpdate({ default_category: settings.default_category })}
                                                placeholder="e.g., Food, Travel"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Payment Method</label>
                                            <input
                                                type="text"
                                                value={settings.default_payment_method || ''}
                                                onChange={(e) => setSettings({ ...settings, default_payment_method: e.target.value })}
                                                onBlur={() => handleSettingsUpdate({ default_payment_method: settings.default_payment_method })}
                                                placeholder="e.g., Cash, Card"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
