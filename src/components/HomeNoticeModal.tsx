import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function HomeNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the notice was already shown in the current browser session
    const shown = sessionStorage.getItem('home-notice-shown');
    if (!shown) {
      // Small timeout to allow the initial home page render to transition nicely
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('home-notice-shown', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="home-notice-overlay"
          className="fixed inset-0 bg-black/70 z-[250] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <motion.div 
            id="modal" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-white rounded-lg shadow-2xl transition-all w-full max-w-[600px] my-auto overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Desktop Circular Close Button (hidden on mobile, positioned offset above top-right) */}
            <button 
              id="modal-desktop-close-btn"
              onClick={handleClose}
              className="hidden md:flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
              style={{
                position: 'absolute',
                right: '0px',
                top: '-33px',
                backgroundColor: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              title="Close"
            >
              <svg 
                stroke="currentColor" 
                fill="currentColor" 
                strokeWidth="0" 
                viewBox="0 0 512 512" 
                className="w-5 h-5 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z"></path>
              </svg>
            </button>

            {/* Flex Container */}
            <div className="md:flex items-stretch">
              {/* Image Side */}
              <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-t-lg md:rounded-tr-none md:rounded-l-lg overflow-hidden">
                <img 
                  src="https://raw.githubusercontent.com/TQForge/freefire/refs/heads/main/HomeNoticeModel.png" 
                  alt="Special Announcement" 
                  className="home_page_notice_img w-full h-auto object-cover md:h-full"
                  style={{
                    minHeight: '200px',
                    maxHeight: '320px',
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Message Side */}
              <div className="w-full md:w-1/2 text-xs p-5 flex flex-col justify-between home_page_notice_message">
                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-gray-900 font-primary leading-snug">
                    <p>গিভওয়ে এবং অফার আপডেট পেতে যুক্ত থাকুন আমাদের টেলিগ্রাম চ্যানেলে&nbsp;</p>
                  </h4>
                </div>
                <div className="mt-6">
                  <a 
                    target="_blank" 
                    rel="noreferrer" 
                    href="https://t.me/wartopupofficial"
                    className="inline-block bg-[#0088cc] hover:bg-[#0077b3] text-white py-2.5 px-6 rounded-md font-medium text-center transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                    style={{ fontSize: '15px' }}
                  >
                    ক্লিক করুন
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile Close Button (floating at bottom of modal) */}
            <div className="flex justify-center md:hidden">
              <button 
                id="modal-mobile-close-btn"
                onClick={handleClose}
                className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-8 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
                style={{
                  transform: 'translate(0px, 16px)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                ✗ Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
