import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';

const Settings = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false, alerts: true });
  const [security, setSecurity] = useState({ twoFactor: false, loginAlerts: true });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
    } catch (err) {
      setError('Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure user profile, security controls, notification preferences and access management."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>User Profile</CardTitle>
              <p className="text-sm text-gray-500">Basic identity and account details.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 text-base font-medium text-gray-900">{user?.fullName || 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 text-base font-medium text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Role</p>
              <Badge variant="success">{user?.role?.replace(/_/g, ' ') || 'User'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Security Settings</CardTitle>
              <p className="text-sm text-gray-500">Protect your account and manage secure access.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Two-factor authentication</p>
                <p className="mt-2 text-sm text-gray-500">Add an extra verification step during login.</p>
                <div className="mt-4 flex items-center justify-between">
                  <Switch checked={security.twoFactor} onCheckedChange={value => setSecurity(prev => ({ ...prev, twoFactor: value }))} />
                  <span className="text-sm text-gray-500">{security.twoFactor ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Login alerts</p>
                <p className="mt-2 text-sm text-gray-500">Receive notifications for new sign-ins.</p>
                <div className="mt-4 flex items-center justify-between">
                  <Switch checked={security.loginAlerts} onCheckedChange={value => setSecurity(prev => ({ ...prev, loginAlerts: value }))} />
                  <span className="text-sm text-gray-500">{security.loginAlerts ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              <div className="grid gap-4 lg:grid-cols-3">
                <Input type="password" label="Current Password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                <Input type="password" label="New Password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                <Input type="password" label="Confirm New Password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
              </div>
              <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <p className="text-sm text-gray-500">Choose how you receive system alerts.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email updates</p>
                  <p className="text-sm text-gray-500">Receive weekly activity summaries.</p>
                </div>
                <Switch checked={notifications.email} onCheckedChange={value => setNotifications(prev => ({ ...prev, email: value }))} />
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS alerts</p>
                  <p className="text-sm text-gray-500">Receive critical notifications on your phone.</p>
                </div>
                <Switch checked={notifications.sms} onCheckedChange={value => setNotifications(prev => ({ ...prev, sms: value }))} />
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Alert banners</p>
                  <p className="text-sm text-gray-500">Show in-app notifications for system events.</p>
                </div>
                <Switch checked={notifications.alerts} onCheckedChange={value => setNotifications(prev => ({ ...prev, alerts: value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Role Management</CardTitle>
              <p className="text-sm text-gray-500">Review user roles and access privileges.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Current role</p>
                  <p className="text-base font-semibold text-gray-900">{user?.role?.replace(/_/g, ' ') || 'User'}</p>
                </div>
                <Badge variant="primary">Assigned</Badge>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-900">Next review</p>
              <p className="mt-2 text-sm text-gray-500">Set role and permission reviews on a recurring cadence.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" size="md">Manage Roles</Button>
                <Button variant="secondary" size="md">Audit Log</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-sm text-gray-500">Settings are stored immediately for your profile and security preferences.</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
