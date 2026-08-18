import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';
import * as providerService from '../services/providerService';
import * as bookingService from '../services/bookingService';
import { Star, MapPin, Briefcase, IndianRupee, ShieldCheck, Calendar, Clock, AlertCircle, CheckCircle, Lock, X } from 'lucide-react';

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    problemDescription: '',
    address: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '09:00 AM - 11:00 AM'
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const data = await providerService.getProviderById(id);
        setProvider(data);
      } catch (error) {
        console.error('Error loading provider details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviderDetails();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      setBookingError('Only customers can request service bookings.');
      return;
    }

    setBookingError('');

    // Date & Time Validation Rule
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (bookingForm.preferredDate < todayStr) {
      setBookingError('Preferred booking date cannot be in the past.');
      return;
    }

    if (bookingForm.preferredDate === todayStr) {
      const currentHour = today.getHours();
      let slotEndHour = 24;
      if (bookingForm.preferredTime.includes('09:00 AM')) slotEndHour = 11;
      else if (bookingForm.preferredTime.includes('11:00 AM')) slotEndHour = 13;
      else if (bookingForm.preferredTime.includes('02:00 PM')) slotEndHour = 16;
      else if (bookingForm.preferredTime.includes('04:00 PM')) slotEndHour = 18;

      if (currentHour >= slotEndHour) {
        setBookingError('The selected time slot has already passed for today. Please select a future time slot.');
        return;
      }
    }

    setBookingSubmitting(true);

    try {
      await bookingService.createBooking({
        providerId: provider.userId?._id || provider.userId,
        service: provider.profession,
        problemDescription: bookingForm.problemDescription,
        address: bookingForm.address,
        preferredDate: bookingForm.preferredDate,
        preferredTime: bookingForm.preferredTime
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        navigate('/customer/dashboard');
      }, 1500);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking request failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading professional profile..." />;

  if (!provider) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Provider Profile Not Found</h2>
        <button
          onClick={() => navigate('/providers')}
          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Providers List
        </button>
      </div>
    );
  }

  const {
    profession,
    experience,
    city,
    serviceArea,
    description,
    visitCharge,
    profileImage,
    availability,
    isVerified,
    averageRating,
    totalReviews,
    reviews,
    userId
  } = provider;

  const providerName = userId?.name || 'Local Specialist';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <img
              src={profileImage && profileImage.trim() !== '' ? profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=6366f1&color=fff`}
              alt={providerName}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
            />
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm" title="Verified Professional">
                <ShieldCheck className="w-6 h-6 text-indigo-600 fill-indigo-100" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{providerName}</h1>
              {isVerified && (
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                  Verified Local Partner
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{profession}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{totalReviews > 0 ? averageRating : 'New'}</span>
              </div>
              <span className="text-xs text-slate-500">Based on {totalReviews} customer {totalReviews === 1 ? 'review' : 'reviews'}</span>
            </div>

            {/* Availability */}
            <div className="pt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                availability === 'Busy' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                ● Status: {availability}
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="w-full md:w-auto bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 shrink-0 text-center md:text-right">
          <div>
            <span className="text-xs text-slate-500 block font-medium">Standard Visit Charge</span>
            <div className="flex items-center justify-center md:justify-end font-extrabold text-slate-900 text-2xl">
              <IndianRupee className="w-6 h-6 text-slate-700" />
              <span>{visitCharge}</span>
            </div>
          </div>

          <button
            onClick={() => setShowBookingModal(true)}
            className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Request Service
          </button>

          {/* Privacy Note */}
          <p className="text-2xs text-slate-400 flex items-center justify-center md:justify-end gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> Phone details shared after request acceptance
          </p>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
            <h2 className="font-extrabold text-slate-900 text-lg">About {providerName}</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {description || 'No detailed bio provided yet.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xs text-slate-400 block font-medium">Experience</span>
                  <span className="text-xs font-bold text-slate-800">{experience} Years Hands-on</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xs text-slate-400 block font-medium">City & Coverage</span>
                  <span className="text-xs font-bold text-slate-800">{city} ({serviceArea})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-lg">Customer Ratings & Feedback</h2>
              <span className="text-xs font-bold text-slate-500">{totalReviews} Verified Reviews</span>
            </div>

            {!reviews || reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No reviews yet for this provider.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <ReviewCard key={rev._id} review={rev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Policy & Guarantee */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base">Platform Transparency</h3>
            <ul className="space-y-3 text-xs text-indigo-200">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct service request submitted to provider's mobile dashboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Manual acceptance by provider ensures real availability.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pay visit charge directly upon service inspection.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Request Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-2xs font-extrabold text-indigo-600 uppercase tracking-widest">New Service Booking</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Request {profession} Visit</h2>
              <p className="text-xs text-slate-500">Provider: {providerName} (Visit Fee: ₹{visitCharge})</p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center rounded-2xl space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Service Request Sent!</h4>
                <p className="text-xs">Redirecting to your customer dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Problem Description</label>
                  <textarea
                    required
                    rows="3"
                    value={bookingForm.problemDescription}
                    onChange={(e) => setBookingForm({ ...bookingForm, problemDescription: e.target.value })}
                    placeholder="Describe what needs repair or servicing..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Address</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                    placeholder="House No, Street, Landmark, Area, City"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
                    <select
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden font-medium"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
                >
                  {bookingSubmitting ? 'Sending Request...' : 'Submit Service Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetails;
