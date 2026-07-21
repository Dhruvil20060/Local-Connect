import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import * as authService from '../services/authService';
import * as providerService from '../services/providerService';
import { User, Phone, Mail, Lock, Briefcase, MapPin, IndianRupee, Image, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [userForm, setUserForm] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const [providerForm, setProviderForm] = useState({
    profession: 'Plumber',
    experience: 1,
    city: 'Surat',
    serviceArea: '',
    description: '',
    visitCharge: 199,
    profileImage: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        setUserForm({
          name: user.name || '',
          phone: user.phone || '',
          password: ''
        });

        if (user.role === 'provider') {
          try {
            const pProfile = await providerService.getMyProviderProfile();
            if (pProfile) {
              setProviderForm({
                profession: pProfile.profession || 'Plumber',
                experience: pProfile.experience || 1,
                city: pProfile.city || 'Surat',
                serviceArea: pProfile.serviceArea || '',
                description: pProfile.description || '',
                visitCharge: pProfile.visitCharge || 199,
                profileImage: pProfile.profileImage || ''
              });
            }
          } catch (err) {
            console.error('Error fetching provider profile:', err);
          }
        }
      }
      setLoading(false);
    };

    loadProfileData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // 1. Update basic user info
      const userRes = await authService.updateUserProfile(userForm);
      updateUser(userRes);

      // 2. If provider, update provider profile
      if (user.role === 'provider') {
        const pRes = await providerService.updateProviderProfile(providerForm);
        updateUser({ providerProfile: pRes });
      }

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading profile settings..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account information and public profile details.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
        <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">Basic Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Read Only)</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Optional)</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Provider Profile Settings */}
        {user?.role === 'provider' && (
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base">Service Professional Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profession</label>
                <select
                  value={providerForm.profession}
                  onChange={(e) => setProviderForm({ ...providerForm, profession: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden font-medium"
                >
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Home Cleaning">Home Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={providerForm.city}
                  onChange={(e) => setProviderForm({ ...providerForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={providerForm.experience}
                  onChange={(e) => setProviderForm({ ...providerForm, experience: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visit Charge (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={providerForm.visitCharge}
                  onChange={(e) => setProviderForm({ ...providerForm, visitCharge: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Sub-Areas Covered</label>
              <input
                type="text"
                required
                value={providerForm.serviceArea}
                onChange={(e) => setProviderForm({ ...providerForm, serviceArea: e.target.value })}
                placeholder="e.g. Adajan, Pal, City Light"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo URL</label>
              <input
                type="text"
                value={providerForm.profileImage}
                onChange={(e) => setProviderForm({ ...providerForm, profileImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Description / Bio</label>
              <textarea
                rows="3"
                value={providerForm.description}
                onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                placeholder="Describe your expertise, specialization, and working hours..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              ></textarea>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
