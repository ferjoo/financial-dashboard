import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/use-users'
import type { UserProfile, CreateUserRequest } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, Pencil, Trash2, X } from 'lucide-react'

type FormData = CreateUserRequest

const EMPTY_FORM: FormData = {
  email: '',
  password: '',
  role: 'offline_viewer',
  firstName: '',
  lastName: '',
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (u: UserProfile) => {
    setEditingId(u._id)
    setForm({
      email: u.email,
      password: '',
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      const payload: Record<string, string> = {}
      if (form.email) payload.email = form.email
      if (form.firstName) payload.firstName = form.firstName
      if (form.lastName) payload.lastName = form.lastName
      if (form.role) payload.role = form.role
      if (form.password) payload.password = form.password
      await updateUser.mutateAsync({ id: editingId, ...payload })
    } else {
      await createUser.mutateAsync(form)
    }
    closeForm()
  }

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-500">
              Create, edit, and manage platform users
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          New User
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">
                {editingId ? 'Edit User' : 'Create User'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    id="user-first-name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="user-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    id="user-last-name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password{editingId && ' (leave blank to keep current)'}
                </label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  minLength={editingId ? 0 : 8}
                  required={!editingId}
                  placeholder={editingId ? '••••••••' : ''}
                />
              </div>
              <div>
                <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="offline_viewer">In-store Viewer</option>
                  <option value="offline_admin">In-store Admin</option>
                  <option value="online_viewer">Online Viewer</option>
                  <option value="online_admin">Online Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={closeForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUser.isPending || updateUser.isPending}
                >
                  {createUser.isPending || updateUser.isPending
                    ? 'Saving...'
                    : editingId
                      ? 'Update'
                      : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Created
                </th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : !users?.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role.startsWith('offline')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u._id !== currentUser?.userId && (
                          <>
                            {deleteConfirm === u._id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(u._id)}
                                  className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                                  disabled={deleteUser.isPending}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(u._id)}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
