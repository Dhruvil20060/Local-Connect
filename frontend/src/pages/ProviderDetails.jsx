import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';
import * as providerService from '../services/providerService';
import * as bookingService from '../services/bookingService';
import { Star, MapPin, Briefcase, IndianRupee, ShieldCheck, Calendar, Clock, AlertCircle, CheckCircle, Lock, X } from 'lucide-react';

const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSlotHours = (preferredTime) => {
  if (!preferredTime) return { startHour: null, endHour: null };
  const matches = preferredTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi);
  if (!matches || matches.length < 1) return { startHour: null, endHour: null };

  const parseSingleTime = (timeStr) => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  const startHour = parseSingleTime(matches[0]);
  let endHour = matches.length >= 2 ? parseSingleTime(matches[1]) : (startHour !== null ? startHour + 1 : null);
  if (endHour === 0 && startHour === 23) endHour = 24;

  return { startHour, endHour };
};

const getSlotStartHour = (preferredTime) => {
  return getSlotHours(preferredTime).startHour;
};

const generateTimeSlots = (selectedDateStr) => {
  const todayStr = getLocalDateStr();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday = selectedDateStr === todayStr;

  const slots = [];
  const startHour = 9; // 9:00 AM
  const endHour = 21;  // 9:00 PM

  for (let h = startHour; h < endHour; h++) {
    const formatTime = (hour) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const strHour = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
      return `${strHour}:00 ${period}`;
    };

    const sStart = h;
    const sEnd = h + 1;
    const startLabel = formatTime(sStart);
    const endLabel = formatTime(sEnd);
    const timeString = `${startLabel} - ${endLabel}`;

    let status = 'AVAILABLE';
    let isDisabled = false;
    let reason = 'Available for booking';
    let estimatedArrival = startLabel;

    if (isToday && sEnd <= currentHour) {
      status = 'PAST';
      isDisabled = true;
      reason = 'Time slot has ended';
    } else if (isToday && currentHour >= sStart && currentHour < sEnd) {
      status = 'ONGOING';
      let arrMin = currentMinute + 15;
      let arrHour = currentHour;
      if (arrMin >= 60) {
        arrHour += 1;
        arrMin -= 60;
      }
      const arrPeriod = arrHour >= 12 ? 'PM' : 'AM';
      let arrDispH = arrHour % 12;
      if (arrDispH === 0) arrDispH = 12;
      estimatedArrival = `${String(arrDispH).padStart(2, '0')}:${String(arrMin).padStart(2, '0')} ${arrPeriod}`;
      reason = `Ongoing slot (Est. arrival: ${estimatedArrival})`;
    }

    slots.push({
      value: timeString,
      label: timeString,
      startHour: sStart,
      endHour: sEnd,
      disabled: isDisabled,
      status,
      reason,
      estimatedArrival
    });
  }

  return slots;
};

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
    preferredDate: getLocalDateStr(),
    preferredTime: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [slotList, setSlotList] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch DB-driven slot availability whenever modal open, date, provider or address changes
  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      if (!showBookingModal) return;
      setLoadingSlots(true);
      try {
        const pId = provider?.userId?._id || provider?.userId || provider?._id || id;
        const data = await bookingService.getProviderAvailability({
          providerId: pId,
          preferredDate: bookingForm.preferredDate,
          address: bookingForm.address
        });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setSlotList(data);
        } else if (isMounted) {
          setSlotList(generateTimeSlots(bookingForm.preferredDate));
        }
      } catch (err) {
        console.error('Error loading provider availability:', err);
        if (isMounted) setSlotList(generateTimeSlots(bookingForm.preferredDate));
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchAvailability();
    return () => { isMounted = false; };
  }, [showBookingModal, bookingForm.preferredDate, provider, id]);

  const displaySlots = slotList.length > 0 ? slotList : generateTimeSlots(bookingForm.preferredDate);

  // Auto-select valid slot if current selection is invalid or disabled
  useEffect(() => {
    if (!showBookingModal) return;
    const currentValid = displaySlots.find(s => s.value === bookingForm.preferredTime && !s.disabled);
    if (!currentValid) {
      const firstAvailable = displaySlots.find(s => !s.disabled);
      setBookingForm(prev => ({
        ...prev,
        preferredTime: firstAvailable ? firstAvailable.value : ''
      }));
    }
  }, [showBookingModal, bookingForm.preferredDate, displaySlots]);

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
    const todayStr = getLocalDateStr(today);
    if (bookingForm.preferredDate < todayStr) {
      setBookingError('Preferred booking date cannot be in the past.');
      return;
    }

    if (bookingForm.preferredDate === todayStr) {
      const currentHour = today.getHours();
      const { endHour } = getSlotHours(bookingForm.preferredTime);

      if (!bookingForm.preferredTime || (endHour !== null && endHour <= currentHour)) {
        setBookingError('The selected time slot has already passed for today. Please select a future time slot.');
        return;
      }
    }

    const chosenSlot = displaySlots.find(s => s.value === bookingForm.preferredTime);
    if (chosenSlot && chosenSlot.disabled) {
      setBookingError(`Selected time slot is unavailable: ${chosenSlot.reason}`);
      return;
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
                      min={getLocalDateStr()}
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time {loadingSlots && <span className="text-slate-400 font-normal">(checking availability...)</span>}
                    </label>
                    <select
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden font-medium"
                    >
                      {displaySlots.every(s => s.disabled) && (
                        <option value="" disabled>No available slots for this date</option>
                      )}
                      {displaySlots.map((slot) => {
                        let badgeStr = '';
                        if (slot.status === 'ONGOING') badgeStr = ' • Ongoing Slot';
                        else if (slot.disabled && slot.status === 'UNAVAILABLE') badgeStr = ` • ${slot.reason}`;
                        else if (slot.disabled && slot.status === 'PAST') badgeStr = ' • Ended';
                        else if (slot.estimatedArrival && slot.reason && slot.reason.includes('Estimated arrival:')) badgeStr = ` • ${slot.reason}`;

                        return (
                          <option key={slot.value} value={slot.value} disabled={slot.disabled}>
                            {slot.label}{badgeStr}
                          </option>
                        );
                      })}
                    </select>

                    {/* ETA & Slot Status Info Badge */}
                    {(() => {
                      const selectedSlot = displaySlots.find(s => s.value === bookingForm.preferredTime);
                      if (!selectedSlot) return null;
                      return (
                        <div className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                          selectedSlot.disabled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : selectedSlot.status === 'ONGOING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          <Clock className="w-4 h-4 shrink-0 text-current" />
                          <span>{selectedSlot.reason || `Est. arrival: ${selectedSlot.estimatedArrival}`}</span>
                        </div>
                      );
                    })()}
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
