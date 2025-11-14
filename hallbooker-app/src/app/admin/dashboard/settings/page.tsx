"use client";
import React, { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Save } from "lucide-react";

interface Settings {
    commissionRate: number;
    pendingBookingDeletionTime: number;
    onlineBookingReactivationTime: number;
    onlineBookingDeactivationTime: number;
}

const SettingsPage = () => {
    const [settings, setSettings] = useState<Partial<Settings>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null); // To track which setting is being saved

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const commissionRes = await api.get('/settings/commission-rate');
                setSettings({ commissionRate: commissionRes.data.data.rate });
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
        // Allow empty string for clearing input, but store as number if valid
        setSettings(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }));
    };

    const handleSave = async (settingName: keyof Settings, endpoint: string, payload: object, successMessage: string) => {
        setIsSaving(settingName);
        try {
            await api.patch(endpoint, payload);
            Swal.fire('Success', successMessage, 'success');
        } catch (error) {
            console.error(`Error updating ${settingName}:`, error);
            Swal.fire('Error', `Could not update ${settingName}.`, 'error');
        } finally {
            setIsSaving(null);
        }
    };

    const SettingRow = ({ id, label, description, value, onSave, placeholder }: any) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-6 border-b border-gray-400 last:border-b-0">
            <div className="md:col-span-1">
                <label htmlFor={id} className="font-semibold text-gray-800">{label}</label>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <div className="md:col-span-2 flex items-center space-x-4">
                <input
                    type="number"
                    name={id}
                    id={id}
                    value={value || ''}
                    onChange={handleInputChange}
                    className="flex-grow w-full px-4 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-focus"
                    placeholder={placeholder}
                />
                <button
                    onClick={onSave}
                    disabled={isSaving === id}
                    className="bg-primary hover:bg-opacity-90 text-white font-semibold px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 disabled:bg-gray-500"
                >
                    <Save size={18} />
                    <span>{isSaving === id ? 'Saving...' : 'Save'}</span>
                </button>
            </div>
        </div>
    );


    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-4xl font-bold mb-10 text-primary">Application Settings</h1>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission Settings</h2>
                    <SettingRow
                        id="commissionRate"
                        label="Commission Rate (%)"
                        description="The percentage the platform takes from each online booking."
                        value={settings.commissionRate}
                        onSave={() => handleSave('commissionRate', '/settings/commission-rate', { rate: settings.commissionRate }, 'Commission rate updated.')}
                        placeholder="e.g., 10"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-12">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Automation</h2>
                    <SettingRow
                        id="pendingBookingDeletionTime"
                        label="Pending Booking Deletion Time"
                        description="Time (in minutes) to wait before an unpaid, pending booking is auto-deleted."
                        value={settings.pendingBookingDeletionTime}
                        onSave={() => handleSave('pendingBookingDeletionTime', '/settings/pending-booking-deletion-time', { time: settings.pendingBookingDeletionTime }, 'Pending booking deletion time updated.')}
                        placeholder="e.g., 30"
                    />
                    <SettingRow
                        id="onlineBookingReactivationTime"
                        label="Reactivation Lockout"
                        description="Time (in minutes) a hall owner must wait before re-enabling online booking."
                        value={settings.onlineBookingReactivationTime}
                        onSave={() => handleSave('onlineBookingReactivationTime', '/settings/online-booking-reactivation-time', { time: settings.onlineBookingReactivationTime }, 'Reactivation lockout time updated.')}
                        placeholder="e.g., 1440"
                    />
                    <SettingRow
                        id="onlineBookingDeactivationTime"
                        label="Deactivation Lockout"
                        description="Time (in minutes) a hall owner must wait before disabling online booking again."
                        value={settings.onlineBookingDeactivationTime}
                        onSave={() => handleSave('onlineBookingDeactivationTime', '/settings/online-booking-deactivation-time', { time: settings.onlineBookingDeactivationTime }, 'Deactivation lockout time updated.')}
                        placeholder="e.g., 60"
                    />
                </div>
            </div>
        </div>
    );
};

export default withAuth(SettingsPage, ["super-admin"]);
