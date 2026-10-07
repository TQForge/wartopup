import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NoticeBar from '../components/NoticeBar';
import ProductCard from '../components/ProductCard';
import HomeNoticeModal from '../components/HomeNoticeModal';
import { Image as ImageIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function Home() {
  const location = useLocation();
  const isTopUpPage = location.pathname === '/topup';
  const [currentBanner, setCurrentBanner] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.6);
  
  // Load cached banners
  const [banners, setBanners] = useState<string[]>(() => {
    const cached = localStorage.getItem('cached_banners');
    return cached ? JSON.parse(cached) : [];
  });
  
  // Load cached products for instant display
  const [products, setProducts] = useState<any[]>(() => {
    const cached = localStorage.getItem('cached_products');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(products.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Banners - limit to 5
    const bannersQuery = query(collection(db, 'banners'), orderBy('order', 'asc'), limit(5));
    const unsubscribeBanners = onSnapshot(bannersQuery, { includeMetadataChanges: true }, (snapshot) => {
      const fetchedBanners = snapshot.docs
        .map(doc => doc.data().imageUrl)
        .filter(url => typeof url === 'string');
      
      if (fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
        localStorage.setItem('cached_banners', JSON.stringify(fetchedBanners));
      }
    }, (err) => {
      console.error("Banners listener error:", err);
    });

    // Fetch Products - limit to 50 for performance
    const productsQuery = query(collection(db, 'products'), orderBy('order', 'asc'), limit(50));
    const unsubscribeProducts = onSnapshot(productsQuery, { includeMetadataChanges: true }, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: String(data.title || ''),
          imageUrl: String(data.imageUrl || ''),
          category: String(data.category || ''),
          options: Array.isArray(data.options) ? data.options : [],
          rules: Array.isArray(data.rules) ? data.rules.map(String) : [],
          steps: Array.isArray(data.steps) ? data.steps.map(String) : []
        };
      });

      if (fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
        setLoading(false);
        localStorage.setItem('cached_products', JSON.stringify(fetchedProducts));
      } else if (snapshot.metadata.fromCache === false) {
        setLoading(false);
      }
    }, (err) => {
      console.error("Products listener error:", err);
      setLoading(false);
      if (err.code === 'permission-denied') {
        setError("Firebase Permission Denied. Please check your Firestore Rules.");
      }
    });

    return () => {
      unsubscribeBanners();
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setTransitionDuration(0.6);
      setCurrentBanner((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleAnimationComplete = () => {
    if (currentBanner >= banners.length) {
      setTransitionDuration(0);
      setCurrentBanner(0);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="pb-24 bg-[#F3F7FF] min-h-screen relative overflow-x-hidden">
        <HomeNoticeModal />
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 space-y-2 pt-2">
          {!isTopUpPage && <NoticeBar />}

          {error && (
            <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm font-bold flex flex-col gap-2">
              <p>{error}</p>
              <p className="text-[11px] opacity-80">
                Go to your Firebase Console (warntopup) &gt; Firestore Database &gt; Rules tab, and publish the rules from this project.
              </p>
            </div>
          )}

           {/* Banner Carousel */}
          {!isTopUpPage && (
            <div className="space-y-2 md:!mt-8 lg:!mt-12">
              <div className="relative w-full aspect-[2.2/1] sm:aspect-[3.5/1] lg:aspect-[3.2/1] overflow-hidden bg-white">
                {banners.length > 0 ? (
                  <div className="w-full h-full overflow-hidden relative">
                    <motion.div
                      className="flex w-full h-full"
                      animate={{ x: `-${currentBanner * 100}%` }}
                      transition={{
                        type: 'tween',
                        ease: 'easeInOut',
                        duration: transitionDuration
                      }}
                      onAnimationComplete={handleAnimationComplete}
                    >
                      {(banners.length > 1 ? [...banners, banners[0]] : banners).map((banner, i) => (
                        <div key={i} className="w-full h-full flex-shrink-0">
                          <img
                            src={banner || null}
                            alt={`Banner ${i}`}
                            className="w-full h-full object-fill"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </motion.div>
                  </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
              {/* Indicators moved below the banner */}
              {banners.length > 0 && (
                <div className="flex justify-center gap-1.5 mt-3.5">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTransitionDuration(0.6);
                        setCurrentBanner(i);
                      }}
                      className={`h-1 transition-all duration-300 ${
                        i === (currentBanner % banners.length) ? 'bg-black w-6' : 'bg-gray-400 w-4'
                      } cursor-pointer`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State for Products */}
        {loading && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mt-2 mb-6"></div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="flex flex-col items-center w-full bg-white rounded-lg overflow-hidden border border-gray-100 animate-pulse">
                  <div className="w-full aspect-square bg-gray-200"></div>
                  <div className="w-full py-2 px-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Sections */}
        {!loading && categories.map(category => (
          <section key={category} className="md:my-10 my-3">
            <div className="container mx-auto px-4 lg:px-8 lg:max-w-7xl">
              <div className="text-center">
                <div className="flex items-center justify-center px-4 mt-0 md:mt-2 section-contact-gap py-2 pb-4 md:py-8">
                  <h1 className="text-2xl sm:text-3xl text-center font-primary fb mx-4 text-secondary-500">{category}</h1>
                </div>
              </div>
              <div className="pb-1 md:pb-10">
                <div className="md:py-5 grid sm:grid-cols-4 grid-cols-3 md:gap-8 gap-4 md:grid-cols-5">
                  {products.filter(p => p.category === category).map((product) => (
                    <ProductCard key={product.id} id={product.id} title={product.title} imageUrl={product.imageUrl} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        {!loading && products.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 p-12 text-center text-gray-400">
            No products found.
          </div>
        )}
    </div>
  );
}
