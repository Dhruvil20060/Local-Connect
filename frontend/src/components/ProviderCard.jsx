import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Briefcase, IndianRupee, ShieldCheck } from 'lucide-react';

const ProviderCard = ({ provider }) => {
  if (!provider) return null;

  const {
    _id,
    userId,
    profession,
    experience,
    city,
    visitCharge,
    profileImage,
    availability,
    isVerified,
    averageRating,
    totalReviews
  } = provider;

  const providerName = userId?.name || 'Local Service Pro';

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">Available</span>;
      case 'Busy':
        return <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">Busy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">Unavailable</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Image & Status */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <img
              src={profileImage && profileImage.trim() !== '' ? profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=6366f1&color=fff`}
              alt={providerName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs" title="Verified Professional">
                <ShieldCheck className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                {providerName}
              </h3>
            </div>

            <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
              {profession}
            </p>

            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-slate-800">{totalReviews > 0 ? averageRating : 'New'}</span>
              <span className="text-xs text-slate-400">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        </div>

        {/* Details Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 py-3 border-y border-slate-100 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{city}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{experience} Yrs Exp</span>
          </div>
        </div>
      </div>

      {/* Footer Pricing & Action */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <span className="text-xs text-slate-400 block">Visit Fee</span>
          <div className="flex items-center font-bold text-slate-900 text-base">
            <IndianRupee className="w-4 h-4 text-slate-700" />
            <span>{visitCharge}</span>
          </div>
        </div>

        <Link
          to={`/providers/${_id || userId?._id}`}
          className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 shadow-2xs"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ProviderCard;
