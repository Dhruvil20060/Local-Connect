import React, { useState, useEffect, useRef } from 'react';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import * as adminService from '../services/adminService';
import { ShieldCheck, Users, Briefcase, Calendar, Star, Trash2, CheckCircle, Clock, Check, X } from 'lucide-react';

const POLLING_INTERVAL = 5000;

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [deactivationRequests, setDeactivationRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const isMasterAdmin = currentUser?.role === 'admin';
  const isSubAdmin = currentUser?.role === 'subadmin';

  const fetchAdminData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      const [statsData, usersData, providersData, bookingsData, reviewsData, requestsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllUsers(),
        adminService.getAllProviders(),
        adminService.getAllBookings(),
        adminService.getAllReviews(),
        adminService.getDeactivationRequests()
      ]);

      if (!isMounted.current) return;

      setStats(statsData);
      setUsers(usersData);
      setProviders(providersData);
      setBookings(bookingsData);
      setReviews(reviewsData);
      setDeactivationRequests(requestsData);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      if (isMounted.current && isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchAdminData(true);

    const interval = setInterval(() => {
      if (isMounted.current) {
        fetchAdminData(false);
      }
    }, POLLING_INTERVAL);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleUserActive = async (userToToggle) => {
    if (currentUser && currentUser._id === userToToggle._id) {
      alert('Admin account cannot deactivate itself');
      return;
    }

    try {
      const targetIsActive = !userToToggle.isActive;
      const res = await adminService.toggleUserActive(userToToggle._id, targetIsActive);

      if (res.message) {
        alert(res.message);
      }

      fetchAdminData(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeactivationResponse = async (requestId, action) => {
    try {
      const res = await adminService.respondDeactivationRequest(requestId, action);
      alert(res.message || `Request ${action.toLowerCase()}ed successfully`);
      fetchAdminData(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to deactivation request');
    }
  };

  const handleToggleProviderVerify = async (providerId) => {
    try {
      await adminService.toggleProviderVerification(providerId);
      fetchAdminData(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle provider verification');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminService.deleteReview(reviewId);
      fetchAdminData(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) return <Loader fullScreen message="Loading Admin Management Portal..." />;

  const pendingRequestsCount = deactivationRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full text-white ${
                isMasterAdmin ? 'bg-purple-600' : 'bg-indigo-600'
              }`}
            >
              {isMasterAdmin ? 'Master Admin Control Center' : 'Sub Admin Control Center'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">LocalConnect Administration</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isMasterAdmin
              ? 'Full system control: Manage users, approve deactivation requests, and moderate content.'
              : 'Sub-Admin Portal: Manage users, providers, bookings & reviews. Deactivating profiles requires Master Admin approval.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Total Customers</span>
            <h3 className="text-2xl font-black text-slate-900">{stats?.totalCustomers || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Total Providers</span>
            <h3 className="text-2xl font-black text-slate-900">{stats?.totalProviders || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Total Bookings</span>
            <h3 className="text-2xl font-black text-slate-900">{stats?.totalBookings || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Completed Services</span>
            <h3 className="text-2xl font-black text-slate-900">{stats?.completedBookings || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase">Pending Deactivations</span>
            <h3 className="text-2xl font-black text-slate-900">{pendingRequestsCount}</h3>
          </div>
        </div>
      </div>

      {/* Admin Management Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          {[
            { id: 'users', label: `Users (${users.length})` },
            { id: 'providers', label: `Providers (${providers.length})` },
            { id: 'requests', label: `Deactivation Requests (${pendingRequestsCount})` },
            { id: 'bookings', label: `Bookings (${bookings.length})` },
            { id: 'reviews', label: `Reviews (${reviews.length})` }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {users.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.phone}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-2xs font-extrabold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'subadmin'
                                ? 'bg-indigo-100 text-indigo-800'
                                : u.role === 'provider'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-bold w-fit ${
                                u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                            {u.deactivationPending && u.isActive && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-2xs font-bold w-fit">
                                Pending Approval
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && u.role !== 'subadmin' && u._id !== currentUser?._id && (
                            <div className="flex justify-end gap-2">
                              {u.deactivationPending && u.isActive ? (
                                isSubAdmin ? (
                                  <span className="px-3 py-1 text-2xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                    Request Pending
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUserActive(u)}
                                    className="px-3 py-1 text-2xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                  >
                                    Approve Deactivation
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => handleToggleUserActive(u)}
                                  className={`px-3 py-1 text-2xs font-bold rounded-lg transition-colors cursor-pointer ${
                                    u.isActive
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {u.isActive
                                    ? isSubAdmin
                                      ? 'Request Deactivation'
                                      : 'Deactivate'
                                    : 'Activate'}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Providers */}
        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {providers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No providers found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-4">Provider Name</th>
                      <th className="p-4">Profession</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Visit Charge</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {providers.map((p) => {
                      const providerUserId = p.userId?._id;
                      const isUserActive = p.isActive !== false;
                      const isPending = p.deactivationPending;

                      return (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-900">{p.userId?.name || 'Technician'}</td>
                          <td className="p-4 text-indigo-600 font-bold">{p.profession}</td>
                          <td className="p-4">{p.city}</td>
                          <td className="p-4 font-bold">₹{p.visitCharge}</td>
                          <td className="p-4 font-bold text-amber-600">
                            {p.totalReviews > 0 ? `★ ${p.averageRating} (${p.totalReviews})` : '★ New (0 Reviews)'}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-2xs font-bold w-fit ${
                                  isUserActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {isUserActive ? 'Active' : 'Deactivated'}
                              </span>
                              {isPending && isUserActive && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-2xs font-bold w-fit">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                                p.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {p.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleProviderVerify(p._id)}
                              className={`px-3 py-1 text-2xs font-bold rounded-lg transition-colors cursor-pointer ${
                                p.isVerified
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {p.isVerified ? 'Unverify' : 'Verify Partner'}
                            </button>

                            {providerUserId && (
                              <button
                                onClick={() => handleToggleUserActive({ _id: providerUserId, isActive: isUserActive })}
                                className={`px-3 py-1 text-2xs font-bold rounded-lg transition-colors cursor-pointer ${
                                  isUserActive
                                    ? isPending
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {isUserActive
                                  ? isSubAdmin
                                    ? isPending
                                      ? 'Requested'
                                      : 'Request Deactivation'
                                    : 'Deactivate'
                                  : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Deactivation Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {deactivationRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No deactivation requests recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-4">Target User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Requested By</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Master Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {deactivationRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">
                          {req.targetUser?.name || 'User'}
                          <div className="text-2xs text-slate-400 font-normal">{req.targetUser?.email}</div>
                        </td>
                        <td className="p-4 font-bold uppercase text-slate-500">{req.targetUser?.role || 'N/A'}</td>
                        <td className="p-4">
                          <span className="font-semibold text-indigo-600">{req.requestedBy?.name || 'Sub Admin'}</span>
                          <div className="text-2xs text-slate-400">{req.requestedBy?.email}</div>
                        </td>
                        <td className="p-4 italic text-slate-600">{req.reason || 'N/A'}</td>
                        <td className="p-4 text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase ${
                              req.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : req.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {req.status === 'PENDING' ? (
                            isMasterAdmin ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleDeactivationResponse(req._id, 'APPROVE')}
                                  className="px-3 py-1 text-2xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDeactivationResponse(req._id, 'REJECT')}
                                  className="px-3 py-1 text-2xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-2xs text-amber-600 font-bold italic">
                                Awaiting Master Admin Approval
                              </span>
                            )
                          ) : (
                            <span className="text-2xs text-slate-400 font-semibold">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No bookings available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-4">Service</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Provider</th>
                      <th className="p-4">Preferred Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-indigo-600">{b.service}</td>
                        <td className="p-4">{b.customerId?.name}</td>
                        <td className="p-4">{b.providerId?.name}</td>
                        <td className="p-4">{b.preferredDate}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-bold text-2xs">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No reviews found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Provider</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {reviews.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{r.customerId?.name}</td>
                        <td className="p-4">{r.providerId?.name}</td>
                        <td className="p-4 font-bold text-amber-500">★ {r.rating}</td>
                        <td className="p-4 max-w-xs truncate">{r.comment}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Inappropriate Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
