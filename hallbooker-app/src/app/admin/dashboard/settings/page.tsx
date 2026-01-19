"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Save, CreditCard, Clock, Shield, Info, ChevronRight } from "lucide-react";

interface Settings {
    commissionRate: number;
    pendingBookingDeletionTime: number;
    onlineBookingReactivationTime: number;
    onlineBookingDeactivationTime: number;
}

type TabId = 'financial' | 'automation' | 'vendor';

const SettingsPage = () => {
    const [settings, setSettings] = useState<Partial<Settings>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('financial');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [commissionRes, pendingRes, reactivationRes, deactivationRes] = await Promise.allSettled([
                    api.get('/settings/commission-rate'),
                    api.get('/settings/pending-booking-deletion-time'),
                    api.get('/settings/online-booking-reactivation-time'),
                    api.get('/settings/online-booking-deactivation-time')
                ]);

                const newSettings: Partial<Settings> = {};

                if (commissionRes.status === 'fulfilled') {
                    newSettings.commissionRate = commissionRes.value.data.data.rate;
                }
                if (pendingRes.status === 'fulfilled') {
                    newSettings.pendingBookingDeletionTime = pendingRes.value.data.data.time;
                }
                if (reactivationRes.status === 'fulfilled') {
                    newSettings.onlineBookingReactivationTime = reactivationRes.value.data.data.time;
                }
                if (deactivationRes.status === 'fulfilled') {
                    newSettings.onlineBookingDeactivationTime = deactivationRes.value.data.data.time;
                }

                setSettings(newSettings);
            } catch (error) {
                console.error("Error fetching initial settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }));
    };

    const validate = (name: keyof Settings, value: string | number | undefined): string | null => {
        if (value === undefined || value === '') return "Value is required";
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(numValue)) return "Please enter a valid number";

        if (name === 'commissionRate') {
            if (numValue < 0 || numValue > 100) return "Commission rate must be between 0 and 100";
        } else {
            if (numValue < 1) return "Value must be at least 1 minute";
        }
        return null;
    };

    const handleSave = async (settingName: keyof Settings, endpoint: string, payload: object, successMessage: string) => {
        const value = settings[settingName];
        const error = validate(settingName, value);
        if (error) {
            Swal.fire('Validation Error', error, 'error');
            return;
        }

        setIsSaving(settingName);
        try {
            await api.patch(endpoint, payload);
            Swal.fire({
                title: 'Success',
                text: successMessage,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error(`Error updating ${settingName}:`, error);
            Swal.fire('Error', `Could not update ${settingName}.`, 'error');
        } finally {
            setIsSaving(null);
        }
    };

    const tabs = [
        { id: 'financial' as TabId, label: 'Financial Settings', icon: CreditCard, description: 'Manage platform fees and commissions' },
        { id: 'automation' as TabId, label: 'Booking Automation', icon: Clock, description: 'Configure automated booking behavior' },
        { id: 'vendor' as TabId, label: 'Vendor Controls', icon: Shield, description: 'Set limits and controls for hall owners' },
    ];

    interface SettingCardProps {
        id: keyof Settings;
        label: string;
        description: string;
        value: number | string | undefined;
        onSave: () => void;
        placeholder: string;
        unit?: string;
    }

    const SettingCard = ({ id, label, description, value, onSave, placeholder, unit }: SettingCardProps) => (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 transition-all hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-grow max-w-2xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-grow sm:w-48">
                        <input
                            type="number"
                            name={id}
                            id={id}
                            value={value ?? ''}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 font-medium transition-all"
                            placeholder={placeholder}
                        />
                        {unit && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                                {unit}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onSave}
                        disabled={isSaving === id}
                        className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-300 disabled:scale-100 shadow-sm"
                    >
                        {isSaving === id ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{isSaving === id ? 'Saving...' : 'Save'}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Application Settings</h1>
                <p className="text-gray-500 mt-2">Configure platform-wide rules and parameters.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-80 flex-shrink-0">
                    <nav className="space-y-2 sticky top-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left ${
                                        isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-1 ring-primary'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        <Icon size={22} className={isActive ? 'text-white' : 'text-gray-500'} />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                {tab.label}
                                            </span>
                                            {isActive && <ChevronRight size={18} className="opacity-60" />}
                                        </div>
                                        <p className={`text-xs mt-1 leading-snug ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                            {tab.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex gap-3 text-blue-700">
                            <Info size={20} className="flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Need help?</p>
                                <p className="leading-relaxed opacity-90">Changes to these settings take effect immediately for all new transactions and bookings.</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-grow">
                    {activeTab === 'financial' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <CreditCard size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Financial Settings</h2>
                            </div>
                            <SettingCard
                                id="commissionRate"
                                label="Platform Commission Rate"
                                description="The percentage fee charged by the platform for every successful online booking. This applies to the total booking amount."
                                value={settings.commissionRate}
                                onSave={() => handleSave('commissionRate', '/settings/commission-rate', { rate: settings.commissionRate }, 'Commission rate updated.')}
                                placeholder="e.g., 10"
                                unit="%"
                            />
                        </div>
                    )}

                    {activeTab === 'automation' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Clock size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Booking Automation</h2>
                            </div>
                            <SettingCard
                                id="pendingBookingDeletionTime"
                                label="Unpaid Booking Expiry"
                                description="The duration (in minutes) a booking remains in 'Pending' status before being automatically deleted if payment is not confirmed."
                                value={settings.pendingBookingDeletionTime}
                                onSave={() => handleSave('pendingBookingDeletionTime', '/settings/pending-booking-deletion-time', { time: settings.pendingBookingDeletionTime }, 'Pending booking deletion time updated.')}
                                placeholder="e.g., 30"
                                unit="mins"
                            />
                        </div>
                    )}

                    {activeTab === 'vendor' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Vendor Controls</h2>
                            </div>
                            <SettingCard
                                id="onlineBookingReactivationTime"
                                label="Reactivation Lockout Period"
                                description="The mandatory waiting time (in minutes) after a vendor disables online booking before they can enable it again."
                                value={settings.onlineBookingReactivationTime}
                                onSave={() => handleSave('onlineBookingReactivationTime', '/settings/online-booking-reactivation-time', { time: settings.onlineBookingReactivationTime }, 'Reactivation lockout time updated.')}
                                placeholder="e.g., 1440"
                                unit="mins"
                            />
                            <SettingCard
                                id="onlineBookingDeactivationTime"
                                label="Deactivation Lockout Period"
                                description="The mandatory waiting time (in minutes) after a vendor enables online booking before they can disable it again."
                                value={settings.onlineBookingDeactivationTime}
                                onSave={() => handleSave('onlineBookingDeactivationTime', '/settings/online-booking-deactivation-time', { time: settings.onlineBookingDeactivationTime }, 'Deactivation lockout time updated.')}
                                placeholder="e.g., 60"
                                unit="mins"
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default withAuth(SettingsPage, ["super-admin"]);
