import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import BookingCard from '../components/BookingCard';
import * as bookingService from '../services/bookingService';
import * as providerService from '../services/providerService';
import { Bell, CheckCircle2, Clock, Star, PlayCircle, ToggleLeft, ToggleRight, Check, X, MapPin, Phone, QrCode, CreditCard, AlertCircle, Camera, Upload, Briefcase, IndianRupee } from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState('Available');

  // Filter tab state
  const [activeTab, setActiveTab] = useState('All');

  // Modal States for Provider Confirmation Workflows
  const [bookingForCompleteModal, setBookingForCompleteModal] = useState(null);
  const [bookingForPaymentConfirmModal, setBookingForPaymentConfirmModal] = useState(null);
  const [bookingForQRModal, setBookingForQRModal] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Profile Edit / Change Photo Modal State (strictly for providers)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    profileImage: '',
    experience: 0,
    city: '',
    serviceArea: '',
    visitCharge: 199,
    description: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  const fetchData = async () => {
    try {
      const [bookingsData, profileData] = await Promise.all([
        bookingService.getProviderBookings(),
        providerService.getMyProviderProfile()
      ]);
      setBookings(bookingsData);
      setProfile(profileData);
      if (profileData && profileData.availability) {
        setAvailability(profileData.availability);
      }
    } catch (error) {
      console.error('Error loading provider dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAvailabilityToggle = async (newStatus) => {
    try {
      setAvailability(newStatus);
      await providerService.updateAvailability(newStatus);
    } catch (error) {
      console.error('Failed to update availability status:', error);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'Accepted') {
        await bookingService.acceptBooking(bookingId);
      } else if (newStatus === 'Rejected') {
        await bookingService.rejectBooking(bookingId);
      } else if (newStatus === 'In Progress') {
        await bookingService.startBooking(bookingId);
      } else if (newStatus === 'Completed') {
        await bookingService.completeBooking(bookingId);
      } else {
        await bookingService.updateBookingStatus(bookingId, newStatus);
      }
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed.');
      fetchData();
    }
  };

  const handleConfirmCompleteJob = async () => {
    if (!bookingForCompleteModal) return;
    setActionSubmitting(true);
    setActionError('');
    try {
      await bookingService.completeBooking(bookingForCompleteModal._id);
      setBookingForCompleteModal(null);
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to mark job completed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleConfirmPaymentReceived = async () => {
    if (!bookingForPaymentConfirmModal) return;
    setActionSubmitting(true);
    setActionError('');
    try {
      await bookingService.confirmPaymentReceived(bookingForPaymentConfirmModal._id);
      setBookingForPaymentConfirmModal(null);
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to confirm payment.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (profile) {
      setEditFormData({
        profileImage: profile.profileImage || '',
        experience: profile.experience || 0,
        city: profile.city || '',
        serviceArea: profile.serviceArea || '',
        visitCharge: profile.visitCharge || 199,
        description: profile.description || ''
      });
    }
    setProfileSaveError('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSaveError('');
    try {
      const updated = await providerService.updateProfile(editFormData);
      setProfile(updated);
      setShowEditProfileModal(false);
    } catch (err) {
      setProfileSaveError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) return <Loader fullScreen message="Opening your provider dashboard..." />;

  // Stat calculations
  const newRequests = bookings.filter((b) => ['Requested', 'OFFERED', 'PENDING'].includes(b.status));
  const acceptedJobs = bookings.filter((b) => ['Accepted', 'ACCEPTED', 'In Progress', 'IN_PROGRESS'].includes(b.status));
  const completedJobs = bookings.filter((b) => ['Completed', 'COMPLETED', 'CLOSED'].includes(b.status));
  const paymentSentCount = bookings.filter((b) => b.paymentStatus === 'PAYMENT_SENT').length;

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Requested') return ['Requested', 'OFFERED', 'PENDING'].includes(b.status);
    if (activeTab === 'Accepted') return ['Accepted', 'ACCEPTED'].includes(b.status);
    if (activeTab === 'In Progress') return ['In Progress', 'IN_PROGRESS'].includes(b.status);
    if (activeTab === 'Completed') return ['Completed', 'COMPLETED'].includes(b.status);
    if (activeTab === 'Payment Pending') return b.paymentStatus === 'PAYMENT_PENDING';
    if (activeTab === 'Payment Sent') return b.paymentStatus === 'PAYMENT_SENT';
    if (activeTab === 'Closed') return b.status === 'CLOSED';
    return b.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome & Availability Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Profile Photo Avatar with Edit Badge */}
          <div className="relative group shrink-0">
            <img
              src={profile?.profileImage && profile.profileImage.trim() !== '' ? profile.profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Provider')}&background=6366f1&color=fff`}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
            />
            {user?.role === 'provider' && (
              <button
                onClick={handleOpenEditProfile}
                className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {profile?.profession || 'Service Professional'}
              </span>
              {user?.role === 'provider' && (
                <button
                  onClick={handleOpenEditProfile}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Change Photo / Edit Profile
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              City: {profile?.city || 'Surat'} | Visit Charge: ₹{profile?.visitCharge || 199} | Rating: <strong className="text-slate-800">{profile?.totalReviews > 0 ? `${profile.averageRating} / 5 (${profile.totalReviews} ${profile.totalReviews === 1 ? 'Review' : 'Reviews'})` : 'New (0 Reviews)'}</strong>
            </p>
          </div>
        </div>

        {/* Availability Status Toggle */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full md:w-auto space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Your Current Availability:</span>
          <div className="flex items-center gap-2">
            {['Available', 'Busy', 'Unavailable'].map((st) => (
              <button
                key={st}
                onClick={() => handleAvailabilityToggle(st)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all shadow-2xs cursor-pointer ${
                  availability === st
                    ? st === 'Available'
                      ? 'bg-emerald-600 text-white'
                      : st === 'Busy'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-indigo-600 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold text-indigo-200 uppercase tracking-wider block">New Requests</span>
            <h3 className="text-2xl font-black mt-1">{newRequests.length}</h3>
          </div>
          <Bell className="w-7 h-7 text-indigo-200" />
        </div>

        <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold text-blue-200 uppercase tracking-wider block">Accepted Jobs</span>
            <h3 className="text-2xl font-black mt-1">{acceptedJobs.length}</h3>
          </div>
          <Clock className="w-7 h-7 text-blue-200" />
        </div>

        <div className="bg-amber-500 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold text-amber-100 uppercase tracking-wider block">Payment Sent</span>
            <h3 className="text-2xl font-black mt-1">{paymentSentCount}</h3>
          </div>
          <CreditCard className="w-7 h-7 text-amber-100" />
        </div>

        <div className="bg-emerald-600 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold text-emerald-200 uppercase tracking-wider block">Completed</span>
            <h3 className="text-2xl font-black mt-1">{completedJobs.length}</h3>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-200" />
        </div>

        <div className="bg-purple-600 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold text-purple-200 uppercase tracking-wider block">Average Rating</span>
            <h3 className="text-2xl font-black mt-1">
              {profile?.totalReviews > 0 ? `${profile.averageRating} / 5` : 'New'}
            </h3>
            <span className="text-3xs text-purple-200 font-semibold block">
              {profile?.totalReviews > 0 ? `${profile.totalReviews} ${profile.totalReviews === 1 ? 'Review' : 'Reviews'}` : 'No ratings yet'}
            </span>
          </div>
          <Star className="w-7 h-7 text-purple-200 fill-purple-200" />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900">Manage Service Jobs</h2>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {['All', 'Requested', 'Accepted', 'In Progress', 'Completed', 'Payment Sent', 'Closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Jobs Found</h3>
            <p className="text-xs text-slate-500">No bookings currently match the '{activeTab}' status tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBookings.map((job) => (
              <BookingCard
                key={job._id}
                booking={job}
                userRole="provider"
                onUpdateStatus={handleStatusUpdate}
                onOpenCompleteModal={(b) => setBookingForCompleteModal(b)}
                onOpenPaymentModal={(b) => setBookingForQRModal(b)}
                onOpenConfirmPaymentModal={(b) => setBookingForPaymentConfirmModal(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Provider Profile Edit / Change Photo Modal (Strictly for Providers) */}
      {showEditProfileModal && user?.role === 'provider' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-2xs font-extrabold text-indigo-600 uppercase tracking-widest">Provider Settings</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Edit Provider Profile & Photo</h2>
              <p className="text-xs text-slate-500">Update your profile photo and professional information visible to customers.</p>
            </div>

            {profileSaveError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileSaveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo Uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <img
                    src={editFormData.profileImage && editFormData.profileImage.trim() !== '' ? editFormData.profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Provider')}&background=6366f1&color=fff`}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditFormData((prev) => ({ ...prev, profileImage: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <input
                      type="url"
                      name="profileImage"
                      value={editFormData.profileImage}
                      onChange={(e) => setEditFormData({ ...editFormData, profileImage: e.target.value })}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-2xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visit Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFormData.visitCharge}
                    onChange={(e) => setEditFormData({ ...editFormData, visitCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Area</label>
                  <input
                    type="text"
                    required
                    value={editFormData.serviceArea}
                    onChange={(e) => setEditFormData({ ...editFormData, serviceArea: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Mark Job as Completed */}
      {bookingForCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setBookingForCompleteModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Mark Service as Completed?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure the service for <strong>{bookingForCompleteModal.customerId?.name}</strong> has been physically completed?
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBookingForCompleteModal(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteJob}
                disabled={actionSubmitting}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {actionSubmitting ? 'Updating...' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Confirm Payment Received */}
      {bookingForPaymentConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setBookingForPaymentConfirmModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Payment Received?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Have you verified in your bank/UPI account that payment of <strong>₹{bookingForPaymentConfirmModal.paymentAmount || bookingForPaymentConfirmModal.visitCharge || 199}</strong> was received from <strong>{bookingForPaymentConfirmModal.customerId?.name}</strong>?
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBookingForPaymentConfirmModal(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPaymentReceived}
                disabled={actionSubmitting}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {actionSubmitting ? 'Confirming...' : 'Confirm Payment Received'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider QR Modal (Receive Payment) */}
      {bookingForQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setBookingForQRModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-2xs font-extrabold text-indigo-600 uppercase tracking-widest">Receive Payment</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">UPI Payment QR Code</h2>
              <p className="text-xs text-slate-500">Customer: {bookingForQRModal.customerId?.name}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Amount to Receive:</span>
                <span className="text-lg font-black text-indigo-600">
                  ₹{bookingForQRModal.paymentAmount || bookingForQRModal.visitCharge || 199}
                </span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-sm">
                <img
                  src="/assets/payment-qr.png"
                  alt="UPI Payment QR Code"
                  className="w-52 h-52 object-contain mx-auto rounded-xl"
                />
              </div>

              <p className="text-2xs text-slate-500 font-medium">
                Show this QR code to the customer or ask them to click "Pay Now" on their dashboard.
              </p>
            </div>

            <button
              onClick={() => setBookingForQRModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
