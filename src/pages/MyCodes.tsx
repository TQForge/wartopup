import React from 'react';

export default function MyCodes() {
  return (
    <div className="bg-[#F3F7FF] min-h-screen pb-24 pt-2 lg:pt-6">
      <div className="max-w-[1200px] lg:max-w-7xl mx-auto px-2 md:px-0 lg:px-8 container">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="text-left px-3 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              <svg className="mr-2 w-6 text-gray-700" viewBox="0 0 24 24">
                <path fill="currentColor" d="M11 15H17V17H11V15M9 7H7V9H9V7M11 13H17V11H11V13M11 9H17V7H11V9M9 11H7V13H9V11M21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5M19 5H5V19H19V5M9 15H7V17H9V15Z"></path>
              </svg>
              <h2 className="text-lg text-black py-2 font-primary">My Codes</h2>
            </div>
            <a 
              href="https://shop.garena.my/app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-primary-500 px-4 py-2 text-white rounded-md text-sm font-bold shadow-md hover:opacity-90 transition-opacity uppercase"
              id="redeem_code_button"
            > 
              Redeem Code 
            </a>
          </div>
          
        </div>
      </div>
    </div>
  );
}
