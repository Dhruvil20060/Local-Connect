import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import BookingCard from '../components/BookingCard';
import * as bookingService from '../services/bookingService';
import * as providerService from '../services/providerService';
import { Bell, CheckCircle2, Clock, Star, PlayCircle, ToggleLeft, ToggleRight, Check, X, MapPin, Phone } from 'lucide-react';

const ProviderDashboard = () => {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState('Available');

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
      await bookingService.updateBookingStatus(bookingId, newStatus);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) return <Loader fullScreen message="Opening your provider dashboard..." />;

  // Filter bookings by state
  const newRequests = bookings.filter((b) => b.status === 'Requested');
  const acceptedJobs = bookings.filter((b) => ['Accepted', 'In Progress'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome & Availability Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {profile?.profession || 'Service Professional'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            City: {profile?.city || 'Surat'} | Visit Charge: ₹{profile?.visitCharge || 199}
          </p>
        </div>

        {/* Big Simple Availability Toggle */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full md:w-auto space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Your Current Status:</span>
          <div className="flex items-center gap-2">
            {['Available', 'Busy', 'Unavailable'].map((st) => (
              <button
                key={st}
                onClick={() => handleAvailabilityToggle(st)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all shadow-2xs ${
                  availability === st
                    ? st === 'Available' ? 'bg-emerald-600 text-white' : st === 'Busy' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simplified High-Contrast Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">New Requests</span>
            <h3 className="text-3xl font-black mt-1">{newRequests.length}</h3>
          </div>
          <Bell className="w-8 h-8 text-indigo-200" />
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">Accepted Jobs</span>
            <h3 className="text-3xl font-black mt-1">{acceptedJobs.length}</h3>
          </div>
          <Clock className="w-8 h-8 text-blue-200" />
        </div>

        <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">Completed Jobs</span>
            <h3 className="text-3xl font-black mt-1">{completedJobs.length}</h3>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-200" />
        </div>

        <div className="bg-amber-500 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider block">Average Rating</span>
            <h3 className="text-3xl font-black mt-1">{profile?.averageRating || 'New'}</h3>
          </div>
          <Star className="w-8 h-8 text-amber-200 fill-amber-200" />
        </div>
      </div>

      {/* Main Section 1: New Service Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" /> New Service Requests
          </h2>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {newRequests.length} Waiting
          </span>
        </div>

        {newRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80">
            <p className="text-xs text-slate-400 font-medium">No pending service requests right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newRequests.map((req) => (
              <div key={req._id} className="bg-white rounded-3xl border-2 border-indigo-100 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-2xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                      {req.service}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1">
                      Customer: {req.customerId?.name}
                    </h3>
                  </div>
                  <span className="text-2xs text-slate-400">Requested: {req.preferredDate}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    <strong>Problem:</strong> {req.problemDescription}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <strong>Location:</strong> {req.address}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <strong>Preferred Time:</strong> {req.preferredTime}
                  </p>
                </div>

                {/* Big Clear Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(req._id, 'Accepted')}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Accept Job
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                    className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Section 2: Accepted Jobs */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" /> Accepted & Ongoing Jobs
        </h2>

        {acceptedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80">
            <p className="text-xs text-slate-400 font-medium">No active accepted jobs currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acceptedJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Customer: {job.customerId?.name}
                    </h3>
                    <a href={`tel:${job.customerId?.phone}`} className="text-xs font-bold text-indigo-600 underline flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> Call {job.customerId?.phone}
                    </a>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    <strong>Work Required:</strong> {job.problemDescription}
                  </p>
                  <p><strong>Address:</strong> {job.address}</p>
                  <p><strong>Date & Time:</strong> {job.preferredDate} at {job.preferredTime}</p>
                </div>

                {/* Status Update Buttons */}
                <div className="pt-2">
                  {job.status === 'Accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(job._id, 'In Progress')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm"
                    >
                      Mark as In Progress (On-Site)
                    </button>
                  )}

                  {job.status === 'In Progress' && (
                    <button
                      onClick={() => handleStatusUpdate(job._id, 'Completed')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Work Finished (Mark Completed)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Section 3: Completed Jobs History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Completed Service History
        </h2>

        {completedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80">
            <p className="text-xs text-slate-400 font-medium">No completed jobs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedJobs.map((cj) => (
              <div key={cj._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{cj.customerId?.name}</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Completed</span>
                </div>
                <p className="text-slate-600 line-clamp-2">{cj.problemDescription}</p>
                <span className="text-2xs text-slate-400 block pt-1 border-t border-slate-200">
                  {cj.preferredDate}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
