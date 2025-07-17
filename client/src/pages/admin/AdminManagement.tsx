import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminApi } from '../../services/adminApi';
import apiService from '../../services/api';
import './AdminManagement.css';

interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super-admin' | 'admin' | 'moderator';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNumber: string;
  department: string;
  isVerified: boolean;
  isApproved: boolean;
  canAccessRepository: boolean;
  level?: string;
  semester?: string;
  createdAt: string;
}

interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'super-admin' | 'admin' | 'moderator';
  permissions: {
    repository: {
      view: boolean;
      upload: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean;
      manageCategories: boolean;
      manageDepartments: boolean;
      viewStats: boolean;
    };
    blogs: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean;
      publish: boolean;
      manageComments: boolean;
    };
    news: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean;
      publish: boolean;
      manageCategories: boolean;
      schedule: boolean;
    };
    users: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      suspend: boolean;
      manageRoles: boolean;
      viewStats: boolean;
    };
    system: {
      viewLogs: boolean;
      manageSettings: boolean;
      backupData: boolean;
      restoreData: boolean;
      manageAdmins: boolean;
    };
  };
}

const AdminManagement: React.FC = () => {
  const { admin } = useAdmin();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [activeSection, setActiveSection] = useState<'admins' | 'users'>('admins');
  const [formData, setFormData] = useState<AdminFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: {
      repository: {
        view: true,
        upload: true,
        edit: true,
        delete: true,
        approve: true,
        manageCategories: true,
        manageDepartments: true,
        viewStats: true,
      },
      blogs: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
        publish: true,
        manageComments: true,
      },
      news: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
        publish: true,
        manageCategories: true,
        schedule: true,
      },
      users: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        suspend: true,
        manageRoles: true,
        viewStats: true,
      },
      system: {
        viewLogs: false,
        manageSettings: false,
        backupData: false,
        restoreData: false,
        manageAdmins: false,
      },
    },
  });

  useEffect(() => {
    if (activeSection === 'admins') {
      fetchAdmins();
    } else {
      fetchUsers();
    }
  }, [activeSection]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users.getAllAdmins();
      setAdmins(response.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.users.createAdmin(formData);
      setShowCreateForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: formData.permissions,
      });
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (adminId: string, updateData: Partial<AdminFormData>) => {
    try {
      await adminApi.users.updateAdmin(adminId, updateData);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }
    try {
      await adminApi.users.deleteAdmin(adminId);
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    }
  };

  const handleToggleActive = async (adminId: string, isActive: boolean) => {
    try {
      await adminApi.users.toggleAdminStatus(adminId, isActive);
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle admin status');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await apiService.approveUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'admin',
      permissions: formData.permissions,
    });
  };

  // Update form data when editing admin
  useEffect(() => {
    if (editingAdmin) {
      setFormData({
        firstName: editingAdmin.firstName,
        lastName: editingAdmin.lastName,
        email: editingAdmin.email,
        password: '',
        role: editingAdmin.role,
        permissions: formData.permissions, // Keep existing permissions
      });
    }
  }, [editingAdmin]);

  if (loading) {
    return (
      <div className="admin-management">
        <div className="loading">Loading admin management...</div>
      </div>
    );
  }

  return (
    <div className="admin-management">
      <div className="admin-header">
        <h1>Admin Management</h1>
        <div className="admin-info">
          <span>Welcome, {admin?.firstName} {admin?.lastName}</span>
          <span className="admin-role">{admin?.role}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab ${activeSection === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveSection('admins')}
        >
          Admin Management
        </button>
        <button
          className={`tab ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          User Management
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {activeSection === 'admins' ? (
        // Admin Management Section
        <>
          <div className="admin-management-header">
            <h1>Admin Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
            >
              Create New Admin
            </button>
          </div>

          {showCreateForm && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Create New Admin</h2>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleCreateAdmin} className="admin-form">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      {admin?.role === 'super-admin' && <option value="super-admin">Super Admin</option>}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Create Admin
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="admins-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adminItem) => (
                  <tr key={adminItem._id}>
                    <td>{`${adminItem.firstName} ${adminItem.lastName}`}</td>
                    <td>{adminItem.email}</td>
                    <td>
                      <span className={`role-badge role-${adminItem.role}`}>
                        {adminItem.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${adminItem.isActive ? 'active' : 'inactive'}`}>
                        {adminItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(adminItem.createdAt).toLocaleDateString()}</td>
                    <td>
                      {adminItem.lastLogin
                        ? new Date(adminItem.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingAdmin(adminItem)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleToggleActive(adminItem._id, !adminItem.isActive)}
                        >
                          {adminItem.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {adminItem._id !== admin?._id && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteAdmin(adminItem._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingAdmin && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Edit Admin: {editingAdmin.firstName} {editingAdmin.lastName}</h2>
                  <button
                    className="close-btn"
                    onClick={() => setEditingAdmin(null)}
                  >
                    ×
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateAdmin(editingAdmin._id, {
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      email: formData.email,
                      role: formData.role,
                    });
                  }}
                  className="admin-form"
                >
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      {admin?.role === 'super-admin' && <option value="super-admin">Super Admin</option>}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Update Admin
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingAdmin(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        // User Management Section
        <div className="user-section">
          <div className="section-header">
            <h2>User Management</h2>
            <p>Manage user accounts and repository access</p>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="user-list">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Matric Number</th>
                    <th>Department</th>
                    <th>Verified</th>
                    <th>Approved</th>
                    <th>Repository Access</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.matricNumber}</td>
                      <td>{user.department}</td>
                      <td>
                        <span className={`status ${user.isVerified ? 'verified' : 'unverified'}`}>
                          {user.isVerified ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${user.isApproved ? 'approved' : 'pending'}`}>
                          {user.isApproved ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${user.canAccessRepository ? 'approved' : 'pending'}`}>
                          {user.canAccessRepository ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManagement; 