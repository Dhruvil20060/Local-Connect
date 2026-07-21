import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, Shield, Star, Award, CheckCircle, ArrowRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import ProviderCard from '../components/ProviderCard';
import Loader from '../components/Loader';
import * as providerService from '../services/providerService';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search form state
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, providersRes] = await Promise.all([
          providerService.getServices(),
          providerService.getProviders({ sortBy: 'rating' })
        ]);
        setServices(servicesRes);
        setTopProviders(providersRes.slice(0, 3));
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchService) query.set('service', searchService);
    if (searchLocation) query.set('location', searchLocation);
    navigate(`/providers?${query.toString()}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* A. Hero Search Section */}
      <section className="relative bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100/80 rounded-full">
              <Shield className="w-3.5 h-3.5" /> Direct Local Service Discovery
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trusted Local Services, <br />
              <span className="text-indigo-600">Right Around You</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Connect directly with independent plumbers, electricians, technicians, and cleaning experts in your city with transparent charges and verified ratings.
            </p>

            {/* Search Bar Container */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto mt-8"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-indigo-500 transition-colors">
                <Search className="w-5 h-5 text-indigo-600 shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Plumber, AC Repair)"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-hidden placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-indigo-500 transition-colors">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your location (e.g. Surat, Adajan)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-hidden placeholder:text-slate-400 font-medium"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <span>Find Experts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* B. Popular Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Popular Local Services</h2>
          </div>
          <Link
            to="/providers"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Explore All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((cat) => (
              <ServiceCard key={cat._id || cat.name} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* C. How It Works */}
      <section id="how-it-works" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Simple Workflow</span>
            <h2 className="text-3xl font-extrabold mt-1">How LocalConnect Works</h2>
            <p className="text-sm text-slate-400 mt-2">Get your home issues resolved in 4 easy transparent steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Search a Service', desc: 'Find independent professionals by entering your city and required service category.' },
              { step: '02', title: 'Compare Providers', desc: 'Read genuine verified customer reviews, experience years, and visit charges.' },
              { step: '03', title: 'Request a Booking', desc: 'Describe your issue and schedule a convenient date & time for a home visit.' },
              { step: '04', title: 'Get Service Done', desc: 'Provider accepts, completes the job on-site, and you leave your valuable review.' }
            ].map((st, idx) => (
              <div key={idx} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 relative">
                <span className="text-4xl font-black text-indigo-500/30 block mb-3">{st.step}</span>
                <h3 className="font-bold text-lg text-white mb-2">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* D. Top Rated Providers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Verified Experts</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Top Rated Local Professionals</h2>
          </div>
          <Link
            to="/providers"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All Professionals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topProviders.map((prov) => (
              <ProviderCard key={prov._id} provider={prov} />
            ))}
          </div>
        )}
      </section>

      {/* E. Why Choose LocalConnect? */}
      <section className="bg-indigo-50/60 py-16 border-y border-indigo-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Why LocalConnect?</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Empowering Local Communities</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Local Independent Pros', desc: 'Directly support hardworking technicians in Tier-2 and Tier-3 cities.' },
              { icon: Star, title: 'Genuine Ratings & Reviews', desc: 'Only customers with verified completed bookings can post reviews.' },
              { icon: Award, title: 'Transparent Visit Charges', desc: 'Know exact visit charges upfront with zero hidden fee surprises.' },
              { icon: CheckCircle, title: 'Simple Direct Request', desc: 'Straightforward booking without complicated emergency dispatch algorithms.' },
              { icon: Shield, title: 'No Direct Contact Leaks', desc: 'Protects privacy until booking request is confirmed by provider.' }
            ].map((b, idx) => {
              const IconComp = b.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-2xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* F. Become a Provider CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-white/20 rounded-full text-indigo-100">
              For Local Specialists
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">Are You an Independent Service Professional?</h2>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Grow your local client base without middleman commissions. Create your digital profile and accept service requests in minutes.
            </p>
          </div>

          <Link
            to="/register?role=provider"
            className="px-8 py-4 text-sm font-bold text-indigo-900 bg-white hover:bg-indigo-50 rounded-2xl transition-all shadow-md shrink-0"
          >
            Register as Provider
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
