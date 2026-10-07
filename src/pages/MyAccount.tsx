import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { RefreshCw, Info, Phone, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { AvatarImage } from '../components/AvatarImage';

export default function MyAccount() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refreshProfile();
    setIsRefreshing(false);
  };

  if (loading) return <div className="p-8 text-center text-primary-500 font-medium">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center">Please login to view your account.</div>;

  return (
    <div className="bg-[#F3F7FF] min-h-screen pb-24 font-sans">
      <div className="p-2 lg:max-w-7xl lg:mx-auto lg:px-8">
        <div className="text-center">
          <button className="focus:outline-none">
            <div 
              className="inline-block p-[10px] rounded-full shadow-md"
              style={{ background: 'linear-gradient(to top, #2ED12E 0%, #FFFFFF 100%)' }}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden block">
                <AvatarImage 
                  src={profile.photoURL || user?.photoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  name={profile.displayName || profile.email || user?.displayName || user?.email}
                />
              </div>
            </div>
          </button>
        </div>
        <div className="text-center w-full">
          <span className="capitalize mt-1 text-primary-500 font-medium">Hi, {profile.displayName || 'User'}</span>
        </div>
        <div className="text-center w-full flex mb-4 md:mb-8 justify-center items-center">
          <span className="capitalize font-primary" style={{ color: '#0B2A5B' }}>
            <b className="font-normal">Available Balance : </b> {profile.balance} Tk
          </span>
          <div 
            onClick={handleManualRefresh}
            className="border ml-2 p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors"
            title="Refresh balance"
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-500' : ''}`}
            >
              <path fill="currentColor" d="M2 12C2 16.97 6.03 21 11 21C13.39 21 15.68 20.06 17.4 18.4L15.9 16.9C14.63 18.25 12.86 19 11 19C4.76 19 1.64 11.46 6.05 7.05C10.46 2.64 18 5.77 18 12H15L19 16H19.1L23 12H20C20 7.03 15.97 3 11 3C6.03 3 2 7.03 2 12Z"></path>
            </svg>
          </div>
        </div>

        <div style={{ maxWidth: '700px', margin: 'auto' }}>
          {/* Stats Grid */}
          <div className="text-center grid md:grid-cols-4 grid-cols-2 md:gap-4 gap-3 my-2 md:my-5 mb-10">
            <div className="bg-white py-5 statics border border-green-500">
              <h2 className="text-lg text-primary-500 fb">{profile.supportPin || '---'}</h2>
              <h2 className="text-lg font-normal text-[16px]" style={{ color: '#0B2A5B' }}>Support Pin</h2>
            </div>
            <div className="bg-white py-5 statics border border-green-500">
              <h2 className="text-lg text-primary-500 fb">{profile.weeklySpent || 0} ৳</h2>
              <h2 className="text-lg font-normal text-[16px]" style={{ color: '#0B2A5B' }}>Weeklly Spent</h2>
            </div>
            <div className="bg-white py-5 statics border border-green-500">
              <h2 className="text-lg text-primary-500 fb">{profile.totalSpent || 0}</h2>
              <h2 className="text-lg font-normal text-[16px]" style={{ color: '#0B2A5B' }}>Total Spent</h2>
            </div>
            <div className="bg-white py-5 statics border border-green-500">
              <h2 className="text-lg text-primary-500 fb">{profile.totalOrder || 0}</h2>
              <h2 className="text-lg font-normal text-[16px]" style={{ color: '#0B2A5B' }}>Total Order</h2>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-md">
            <div className="text-left px-3 flex items-center">
              <svg className="mr-2 w-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 11.1V8C21 6.9 20.1 6 19 6H11L9 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H10.2C11.4 21.8 13.6 23 16 23C19.9 23 23 19.9 23 16C23 14.1 22.2 12.4 21 11.1M9.3 18H3V8H19V9.7C18.1 9.2 17.1 9 16 9C12.1 9 9 12.1 9 16C9 16.7 9.1 17.4 9.3 18M16 21C13.2 21 11 18.8 11 16S13.2 11 16 11 21 13.2 21 16 18.8 21 16 21M17 14H15V12H17V14M17 20H15V15H17V20Z"></path>
              </svg>
              <h2 className="text-lg text-black py-2 font-medium"> Account Information </h2>
            </div>
            <hr className="border-gray-100" />
            <div className="p-2">
              <div className="grid md:grid-cols-2 grid-cols-1 md:gap-8 gap-4">
                <div className="border border-gray-100 w-64 mx-auto p-3 text-center">
                  <div className="text-center font-primary">
                    <button type="button" className="justify-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-md text-sm gap-x-1.5 px-2.5 py-2.5 shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 inline-flex items-center my-2 w-full text-center">
                      {profile.balance.toFixed(2)}৳
                    </button>
                  </div>
                  <h5 className="text-2xl font-medium mt-3 text-black">Available Balance</h5>
                </div>
                <div className="border border-gray-100 w-64 mx-auto p-3 text-center">
                  <div className="text-center">
                    <div className="text-center">
                      <svg className="mx-auto" viewBox="0 0 24 24" style={{ width: '40px', height: '40px', color: 'rgb(31, 120, 255)' }}>
                        <path fill="currentColor" d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"></path>
                      </svg>
                      <h5 className="text-2xl font-medium mt-3"> 
                        Account Verified! 
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Card */}
          <div className="w-full text-left bg-white my-10 rounded-md">
            <div className="text-left px-3 flex items-center">
              <svg className="mr-2" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"></path>
              </svg>
              <h2 className="text-lg text-black py-2 font-medium">User Information</h2>
            </div>
            <hr className="border-gray-100" />
            <div className="px-4 py-4">
                  <h3 className="mb-2"><span className="font-normal">email</span> : <span className="font-normal">{profile.email}</span></h3>
                  <h3><span className="font-normal">Phone</span> : <span className="font-normal">{profile.phone || 'N/A'}</span></h3>
            </div>
          </div>

          {/* Admin Panel Link */}
          {profile.role === 'admin' && (
            <Link 
              to="/admin"
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 text-[18px] mb-10"
            >
              Access Admin Panel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
