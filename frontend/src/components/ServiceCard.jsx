import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Zap, Wind, Hammer, Tv, Sparkles, HelpCircle } from 'lucide-react';

const iconMap = {
  Wrench: Wrench,
  Zap: Zap,
  Wind: Wind,
  Hammer: Hammer,
  Tv: Tv,
  Sparkles: Sparkles
};

const ServiceCard = ({ category }) => {
  const navigate = useNavigate();
  const { name, description, icon } = category;

  const IconComponent = iconMap[icon] || HelpCircle;

  const handleClick = () => {
    navigate(`/providers?service=${encodeURIComponent(name)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center mb-4 shadow-xs">
          <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110" />
        </div>

        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
          {name}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
        <span>Find Specialists</span>
        <span>→</span>
      </div>
    </div>
  );
};

export default ServiceCard;
