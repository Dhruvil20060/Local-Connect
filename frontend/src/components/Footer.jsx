import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Wrench className="w-5 h-5" />
              </div>
              <span>Local<span className="text-indigo-400">Connect</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering local independent service professionals and providing households with instant, transparent service booking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-indigo-400 transition-colors">Find Local Professionals</Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/register?role=provider" className="hover:text-indigo-400 transition-colors">Become a Partner</Link>
              </li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Popular Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/providers?service=Plumber" className="hover:text-indigo-400 transition-colors">Plumbing Repair</Link></li>
              <li><Link to="/providers?service=Electrician" className="hover:text-indigo-400 transition-colors">Electrical Works</Link></li>
              <li><Link to="/providers?service=AC Repair" className="hover:text-indigo-400 transition-colors">AC Servicing & Gas Refill</Link></li>
              <li><Link to="/providers?service=Carpenter" className="hover:text-indigo-400 transition-colors">Furniture & Woodwork</Link></li>
              <li><Link to="/providers?service=Appliance Repair" className="hover:text-indigo-400 transition-colors">Appliance Repair</Link></li>
              <li><Link to="/providers?service=Home Cleaning" className="hover:text-indigo-400 transition-colors">Deep Cleaning</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Serving Surat, Ahmedabad, Vadodara & Tier-2/3 Cities</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@localconnect.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LocalConnect Platform.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>In India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
