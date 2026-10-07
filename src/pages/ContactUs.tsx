import React from 'react';
import { Send } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="bg-[#F3F7FF] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="w-full bg-white rounded-none p-3 space-y-2 border border-[#c1d4f5]">
        <div className="text-center py-1">
          <h1 className="text-3xl font-normal text-gray-900 tracking-tight">Contact Us</h1>
        </div>

        <div className="space-y-2">
          <a
            href="https://m.me/evotopup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-[#F3F7FF] rounded-lg border border-[#c1d4f5] hover:border-gray-300 transition-all group"
          >
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors shrink-0">
              <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', color: 'rgb(217, 69, 175)' }}><path fill="currentColor" d="M12,2C6.36,2 2,6.13 2,11.7C2,14.61 3.19,17.14 5.14,18.87C5.3,19 5.4,19.22 5.41,19.44L5.46,21.22C5.5,21.79 6.07,22.16 6.59,21.93L8.57,21.06C8.74,21 8.93,20.97 9.1,21C10,21.27 11,21.4 12,21.4C17.64,21.4 22,17.27 22,11.7C22,6.13 17.64,2 12,2M18,9.46L15.07,14.13C14.6,14.86 13.6,15.05 12.9,14.5L10.56,12.77C10.35,12.61 10.05,12.61 9.84,12.77L6.68,15.17C6.26,15.5 5.71,15 6,14.54L8.93,9.87C9.4,9.14 10.4,8.95 11.1,9.47L13.44,11.23C13.66,11.39 13.95,11.39 14.16,11.23L17.32,8.83C17.74,8.5 18.29,9 18,9.46Z"></path></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 leading-tight">মেসেঞ্জারে লাইভ চ্যাটের জন্য</h3>
              <p className="text-xs text-gray-500">এখানে ক্লিক করুন।</p>
            </div>
          </a>

          <a
            href="https://wa.me/8801605113725"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-[#F3F7FF] rounded-lg border border-[#c1d4f5] hover:border-gray-300 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors shrink-0">
              <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', color: 'rgb(43, 211, 73)' }}><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"></path></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 leading-tight">হোয়াটসঅ্যাপে লাইভ চ্যাটের জন্য</h3>
              <p className="text-xs text-gray-500">এখানে ক্লিক করুন।</p>
            </div>
          </a>

          <a
            href="https://t.me/evotopup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-[#F3F7FF] rounded-lg border border-[#c1d4f5] hover:border-gray-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors shrink-0">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 leading-tight">টেলিগ্রাম সাপোর্টে কথা বলার জন্য</h3>
              <p className="text-xs text-gray-500">এখানে ক্লিক করুন।</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
);
}
