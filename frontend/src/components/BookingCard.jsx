import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, PlayCircle, Star, RefreshCw, FileText, QrCode, CreditCard, ShieldCheck } from 'lucide-react';

const BookingCard = ({
  booking,
  userRole,
  onUpdateStatus,
  onOpenReviewModal,
  onOpenPaymentModal,
  onOpenConfirmPaymentModal,
  onOpenCompleteModal
}) => {
  const navigate = useNavigate();
  if (!booking) return null;

  const {
    _id,
    service,
    problemDescription,
    address,
    preferredDate,
    preferredTime,
    visitCharge,
    status,
    paymentStatus,
    paymentAmount,
    createdAt,
    customerId,
    providerId,
    offeredTo
  } = booking;

  const activeProvider = providerId || offeredTo;
  const otherPersonName = userRole === 'customer' ? activeProvider?.name : customerId?.name;
  const otherPersonPhone = userRole === 'customer' ? activeProvider?.phone : customerId?.phone;

  const getStatusBadge = () => {
    if (status === 'CLOSED') {
      return (
        <span className="px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Closed (Completed & Paid)
        </span>
      );
    }

    if (status === 'COMPLETED') {
      if (paymentStatus === 'PAYMENT_SENT') {
        return (
          <span className="px-3 py-1 text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Payment Sent (Waiting Confirmation)
          </span>
        );
      }
      if (paymentStatus === 'PAYMENT_PENDING') {
        return (
          <span className="px-3 py-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Payment Pending
          </span>
        );
      }
      return (
        <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Service Completed
        </span>
      );
    }

    switch (status) {
      case 'Requested':
      case 'OFFERED':
      case 'PENDING':
        return <span className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Requested</span>;
      case 'Accepted':
      case 'ACCEPTED':
        return <span className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>;
      case 'In Progress':
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5 animate-pulse" /> In Progress</span>;
      case 'Rejected':
      case 'REJECTED':
        return <span className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'Cancelled':
      case 'CANCELLED_BY_CUSTOMER':
      case 'CANCELLED_BY_PROVIDER':
        return <span className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-50 border rounded-full">{status}</span>;
    }
  };

  const handleRebook = () => {
    if (activeProvider && activeProvider._id) {
      navigate(`/providers/${activeProvider._id}`);
    } else {
      navigate('/providers');
    }
  };

  const isPending = ['Requested', 'OFFERED', 'PENDING'].includes(status);
  const isAccepted = ['Accepted', 'ACCEPTED'].includes(status);
  const isInProgress = ['In Progress', 'IN_PROGRESS'].includes(status);
  const isCompleted = ['Completed', 'COMPLETED'].includes(status);
  const isClosed = status === 'CLOSED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              {service}
            </span>
            <h3 className="font-bold text-base text-slate-900 mt-1">
              {userRole === 'customer' ? `Provider: ${otherPersonName || 'Assigned Specialist'}` : `Customer: ${otherPersonName || 'Client'}`}
            </h3>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Problem Description & Details */}
        <div className="py-4 space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-slate-700 text-xs leading-relaxed font-medium">{problemDescription}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Date: <strong>{preferredDate}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Time: <strong>{preferredTime}</strong></span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Address: <strong>{address}</strong></span>
          </div>

          {/* Amount Badge if Completed or Closed */}
          {(isCompleted || isClosed) && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-bold text-xs text-slate-800">
              <span>Amount Due / Paid:</span>
              <span className="text-sm font-extrabold text-indigo-600">₹{paymentAmount || visitCharge || 199}</span>
            </div>
          )}

          {/* Contact Details visible when accepted / in progress / completed / closed */}
          {(isAccepted || isInProgress || isCompleted || isClosed) && otherPersonPhone && (
            <div className="pt-2 border-t border-slate-100 text-indigo-700 font-semibold flex items-center gap-2">
              <span>Phone Contact:</span>
              <a href={`tel:${otherPersonPhone}`} className="underline hover:text-indigo-900">
                {otherPersonPhone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-2xs text-slate-400">
          Booked: {new Date(createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Provider Actions */}
          {userRole === 'provider' && isPending && (
            <>
              <button
                onClick={() => onUpdateStatus(_id, 'Accepted')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Accept Job
              </button>
              <button
                onClick={() => onUpdateStatus(_id, 'Rejected')}
                className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 cursor-pointer"
              >
                Reject
              </button>
            </>
          )}

          {userRole === 'provider' && isAccepted && (
            <button
              onClick={() => onUpdateStatus(_id, 'In Progress')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Start Job
            </button>
          )}

          {userRole === 'provider' && isInProgress && (
            <button
              onClick={() => (onOpenCompleteModal ? onOpenCompleteModal(booking) : onUpdateStatus(_id, 'Completed'))}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Mark Job as Completed
            </button>
          )}

          {userRole === 'provider' && isCompleted && paymentStatus === 'PAYMENT_PENDING' && (
            <button
              onClick={() => (onOpenPaymentModal ? onOpenPaymentModal(booking) : null)}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" /> Receive Payment
            </button>
          )}

          {userRole === 'provider' && isCompleted && paymentStatus === 'PAYMENT_SENT' && (
            <button
              onClick={() => (onOpenConfirmPaymentModal ? onOpenConfirmPaymentModal(booking) : onUpdateStatus(_id, 'CLOSED'))}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Payment Received
            </button>
          )}

          {/* Customer Actions */}
          {userRole === 'customer' && (isPending || isAccepted) && (
            <button
              onClick={() => onUpdateStatus(_id, 'Cancelled')}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancel Booking
            </button>
          )}

          {userRole === 'customer' && isCompleted && paymentStatus === 'PAYMENT_PENDING' && (
            <button
              onClick={() => (onOpenPaymentModal ? onOpenPaymentModal(booking) : null)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" /> Pay Now (QR Code)
            </button>
          )}

          {userRole === 'customer' && isCompleted && paymentStatus === 'PAYMENT_SENT' && (
            <span className="text-2xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Waiting for provider payment confirmation
            </span>
          )}

          {userRole === 'customer' && (isCompleted || isClosed) && (
            <>
              {onOpenReviewModal && (
                <button
                  onClick={() => onOpenReviewModal(booking)}
                  className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Rate & Review</span>
                </button>
              )}

              <button
                onClick={handleRebook}
                className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
                title="Book this provider again"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rebook</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
