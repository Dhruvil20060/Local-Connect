import React from 'react';
import { Star, User, Calendar } from 'lucide-react';

const ReviewCard = ({ review }) => {
  if (!review) return null;

  const { rating, comment, customerId, createdAt } = review;
  const customerName = customerId?.name || 'Verified Customer';

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{customerName}</h4>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <span className="text-2xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed pt-1 font-medium">
        "{comment}"
      </p>
    </div>
  );
};

export default ReviewCard;
