import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProviderCard from '../components/ProviderCard';
import Loader from '../components/Loader';
import * as providerService from '../services/providerService';
import { Search, MapPin, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const Providers = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(queryParams.get('search') || '');
  const [service, setService] = useState(queryParams.get('service') || 'All');
  const [city, setCity] = useState(queryParams.get('location') || '');
  const [minRating, setMinRating] = useState('0');
  const [sortBy, setSortBy] = useState('rating');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const filters = {
        search,
        service: service === 'All' ? '' : service,
        location: city,
        rating: minRating,
        sortBy
      };
      const data = await providerService.getProviders(filters);
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
    setService(params.get('service') || 'All');
    setCity(params.get('location') || '');
  }, [location.search]);

  useEffect(() => {
    fetchProviders();
  }, [service, minRating, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Find Service Professionals</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Compare independent local technicians, transparent visit charges, and real customer ratings.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* City / Location */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="City (e.g. Surat, Vadodara)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Service Category */}
          <div className="relative">
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-hidden font-medium"
            >
              <option value="All">All Services</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="AC Repair">AC Repair</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Appliance Repair">Appliance Repair</option>
              <option value="Home Cleaning">Home Cleaning</option>
            </select>
          </div>

          {/* Submit Search */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Apply Filters
          </button>
        </form>

        {/* Second Row: Sorting and Rating */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Min Rating:
            </span>
            {['0', '4.0', '4.5'].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  minRating === r
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === '0' ? 'All Ratings' : `${r}+ Stars`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 font-medium focus:outline-hidden"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="visitChargeLow">Visit Charge: Low to High</option>
              <option value="visitChargeHigh">Visit Charge: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <Loader message="Finding matching service professionals..." />
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">No Providers Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search location or service category to find available local professionals.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setService('All');
              setCity('');
              setMinRating('0');
              setSortBy('rating');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs font-bold text-slate-500 mb-4">
            Showing {providers.length} verified service professionals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider._id} provider={provider} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;
