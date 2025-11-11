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
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Assuming there's a GET endpoint for the commission rate.
                // The other settings don't have specified GET endpoints in the doc.
                const commissionRes = await api.get('/settings/commission-rate');
                setSettings({ commissionRate: commissionRes.data.data.rate });
            } catch (error) {
                console.error("Error fetching initial settings:", error);
                // Silently fail on fetch, as user can still set values.
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    };

    const handleSave = async (settingName: keyof Settings, endpoint: string, payload: object, successMessage: string) => {
        setIsSaving(true);
        try {
            await api.patch(endpoint, payload);
            Swal.fire('Success', successMessage, 'success');
        } catch (error) {
            console.error(`Error updating ${settingName}:`, error);
            Swal.fire('Error', `Could not update ${settingName}.`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const onCommissionSave = () => {
        handleSave(
            'commissionRate',
            '/settings/commission-rate',
            { rate: settings.commissionRate },
            'Commission rate updated successfully.'
        );
    };

    const onPendingBookingSave = () => {
        handleSave(
            'pendingBookingDeletionTime',
            '/settings/pending-booking-deletion-time',
            { time: settings.pendingBookingDeletionTime },
            'Pending booking deletion time updated successfully.'
        );
    };

    const onReactivationTimeSave = () => {
        handleSave(
            'onlineBookingReactivationTime',
            '/settings/online-booking-reactivation-time',
            { time: settings.onlineBookingReactivationTime },
            'Online booking reactivation time updated successfully.'
        );
    };

    const onDeactivationTimeSave = () => {
        handleSave(
            'onlineBookingDeactivationTime',
            '/settings/online-booking-deactivation-time',
            { time: settings.onlineBookingDeactivationTime },
            'Online booking deactivation time updated successfully.'
        );
    };


    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">Application Settings</h1>

            <div className="space-y-8">
                {/* Commission Settings */}
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Commission Settings</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                            <input
                                type="number"
                                name="commissionRate"
                                id="commissionRate"
                                value={settings.commissionRate || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="e.g., 10"
                            />
                            <p className="mt-2 text-xs text-gray-500">The percentage the platform takes from each online booking.</p>
                        </div>
                        <button onClick={onCommissionSave} disabled={isSaving} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 self-end">
                            <Save size={18} /><span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                    </div>
                </div>

                {/* Booking Settings */}
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Automation Settings</h2>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <label htmlFor="pendingBookingDeletionTime" className="block text-sm font-medium text-gray-700">Pending Booking Deletion Time (minutes)</label>
                                <input
                                    type="number"
                                    name="pendingBookingDeletionTime"
                                    id="pendingBookingDeletionTime"
                                    value={settings.pendingBookingDeletionTime || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., 30"
                                />
                                <p className="mt-2 text-xs text-gray-500">Time to wait before an unpaid, pending booking is automatically deleted.</p>
                            </div>
                            <button onClick={onPendingBookingSave} disabled={isSaving} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 self-end">
                                <Save size={18} /><span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                         <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <label htmlFor="onlineBookingReactivationTime" className="block text-sm font-medium text-gray-700">Online Booking Reactivation Lockout (minutes)</label>
                                <input
                                    type="number"
                                    name="onlineBookingReactivationTime"
                                    id="onlineBookingReactivationTime"
                                    value={settings.onlineBookingReactivationTime || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., 1440 (24 hours)"
                                />
                                <p className="mt-2 text-xs text-gray-500">Time a hall owner must wait before they can re-enable online booking after disabling it.</p>
                            </div>
                            <button onClick={onReactivationTimeSave} disabled={isSaving} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 self-end">
                                <Save size={18} /><span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <label htmlFor="onlineBookingDeactivationTime" className="block text-sm font-medium text-gray-700">Online Booking Deactivation Lockout (minutes)</label>
                                <input
                                    type="number"
                                    name="onlineBookingDeactivationTime"
                                    id="onlineBookingDeactivationTime"
                                    value={settings.onlineBookingDeactivationTime || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., 60"
                                />
                                <p className="mt-2 text-xs text-gray-500">Time a hall owner must wait after re-enabling online booking before they can disable it again.</p>
                            </div>
                            <button onClick={onDeactivationTimeSave} disabled={isSaving} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 self-end">
                                <Save size={18} /><span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(SettingsPage, ["super-admin"]);
