'use client';

import React, { useState, useEffect } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface BillingAddress {
  address?: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface User {
  name: string;
  email: string;
  billing?: BillingAddress;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editField, setEditField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const userData = await response.json();
      setUser({
        ...userData,
        billing: userData.billing || {}
      });
    } catch (err) {
      setError('Error loading user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditField(field);
    if (field === 'billing') {
      setEditValues({ billing: { ...user?.billing } });
    } else {
      setEditValues({ [field]: user?.[field as keyof User] });
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValues({});
  };

  const handleSave = async () => {
    if (!editField || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          ...editValues
        })
      });

      if (!response.ok) throw new Error('Failed to update user data');

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Update the AuthContext with the new user data
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        login(storedToken, updatedUser);
      }
      
      setEditField(null);
      setEditValues({});
    } catch (err) {
      setError('Error updating user data');
      console.error(err);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setChangingPassword(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return (
      <AuthLayout>
        <div className="p-8">
          <div className="text-center text-red-600">{error || 'User not found'}</div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="max-w-4xl">
          {/* Welcome Message */}
          <div className="bg-green-50 text-green-800 px-4 py-3 rounded-md mb-8">
            Welcome to iPhone Creator Course!
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="space-y-6">
              {/* Name Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Name</h3>
                  {editField === 'name' ? (
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="text-green-600 hover:text-green-500">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button onClick={handleCancel} className="text-red-600 hover:text-red-500">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit('name')} className="text-blue-600 hover:text-blue-500">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {editField === 'name' ? (
                  <input
                    type="text"
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <p className="text-sm">{user.name}</p>
                )}
              </div>

              {/* Email Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Email</h3>
                  {editField === 'email' ? (
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="text-green-600 hover:text-green-500">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button onClick={handleCancel} className="text-red-600 hover:text-red-500">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit('email')} className="text-blue-600 hover:text-blue-500">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {editField === 'email' ? (
                  <input
                    type="email"
                    value={editValues.email || ''}
                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <p className="text-sm">{user.email}</p>
                )}
              </div>

              {/* Billing Address Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Billing Address</h3>
                  {editField === 'billing' ? (
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="text-green-600 hover:text-green-500">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button onClick={handleCancel} className="text-red-600 hover:text-red-500">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit('billing')} className="text-blue-600 hover:text-blue-500">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {editField === 'billing' ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.billing?.address || ''}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        billing: { ...editValues.billing, address: e.target.value }
                      })}
                      placeholder="Address"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <input
                      type="text"
                      value={editValues.billing?.apt || ''}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        billing: { ...editValues.billing, apt: e.target.value }
                      })}
                      placeholder="Apt/Suite"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editValues.billing?.city || ''}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          billing: { ...editValues.billing, city: e.target.value }
                        })}
                        placeholder="City"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        value={editValues.billing?.state || ''}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          billing: { ...editValues.billing, state: e.target.value }
                        })}
                        placeholder="State"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editValues.billing?.zip || ''}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          billing: { ...editValues.billing, zip: e.target.value }
                        })}
                        placeholder="ZIP Code"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        value={editValues.billing?.country || ''}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          billing: { ...editValues.billing, country: e.target.value }
                        })}
                        placeholder="Country"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <p>{user.billing?.address}</p>
                    <p>{user.billing?.apt}</p>
                    <p>{user.billing?.city}</p>
                    <p>{user.billing?.state}</p>
                    <p>{user.billing?.zip}</p>
                    <p>{user.billing?.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="px-4 py-2 text-sm text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-50">
              View Payments
            </button>
            <button className="px-4 py-2 text-sm text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-50">
              View Subscriptions
            </button>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-2 bg-green-50 text-green-600 text-sm rounded">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:bg-blue-300"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
} 