import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, UserCheck, UserX, Shield, Trash2, Search, Mail, Phone, Lock } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/formatDate';
import { USER_ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'waiter',
    password: 'password123',
  });

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, { role: newRole });
      toast.success(`Role updated to ${newRole.toUpperCase()}`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (userId, currentActive) => {
    try {
      await adminApi.updateUserRole(userId, { isActive: !currentActive });
      toast.success(`User ${!currentActive ? 'Activated' : 'Deactivated'}`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Status toggle failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(formData);
      toast.success('Staff team member created successfully');
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'User creation failed');
    }
  };

  if (loading) return <Loader text="Loading staff directory & access permissions..." />;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const name = (u.fullName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    manager: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    cashier: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    kitchen: 'bg-amber-100 text-amber-800 border-amber-200',
    waiter: 'bg-coffee-100 text-coffee-800 border-coffee-200',
    customer: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Access Control & Personnel
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Staff Directory & User Accounts
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team member by name, email, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-medium focus:outline-none focus:border-coffee-700"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Team Member</th>
                <th className="py-4 px-5">Contact</th>
                <th className="py-4 px-5">Assigned Role</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Joined</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map((u) => {
                const roleBadge = roleColors[u.role] || roleColors.customer;

                return (
                  <tr key={u.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coffee-800 to-coffee-950 text-gold-400 font-black flex items-center justify-center text-sm shadow-xs">
                          {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-coffee-950 text-sm">{u.fullName}</p>
                          <p className="text-[11px] text-stone-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-stone-600 font-medium">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase focus:outline-none ${roleBadge}`}
                      >
                        {USER_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-400 font-medium">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.isActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Onboard Staff Team Member"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Almaz Bekele"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="almaz@samicafe.com"
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251 911 000 000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Access Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-coffee-950 focus:outline-none focus:border-coffee-700 uppercase"
                >
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Initial Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
                className="w-1/3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-2/3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
              >
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
