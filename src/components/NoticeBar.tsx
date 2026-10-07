import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function NoticeBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary-500 text-white px-2 py-1 md:px-5 md:py-3 w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-[1.2rem] font-normal">Notice:</h2>
          <button onClick={() => setIsVisible(false)} className="hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white text-[24px] cursor-pointer">
              <path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"></path>
            </svg>
          </button>
        </div>
        <div className="mt-1 flex">
          <span className="text-white text-[12px] font-normal">
            WarTopUp এখন আরও দ্রুত! দিন-রাত টপ-আপ করুন, যেকোনো সমস্যায় আমাদের মেসেঞ্জারে যোগাযোগ করুন।
          </span>
        </div>
      </div>
    </div>
  );
}
