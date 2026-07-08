// admin/src/app/users/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Shield,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// ============================================================
// Types
// ============================================================
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'seller' | 'super-admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Role Options
// ============================================================
const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
  { value: 'super-admin', label: 'Super Admin' },
];

const roleColors: Record<string, string> = {
  user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  seller: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'super-admin': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const roleLabels: Record<string, string> = {
  user: 'User',
  seller: 'Seller',
  admin: 'Admin',
  'super-admin': 'Super Admin',
};

// ============================================================
// Users Page
// ============================================================
export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch users
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'users', currentPage, limit, roleFilter, statusFilter, searchQuery],
    queryFn: () =>
      adminApi.getUsers({
        page: currentPage,
        limit,
        role: roleFilter === 'all' ? undefined : roleFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        search: searchQuery || undefined,
      }),
  });

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setIsRoleModalOpen(false);
      setEditingUser(null);
      setSelectedRole('');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update user role');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.updateUserStatus(userId, isActive),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update user status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete user');
    },
  });

  const openRoleModal = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsRoleModalOpen(true);
  };

  const confirmRoleUpdate = () => {
    if (editingUser && selectedRole) {
      updateRoleMutation.mutate({ userId: editingUser._id, role: selectedRole });
    }
  };

  const handleToggleStatus = (user: User) => {
    toggleStatusMutation.mutate({ userId: user._id, isActive: !user.isActive });
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id);
    }
  };

  // Loading skeleton
  if (isLoading && !data) {
    return <UsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
            Users
          </h1>
          <p className="text-black dark:text-black text-sm">
            Manage all registered users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-gold/10 hover:bg-gold/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-brown-light dark:text-ivory/50" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light/50" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-brown-dark border-gold/10 rounded-full"
          />
        </div>
        <div className="flex gap-3">
          <div className="w-32">
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}
              options={roleOptions}
              placeholder="Role"
              className="w-full"
            />
          </div>
          <div className="w-32">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as any);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="Status"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <GlassCard variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5 bg-sand/30 dark:bg-brown/30">
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="text-center py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Verified
                </th>
                <th className="text-center py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right py-3 px-4 font-medium text-brown-light dark:text-ivory/50 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
  {users.length === 0 ? (
    <tr>
      <td colSpan={8} className="py-12 text-center text-black dark:text-black">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No users found</p>
      </td>
    </tr>
  ) : (
    users.map((user: User) => {
      const isActive = user.isActive;
      const isVerified = user.emailVerified;
      const roleClass = roleColors[user.role] || roleColors.user;
      const roleLabel = roleLabels[user.role] || user.role;

      return (
        <tr
          key={user._id}
          className="border-b border-gold/5 dark:border-gold/5 hover:bg-gold/5 transition-colors"
        >
          {/* Name */}
          <td className="py-3 px-4">
            <span className="font-medium text-black dark:text-black">
              {user.name}
            </span>
          </td>

          {/* Email */}
          <td className="py-3 px-4 text-black dark:text-black">
            {user.email}
          </td>

          {/* Phone */}
          <td className="py-3 px-4 text-black dark:text-black">
            {user.phone || "-"}
          </td>

          {/* Role */}
          <td className="py-3 px-4">
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      user.role === "admin"
        ? "bg-red-600 text-white"
        : user.role === "user"
        ? "bg-green-600 text-white"
        : "bg-blue-600 text-white"
    }`}
  >
    {roleLabel}
  </span>
</td>

          {/* Email Verified */}
          <td className="py-3 px-4 text-center">
            {isVerified ? (
              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
            )}
          </td>

          {/* Status */}
          <td className="py-3 px-4 text-center">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </td>

          {/* Created Date */}
          <td className="py-3 px-4 text-xs text-black dark:text-black">
            {formatDate(user.createdAt)}
          </td>

          {/* Actions */}
          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => openRoleModal(user)}
                className="p-1.5 rounded-lg hover:bg-gold/10 transition-colors text-black dark:text-black hover:text-gold-dark"
                aria-label="Change role"
                title="Change Role"
              >
                <Shield className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleStatus(user)}
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-black dark:text-black hover:text-blue-600"
                aria-label={isActive ? "Deactivate" : "Activate"}
                title={isActive ? "Deactivate" : "Activate"}
              >
                {isActive ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleDelete(user)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-black dark:text-black hover:text-red-500"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    })
  )}
</tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gold/10 dark:border-gold/5">
            <p className="text-xs text-brown-light dark:text-ivory/50">
              Showing {(currentPage - 1) * limit + 1} to{' '}
              {Math.min(currentPage * limit, total)} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-brown-light dark:text-ivory/50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Role Edit Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingUser(null);
          setSelectedRole('');
        }}
        title={`Change Role - ${editingUser?.name || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-brown-light dark:text-ivory/70">
            Select a new role for this user.
          </p>
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            options={[
              { value: 'user', label: 'User' },
              { value: 'seller', label: 'Seller' },
              { value: 'admin', label: 'Admin' },
              { value: 'super-admin', label: 'Super Admin' },
            ]}
            placeholder="Select role"
            className="w-full"
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/10 dark:border-gold/5">
            <button
              type="button"
              onClick={() => {
                setIsRoleModalOpen(false);
                setEditingUser(null);
                setSelectedRole('');
              }}
              className="px-4 py-2 rounded-full border border-gold/20 text-brown-light hover:bg-gold/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRoleUpdate}
              disabled={updateRoleMutation.isPending || !selectedRole}
              className="btn-gold px-6 py-2 text-sm"
            >
              {updateRoleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Update Role'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ============================================================
// Users Skeleton
// ============================================================
function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mt-1" />
        </div>
        <div className="h-10 w-10 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-11 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
        <div className="w-32 h-11 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
        <div className="w-32 h-11 bg-sand/50 dark:bg-brown/50 rounded-xl animate-pulse" />
      </div>

      <div className="bg-white dark:bg-brown-dark rounded-2xl border border-gold/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 dark:border-gold/5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <div className="h-3 w-16 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5 dark:border-gold/5">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className={`h-4 ${j === 0 ? 'w-24' : j === 1 ? 'w-32' : j === 2 ? 'w-20' : 'w-16'} bg-sand/50 dark:bg-brown/50 rounded animate-pulse`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}