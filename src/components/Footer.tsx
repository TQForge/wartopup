import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0b1054] text-white px-0 pt-8 pb-8 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-5">
        {/* Top Sections */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Stay Connected */}
          <div>
            <h3 className="text-[18px] font-bold mb-3 uppercase tracking-[0.15em] text-white">STAY CONNECTED</h3>
            <p className="font-primary text-white/80 text-[12px] leading-relaxed mb-4">
              Trusted by Thousands of Gamers<br />
              Best Diamond Top-Up Service in Bangladesh<br />
              Fast • Safe • Trusted No.1 Free Fire Top-Up Partner
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube, Mail].map((Icon, i) => (
                <div key={i} className="w-12 h-12 border border-white/20 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                  <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* Support Center */}
          <div>
            <h3 className="text-[18px] font-bold mb-3 uppercase tracking-[0.15em] text-white">SUPPORT CENTER</h3>
            <div 
              onClick={() => window.open('https://t.me/wartopup', '_blank')}
              className="border border-white/20 p-3 rounded-lg flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group w-full md:w-fit min-w-[280px]"
            >
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full flex-shrink-0">
                <Send className="w-6 h-6 text-[#0b1054] -rotate-12 translate-x-[-1px] translate-y-[1px]" />
              </div>
              
              <div className="w-px h-10 bg-white/20"></div>

              <div className="font-primary">
                <p className="text-[13px] font-bold text-white mb-0.5 whitespace-nowrap">Help line [9AM-12PM]</p>
                <p className="text-white/80 text-xs tracking-wide">টেলিগ্রামে সাপোর্ট</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/10 text-center space-y-0.5">
          <p className="font-primary text-[#A6A9B7] text-[13px] font-bold tracking-wide">
            © WarTopUp 2026 | All Rights Reserved | Developed
          </p>
          <p className="font-primary text-[#A6A9B7] text-[13px] font-bold tracking-widest">
            by <span className="text-white">Team Nova</span>
          </p>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-3">
        <div className="bg-primary text-white px-4 py-2 rounded-sm text-[13px] font-bold shadow-lg whitespace-nowrap relative">
          সাহায্য লাগবে ?
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-primary"></div>
        </div>
        <button 
          onClick={() => window.open('https://t.me/wartopup', '_blank')}
          className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
        >
          <Phone className="w-6 h-6 fill-white" />
        </button>
      </div>
    </footer>
  );
}
