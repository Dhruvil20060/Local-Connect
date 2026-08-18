import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, User, Mail, Phone, Lock, Briefcase, MapPin, IndianRupee, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const ProviderRegister = () => {
  const { registerProvider } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: 'Plumber',
    experience: 2,
    city: 'Surat',
    serviceArea: 'City Wide',
    visitCharge: 199,
    description: '',
    availability: 'Available'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError('Please fill in all required user fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.profession || !formData.city || !formData.serviceArea) {
      setError('Please fill in all required professional details');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        profession: formData.profession,
        experience: Number(formData.experience),
        city: formData.city,
        serviceArea: formData.serviceArea,
        visitCharge: Number(formData.visitCharge),
        description: formData.description,
        availability: formData.availability
      };

      await registerProvider(payload);
      navigate('/provider/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Provider registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-1">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Provider Registration</h2>
          <p className="text-xs text-slate-500">
            Create your service provider account to list services and manage client bookings
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account & Contact Credentials */}
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider block">
              1. Account Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Suresh Patel"
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
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9825098765"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="suresh@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider block">
              2. Professional Service Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profession</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  >
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  min="0"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Surat"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visit Charge (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    name="visitCharge"
                    min="0"
                    required
                    value={formData.visitCharge}
                    onChange={handleChange}
                    placeholder="199"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Area / Sub-locations</label>
              <input
                type="text"
                name="serviceArea"
                required
                value={formData.serviceArea}
                onChange={handleChange}
                placeholder="e.g. Adajan, Pal, Vesu"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe your services and experience..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo (Optional)</label>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative shrink-0">
                  <img
                    src={formData.profileImage && formData.profileImage.trim() !== '' ? formData.profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Provider')}&background=6366f1&color=fff`}
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-300 shadow-2xs"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({ ...prev, profileImage: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  <input
                    type="url"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-2xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {submitting ? 'Registering Provider...' : 'Register as Provider'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex justify-center gap-4">
          <span>
            Register as Customer?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Customer Register
            </Link>
          </span>
          <span>•</span>
          <span>
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
