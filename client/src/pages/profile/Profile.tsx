import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Footer from '../contact/Footer';
import apiService from '../../services/api';
import Navbar from '../../componentLibrary/NavBar';

// EditProfileModal implementation
const EditProfileModal = ({ open, onClose, user, onSave }: any) => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    department: user.department || '',
    level: user.level || '',
    semester: user.semester || '',
    phone: user.phone || '',
    address: user.address || '',
  });
  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [approving, setApproving] = useState(false);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedPhoto) return;

    try {
      setUploadingPhoto(true);
      const response = await apiService.auth.uploadProfilePhoto(selectedPhoto);
      
      if (response && response.success && response.data) {
        setUser(response.data);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        alert('Profile photo uploaded successfully!');
      } else {
        alert(response?.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleApproveUser = async () => {
    try {
      setApproving(true);
      const response = await apiService.approveCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        alert('You have been approved for repository access!');
      } else {
        alert(response?.error || 'Failed to approve user.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to approve user.');
    } finally {
      setApproving(false);
    }
  };

  const validate = () => {
    const errs: any = {};
    if (!formData.department) errs.department = 'Department is required';
    if (!formData.level) errs.level = 'Level is required';
    if (!formData.semester) errs.semester = 'Semester is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Call backend API to update user profile
      const response = await apiService.auth.updateUserProfile(formData);
      if (response && response.success && response.data) {
        setUser(response.data);
        onSave(formData);
        onClose();
      } else {
        setSaveError(response?.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-primary">Edit Profile</h2>
        
        {/* Photo Upload Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Profile Photo</h3>
          
          {/* Current Photo */}
          <div className="flex items-center space-x-4 mb-4">
            <img
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              src={user.avatar?.url ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${user.avatar.url}` : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt={user.avatar?.alt || "User profile"}
            />
            <div>
              <p className="text-sm text-gray-600">Current photo</p>
              {user.avatar?.url && (
                <p className="text-xs text-gray-500">Photo uploaded</p>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            
            {photoPreview && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Preview:</p>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={uploadPhoto}
                  disabled={uploadingPhoto}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.department ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter your department"
            />
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Level</label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.level ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="e.g. 100, 200, 300, 400"
            />
            {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.semester ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="e.g. Harmattan, Rain"
            />
            {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md border-gray-300"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md border-gray-300"
              placeholder="Enter your address"
            />
          </div>
          {saveError && <p className="text-red-500 text-xs mt-2">{saveError}</p>}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            {/* Approve for Repository Access button (only if not approved) */}
            {user && !user.isApproved && (
              <button
                type="button"
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                onClick={handleApproveUser}
                disabled={approving}
              >
                {approving ? 'Approving...' : 'Approve for Repository Access'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, loading, setUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const handleApproveUser = async () => {
    try {
      setApproving(true);
      const response = await apiService.approveCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        alert('You have been approved for repository access!');
      } else {
        alert(response?.error || 'Failed to approve user.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to approve user.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-gray-700">User context is null. Please log in again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col items-center mb-6">
            <img
              className="h-28 w-28 rounded-full object-cover border-4 border-blue-100 shadow-lg mb-4"
              src={user.avatar?.url ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${user.avatar.url}` : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt={user.avatar?.alt || "User profile"}
            />
            <h2 className="text-2xl font-bold text-primary mb-1">{user.firstName} {user.lastName}</h2>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {user.isVerified ? 'Verified' : 'Unverified'}
            </span>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </button>
            
            {/* Development: Approve user for repository access */}
            {user && !user.isApproved && (
              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleApproveUser}
                disabled={approving}
              >
                {approving ? 'Approving...' : 'Approve for Repository Access'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Matric Number:</span>
              <span className="text-gray-600">{user.matricNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Department:</span>
              <span className="text-gray-600">{user.department}</span>
            </div>
            {user.phone && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="text-gray-600">{user.phone}</span>
              </div>
            )}
            {user.address && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Address:</span>
                <span className="text-gray-600">{user.address}</span>
              </div>
            )}
          </div>
        </div>
        {/* Edit Profile Modal */}
        <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} onSave={() => setEditOpen(false)} />
        {/* Repository Link above the footer */}
        {user && !user.isApproved && (
          <div className="w-full flex justify-center">
            <a
              href="/repository"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors text-lg mt-0"
            >
              Go to Repository
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile; 