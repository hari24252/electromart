import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Store, Bell, KeyRound, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { StoreSettings } from '@/types';

const defaultSettings: StoreSettings = {
  storeName: 'ElectroMart',
  supportEmail: 'support@electromart.com',
  supportPhone: '1800-123-4567',
  lowStockThreshold: 10,
  freeShippingMin: 999,
  notifications: { newOrders: true, lowStock: true, newUsers: false, reviews: true },
};

export function AdminSettingsPage() {
  const { admin, adminLogout } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    void api.admin.settings.read()
      .then(setSettings)
      .catch((error) => toast('error', getApiErrorMessage(error), 'Could not load store settings'))
      .finally(() => setLoading(false));
  }, [toast]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const next = await api.admin.settings.update(settings);
      setSettings(next);
      toast('success', 'Store settings saved.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.next !== passwords.confirm) {
      toast('error', 'The new password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.adminAuth.changePassword(passwords.current, passwords.next);
      adminLogout();
      toast('success', 'Password changed. Please sign in again.');
      navigate('/admin/login');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const generalContent = (
    <div className="space-y-4">
      <Input label="Store Name" value={settings.storeName} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} required />
      <Input label="Support Email" type="email" value={settings.supportEmail} onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })} required />
      <Input label="Support Phone" value={settings.supportPhone} onChange={(event) => setSettings({ ...settings, supportPhone: event.target.value })} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Low Stock Threshold" type="number" min="0" value={settings.lowStockThreshold} onChange={(event) => setSettings({ ...settings, lowStockThreshold: Number(event.target.value) })} required />
        <Input label="Free Shipping Min (₹)" type="number" min="0" value={settings.freeShippingMin} onChange={(event) => setSettings({ ...settings, freeShippingMin: Number(event.target.value) })} required />
      </div>
      <Button onClick={() => void saveSettings()} loading={saving}><Save className="w-4 h-4" /> Save Settings</Button>
    </div>
  );

  const notificationsContent = (
    <div className="space-y-4">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between brutal-border bg-paper-100 p-3">
          <div>
            <p className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}</p>
            <p className="text-xs text-ink-500">Get notified about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
          </div>
          <Switch checked={value} onChange={(next) => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: next } })} />
        </div>
      ))}
      <Button onClick={() => void saveSettings()} loading={saving}><Save className="w-4 h-4" /> Save Preferences</Button>
    </div>
  );

  const securityContent = (
    <div className="space-y-4">
      <div className="brutal-card bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="brutal-border bg-accent-400 text-ink-900 w-12 h-12 flex items-center justify-center text-lg font-bold">{admin?.name?.charAt(0) ?? 'A'}</div>
          <div><p className="font-bold">{admin?.name}</p><p className="text-sm text-ink-500">{admin?.email}</p><p className="text-xs text-ink-400 capitalize">{admin?.role}</p></div>
        </div>
      </div>
      <Input label="Current Password" type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
      <Input label="New Password" type="password" minLength={10} value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} hint="Use at least 10 characters." required />
      <Input label="Confirm New Password" type="password" minLength={10} value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required />
      <Button onClick={() => void changePassword()} loading={savingPassword}><KeyRound className="w-4 h-4" /> Change Password</Button>
    </div>
  );

  if (loading) return <div className="py-20 text-center text-sm font-bold uppercase text-ink-400">Loading settings…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div><h2 className="text-xl font-bold uppercase tracking-tight">Settings</h2><p className="text-sm text-ink-500">Manage store configuration and administrator security.</p></div>
      <Tabs tabs={[
        { label: 'General', icon: <Store className="w-4 h-4" />, content: generalContent },
        { label: 'Notifications', icon: <Bell className="w-4 h-4" />, content: notificationsContent },
        { label: 'Security', icon: <Shield className="w-4 h-4" />, content: securityContent },
      ]} />
    </div>
  );
}
