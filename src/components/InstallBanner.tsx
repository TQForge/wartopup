import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already running in standalone/installed mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // No need to show banner if already installed
    }

    // Check if banner was dismissed in this 24h window
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
    const now = Date.now();
    
    // If dismissed less than 24 hours ago, don't show automatically
    const isRecentlyDismissed = dismissedTime && (now - parseInt(dismissedTime, 10)) < 24 * 60 * 60 * 1000;

    if (!isRecentlyDismissed) {
      // Show initially after a small delay on mobile
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Force showing the banner if PWA is installable natively
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      await deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsVisible(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Persist standard 24 hours dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  // If not visible, return null
  if (!isVisible) return null;

  return (
    <div id="install-pwa-banner" className="fixed bottom-[4.5rem] left-0 right-0 mx-4 z-[200] lg:hidden transition-all duration-300 ease-in-out">
      <div className="bg-primary-500 text-white rounded-lg shadow-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          <span className="text-sm font-medium">Install App</span>
        </div>
        <div className="flex gap-2">
          <button 
            id="pwa-install-btn"
            onClick={handleInstallClick}
            className="text-xs h-8 px-3 text-black border-2 border-white bg-white/95 hover:bg-white active:scale-95 transition-all rounded-md font-medium cursor-pointer"
          >
            Install
          </button>
          <button 
            id="pwa-close-btn"
            onClick={handleClose}
            className="text-xs h-8 w-8 p-0 text-white hover:bg-white/10 active:scale-95 transition-all rounded-md flex items-center justify-center cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
