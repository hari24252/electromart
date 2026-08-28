import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, KeyRound, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs, SectionHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

export function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const resetCart = useCartStore((s) => s.reset);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    void api.orders.mine(1, 1)
      .then((response) => setOrderCount(response.total))
      .catch((error) => {
        setOrderCount(null);
        toast('error', getApiErrorMessage(error), 'Could not load your order count');
      });
  }, [toast, user?._id]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold uppercase mb-4">Please sign in</h1>
        <Link to="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim() || name.trim() === user.name) {
      setEditing(false);
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await api.auth.updateProfile(name.trim());
      updateUser(updated);
      setEditing(false);
      toast('success', 'Your profile has been updated.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Signed out on this device only');
    }
    resetCart();
    clearWishlist();
    logout();
    navigate('/');
  };

  const handlePasswordChange = async () => {
    if (passwords.next !== passwords.confirm) {
      toast('error', 'The new password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.auth.changePassword(passwords.current, passwords.next);
      resetCart();
      clearWishlist();
      logout();
      setPasswordModalOpen(false);
      toast('success', 'Password changed. Please sign in again.');
      navigate('/login');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />

      {/* Profile header */}
      <div className="brutal-card bg-ink-900 text-white p-6 mt-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 brutal-border-3 bg-accent-400 text-ink-900 flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold uppercase tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {user.email && <span className="text-sm text-ink-300">{user.email}</span>}
              {user.phone && <span className="text-sm text-ink-300">{user.phone}</span>}
              {user.isVerified && <Badge variant="success" size="sm">Verified</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link to="/orders" className="brutal-card bg-white p-4 text-center brutal-card-hover">
          <Package className="w-6 h-6 mx-auto mb-1 text-primary-600" />
          <p className="text-2xl font-bold">{orderCount ?? '—'}</p>
          <p className="text-2xs font-bold uppercase text-ink-500">Orders</p>
        </Link>
        <Link to="/wishlist" className="brutal-card bg-white p-4 text-center brutal-card-hover">
          <Heart className="w-6 h-6 mx-auto mb-1 text-danger-500" />
          <p className="text-2xl font-bold">{wishlistCount}</p>
          <p className="text-2xs font-bold uppercase text-ink-500">Wishlist</p>
        </Link>
        <Link to="/addresses" className="brutal-card bg-white p-4 text-center brutal-card-hover">
          <MapPin className="w-6 h-6 mx-auto mb-1 text-accent-600" />
          <p className="text-2xl font-bold">{user.addresses.length}</p>
          <p className="text-2xs font-bold uppercase text-ink-500">Addresses</p>
        </Link>
      </div>

      {/* Account details */}
      <div className="brutal-card bg-white p-6 mb-6">
        <SectionHeader title="Account Details" action={
          editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(user.name); }}>Cancel</Button>
              <Button size="sm" variant="success" onClick={() => void handleSave()} loading={savingProfile}>Save</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
          )
        } />

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 p-3 brutal-border bg-paper-100">
            <User className="w-5 h-5 text-ink-500" />
            {editing ? (
              <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            ) : (
              <div>
                <p className="text-xs text-ink-500 font-bold uppercase">Name</p>
                <p className="text-sm font-semibold">{user.name}</p>
              </div>
            )}
          </div>

          {user.email && (
            <div className="flex items-center gap-3 p-3 brutal-border bg-paper-100">
              <Mail className="w-5 h-5 text-ink-500" />
              <div>
                <p className="text-xs text-ink-500 font-bold uppercase">Email</p>
                <p className="text-sm font-semibold">{user.email}</p>
              </div>
            </div>
          )}

          {user.phone && (
            <div className="flex items-center gap-3 p-3 brutal-border bg-paper-100">
              <Phone className="w-5 h-5 text-ink-500" />
              <div>
                <p className="text-xs text-ink-500 font-bold uppercase">Phone</p>
                <p className="text-sm font-semibold">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 brutal-border bg-paper-100">
            <Settings className="w-5 h-5 text-ink-500" />
            <div>
              <p className="text-xs text-ink-500 font-bold uppercase">Member Since</p>
              <p className="text-sm font-semibold">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="brutal-card bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Change Password</h3>
          </div>
          <p className="text-xs text-ink-500 mb-3">Update your account password</p>
          <Button size="sm" variant="outline" fullWidth onClick={() => setPasswordModalOpen(true)}>Change Password</Button>
        </div>

        <div className="brutal-card bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Admin Portal</h3>
          </div>
          <p className="text-xs text-ink-500 mb-3">Access the admin dashboard</p>
          <Link to="/admin"><Button size="sm" fullWidth>Go to Admin</Button></Link>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="danger" fullWidth size="lg" onClick={handleLogout}>
          <LogOut className="w-5 h-5" /> Logout
        </Button>
      </div>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => { setPasswordModalOpen(false); setPasswords({ current: '', next: '', confirm: '' }); }}
        title="Change Password"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <Input label="Current Password" type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
          <Input label="New Password" type="password" minLength={10} value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} hint="Use at least 10 characters." required />
          <Input label="Confirm New Password" type="password" minLength={10} value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={() => void handlePasswordChange()} loading={savingPassword}>Update Password</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
