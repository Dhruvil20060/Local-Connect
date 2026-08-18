import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import BookingCard from '../components/BookingCard';
import * as bookingService from '../services/bookingService';
import * as reviewService from '../services/reviewService';
import { Calendar, CheckCircle2, Clock, Star, X, AlertCircle, CreditCard, QrCode, ShieldCheck, Check } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab Filter
  const [activeTab, setActiveTab] = useState('All');

  // Review Modal State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Payment Modal State
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getCustomerBookings();
      setBookings(data);

      // Auto-trigger review modal for completed/closed booking if not reviewed
      const unreviewedCompleted = data.find(
        (b) => ['Completed', 'COMPLETED', 'CLOSED'].includes(b.status) && !b.hasReviewed
      );
      if (unreviewedCompleted && !selectedBookingForReview && !selectedBookingForPayment) {
        // Optional auto-open after data load
      }
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Status update failed.');
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess(false);
  };

  const handleOpenPaymentModal = (booking) => {
    setSelectedBookingForPayment(booking);
    setPaymentError('');
    setPaymentSuccess(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    setReviewError('');
    setReviewSubmitting(true);

    try {
      await reviewService.createReview({
        bookingId: selectedBookingForReview._id,
        rating: Number(reviewRating),
        comment: reviewComment
      });

      setReviewSuccess(true);
      setTimeout(() => {
        setSelectedBookingForReview(null);
        fetchBookings();
      }, 1200);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkPaymentSent = async () => {
    if (!selectedBookingForPayment) return;
    setPaymentError('');
    setPaymentSubmitting(true);

    try {
      await bookingService.markPaymentSent(selectedBookingForPayment._id);
      setPaymentSuccess(true);
      setTimeout(() => {
        setSelectedBookingForPayment(null);
        setPaymentSuccess(false);
        fetchBookings();
      }, 1500);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Stat calculations supporting both DB status codes and UI strings
  const activeCount = bookings.filter((b) =>
    ['Requested', 'OFFERED', 'PENDING', 'Accepted', 'ACCEPTED', 'In Progress', 'IN_PROGRESS'].includes(b.status)
  ).length;
  const completedCount = bookings.filter((b) =>
    ['Completed', 'COMPLETED', 'CLOSED'].includes(b.status)
  ).length;
  const pendingCount = bookings.filter((b) =>
    ['Requested', 'OFFERED', 'PENDING'].includes(b.status)
  ).length;
  const paymentPendingCount = bookings.filter((b) =>
    b.paymentStatus === 'PAYMENT_PENDING' || (['Completed', 'COMPLETED'].includes(b.status) && b.paymentStatus !== 'PAYMENT_RECEIVED')
  ).length;

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Requested') return ['Requested', 'OFFERED', 'PENDING'].includes(b.status);
    if (activeTab === 'Accepted') return ['Accepted', 'ACCEPTED'].includes(b.status);
    if (activeTab === 'In Progress') return ['In Progress', 'IN_PROGRESS'].includes(b.status);
    if (activeTab === 'Completed') return ['Completed', 'COMPLETED'].includes(b.status);
    if (activeTab === 'Payment Pending') return b.paymentStatus === 'PAYMENT_PENDING';
    if (activeTab === 'Payment Sent') return b.paymentStatus === 'PAYMENT_SENT';
    if (activeTab === 'Closed') return b.status === 'CLOSED';
    if (activeTab === 'Cancelled') return ['Cancelled', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROVIDER', 'Rejected', 'REJECTED'].includes(b.status);
    return b.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-extrabold uppercase tracking-widest px-2.5 py-1 bg-white/20 rounded-full text-indigo-100">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Hello, {user?.name}!</h1>
          <p className="text-xs text-indigo-100 mt-1">Track your service requests, pay via UPI QR code, and review completed jobs.</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Pending Requests</span>
            <h3 className="text-2xl font-black text-slate-900">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Active Bookings</span>
            <h3 className="text-2xl font-black text-slate-900">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Payment Pending</span>
            <h3 className="text-2xl font-black text-slate-900">{paymentPendingCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Completed Services</span>
            <h3 className="text-2xl font-black text-slate-900">{completedCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Bookings Section with Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900">My Service Bookings</h2>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {['All', 'Requested', 'Accepted', 'In Progress', 'Completed', 'Payment Pending', 'Payment Sent', 'Closed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
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

        {loading ? (
          <Loader message="Loading your bookings history..." />
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Bookings Found</h3>
            <p className="text-xs text-slate-500">You have no bookings matching the '{activeTab}' filter tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                userRole="customer"
                onUpdateStatus={handleUpdateStatus}
                onOpenReviewModal={handleOpenReviewModal}
                onOpenPaymentModal={handleOpenPaymentModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedBookingForReview(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-2xs font-extrabold text-indigo-600 uppercase tracking-widest">Rate & Review</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Review {selectedBookingForReview.service} Service</h2>
              <p className="text-xs text-slate-500">Provider: {selectedBookingForReview.providerId?.name || selectedBookingForReview.offeredTo?.name}</p>
            </div>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center rounded-2xl space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-xs">Review Submitted!</h4>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-hidden cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Comment</label>
                  <textarea
                    required
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience regarding punctuality, work quality, and behavior..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Customer Payment Modal (UPI QR Code) */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedBookingForPayment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-2xs font-extrabold text-indigo-600 uppercase tracking-widest">Complete Payment</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Scan UPI QR Code</h2>
              <p className="text-xs text-slate-500">Service: {selectedBookingForPayment.service}</p>
            </div>

            {paymentSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Payment Marked as Sent!</h4>
                <p className="text-xs text-emerald-700">Waiting for provider confirmation...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Service Visit Fee:</span>
                    <span className="text-lg font-black text-indigo-600">
                      ₹{selectedBookingForPayment.paymentAmount || selectedBookingForPayment.visitCharge || 199}
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-sm">
                    <img
                      src="/assets/payment-qr.png"
                      alt="UPI Payment QR Code"
                      className="w-52 h-52 object-contain mx-auto rounded-xl"
                    />
                  </div>

                  <p className="text-2xs text-slate-500 font-medium">
                    Scan this QR code using Google Pay, PhonePe, Paytm, or any UPI app to complete your payment.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleMarkPaymentSent}
                    disabled={paymentSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    {paymentSubmitting ? 'Updating Payment...' : 'I Have Paid'}
                  </button>

                  <button
                    onClick={() => setSelectedBookingForPayment(null)}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Pay Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
