import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { CheckCircle2, Info, ExternalLink, ChevronRight, Check } from 'lucide-react';
import { db, doc, onSnapshot, collection, addDoc, updateDoc, Timestamp, increment } from '../lib/firebase';

export default function ProductDetails() {
  const { id, subId } = useParams();
  const { user, profile } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  
  // Try to find product in cache for instant preview
  const [product, setProduct] = useState<any>(() => {
    const cached = localStorage.getItem('cached_products');
    if (cached && id) {
      const products = JSON.parse(cached);
      return products.find((p: any) => p.id === id) || null;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'instant'>('wallet');
  const [errors, setErrors] = useState<{ package?: boolean; playerId?: boolean }>({});

  const [checking, setChecking] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedOption) setErrors(prev => ({ ...prev, package: false }));
  }, [selectedOption]);

  useEffect(() => {
    if (playerId) setErrors(prev => ({ ...prev, playerId: false }));
  }, [playerId]);

  useEffect(() => {
    setNickname(null);
    setVerifyError(null);
    setChecking(false);
  }, [playerId]);

  const handleCheckNickname = async () => {
    const trimmedId = playerId.trim();
    if (!trimmedId) {
      setVerifyError("এখানে আপনার গেমের আইডি কোড লিখুন");
      return;
    }

    setChecking(true);
    setVerifyError(null);
    setNickname(null);

    try {
      const apiUrl = (import.meta as any).env.VITE_FF_API_URL;
      const apiKey = (import.meta as any).env.VITE_FF_API_KEY;

      if (!apiUrl || !apiKey) {
        console.error("Missing credentials/env variables VITE_FF_API_URL or VITE_FF_API_KEY");
        setVerifyError("Player not found");
        return;
      }

      const response = await fetch(
        `${apiUrl}/freefireinfo/bhau?uid=${encodeURIComponent(trimmedId)}&region=bd&key=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        setNickname(null);
        setVerifyError("Player not found");
        return;
      }

      const data = await response.json();

      if (data && (data.status === 'error' || data.error || data.success === false || data.msg === 'Invalid UID' || data.message?.includes('not found') || data.message === 'Player not found')) {
        setNickname(null);
        setVerifyError("Player not found");
      } else {
        const resolvedName = data.basicInfo?.nickname || data.basicInfo?.Nickname || data.nickname || data.Nickname || data.name || data.Name || data.player_name || data.PlayerName || data.username || data.Playername || data.Player_Name;
        
        if (resolvedName) {
          setNickname(resolvedName);
          setVerifyError(null);
        } else {
          setNickname(null);
          setVerifyError("Player not found");
        }
      }
    } catch (err) {
      console.log("UID lookup handled gracefully:", err);
      setVerifyError("Player not found");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    
    // Use onSnapshot for instant cache + real-time server updates
    const docRef = doc(db, 'products', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setProduct(data);
        setError(null);
      } else {
        setError("Product not found.");
      }
      setLoading(false);
    }, (err: any) => {
      console.error("Product fetch error:", err);
      if (!product) {
        if (err.code === 'permission-denied') {
          setError("Firebase Permission Denied. Please check your Firestore Rules.");
        } else {
          setError("Failed to load product details.");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  
  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-500 font-bold">{error}</div>
        {error.includes('Permission Denied') && (
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Go to your Firebase Console (warntopup) &gt; Firestore Database &gt; Rules tab, and publish the rules from this project.
          </p>
        )}
        <button 
          onClick={() => navigate('/')}
          className="bg-linear-to-r from-primary-start to-primary-end text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-gray-500">Product not found.</div>;

  const rechargeOptions = product.options || [];

  const selectedPrice = rechargeOptions.find((opt: any) => opt.id === selectedOption)?.price || 0;

  return (
    <div className="bg-[#F3F7FF] min-h-screen pt-3 md:pt-5 pb-4">
      <div className="max-w-[1200px] lg:max-w-7xl mx-auto px-2 md:px-0 lg:px-8 container">
        {/* Product Header */}
        <div className="bg-white rounded-md mb-2 md:mb-3 border border-gray-100">
          <div className="flex">
            <div>
              <img 
                className="p-2 w-24 h-24 object-contain" 
                src={product.imageUrl || "https://admin.evotopup.com/products/1754589287.jpeg"} 
                alt={product.title} 
              />
            </div>
            <div className="flex items-center">
              <div>
                <h2 className="text-lg capitalize font-medium">{product.title}</h2>
                <div className="text-gray-400 text-sm text-left">
                  <span>{product.category || 'Game'} </span> / <span>Top up </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form className="md:flex gap-2">
          {/* Left Column: Select Recharge */}
          <section className="w-full md:w-2/3 mt-0 md:mt-2">
            <div className="bg-white rounded-md border border-gray-100">
              <div className="text-left p-2 flex items-center">
                <div className="_order_header_step_circle mr-2">1</div>
                <h2 className="text-lg text-black py-2 font-medium"> Select Recharge </h2>
              </div>
              <hr className="border-gray-100" />
              <div className="p-2 md:p-4 inline-grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 package-item-outer w-full">
                {rechargeOptions.map((option: any) => (
                  <div key={option.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedOption(option.id)}
                      className={`rounded-md border w-full text-center py-3 px-4 transition-all font-primary relative overflow-hidden ${
                        selectedOption === option.id 
                          ? 'border-primary ring-1 ring-primary/20' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {selectedOption === option.id && (
                        <>
                          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] pointer-events-none" />
                          <div 
                            className="absolute top-0 left-0 bg-primary text-white z-10 flex items-start justify-start pl-0.5 pt-0.5"
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              clipPath: 'polygon(0 0, 100% 0, 0 100%)' 
                            }}
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={4} />
                          </div>
                        </>
                      )}
                      <div className="text-sm font-normal relative z-1" style={{ color: '#0B2A5B' }}>{option.label}</div>
                      <div className="text-xs font-primary mt-1 text-primary-500 font-normal relative z-1"> BDT {option.price}</div>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="px-1">
                {errors.package && (
                  <p className="text-red-600 text-3xl p-2">Package Is Require</p>
                )}
              </div>
              
              <div className="ml-4 my-2 md:my-4">
                <a 
                  target="_blank" 
                  rel="noreferrer" 
                  href="#" 
                  className="flex items-center gap-0.5 text-sm font-semibold order-link"
                >
                  <span className="relative flex items-center justify-center">
                    <svg className="w-[20px] h-[20px] text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="2" style={{ marginTop: '-5px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </span>
                  <span className="shimmer-text"> কিভাবে অর্ডার করবেন? </span>
                  <span className="arrow-move">➜</span>
                </a>
              </div>
            </div>
          </section>

          {/* Right Column: Account Info & Payment */}
          <div className="w-full md:w-1/3 mt-2 space-y-2">
            {/* 2. Account Info */}
            <section>
              <div className="bg-white rounded-md border border-gray-100">
                <div className="text-left px-3 flex items-center">
                  <div className="_order_header_step_circle mr-2">2</div>
                  <h2 className="text-lg text-black py-2 font-medium"> Account Info </h2>
                </div>
                <hr className="border-gray-100" />
                <div className="p-3">
                  <div className="relative">
                    <label className="text-base font-medium mb-1 block" style={{ color: '#0B2A5B' }}>এখানে আপনার গেমের আইডি কোড লিখুন</label>
                    <div className="gamename-outer1">
                      <input 
                        type="text" 
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        placeholder="এখানে আপনার গেমের আইডি কোড লিখুন" 
                        className="form-input relative block w-full focus:outline-none border-0 rounded-md placeholder-gray-400 text-sm px-3 py-2.5 shadow-none bg-transparent text-gray-900 ring-1 ring-inset ring-green-300 focus:ring-2 focus:ring-green-400"
                      />
                      {playerId.trim() && (
                        <div className="mt-1.5 text-xs text-left font-medium">
                          {verifyError && verifyError !== "Player not found" && <p className="text-red-500">{verifyError}</p>}
                        </div>
                      )}
                      <div className="mt-2 text-center" id="check-nickname-container">
                        {!nickname ? (
                          <button
                            type="button"
                            onClick={handleCheckNickname}
                            disabled={checking || !playerId.trim()}
                            className="w-full h-9 rounded-md font-medium text-sm transition bg-primary-500 text-white hover:opacity-90 flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed"
                            id="btn-check-game-id"
                          >
                            {checking ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="btn-check-spinner">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <span className="text-sm fb">
                                {verifyError === "Player not found" ? "Player not found" : "আপনার গেম আইডির নাম চেক করুন"}
                              </span>
                            )}
                          </button>
                        ) : (
                          <div className="bg-green-500 h-9 gamename1 rounded-md text-white font-medium text-sm flex items-center justify-center gap-2" id="nickname-display-badge">
                            <span className="text-sm fb">{nickname}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      {errors.playerId && (
                        <p className="text-red-600 text-3xl p-2">ID Is Require</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Select Payment Option */}
            <section>
              <div className="select-server bg-white rounded-md border border-gray-100">
                <div className="text-left px-3 flex items-center">
                  <div className="_order_header_step_circle mr-2">3</div>
                  <h2 className="text-lg text-black py-2 font-medium"> Select one option </h2>
                </div>
                <hr className="border-gray-100" />
                
                <div className="flex justify-center py-3 px-2">
                  <div className="w-full">
                    <div className="m-1">
                      <label 
                        onClick={() => setPaymentMethod('wallet')}
                        className={`mb-0 w-full border rounded-md pt-2 cursor-pointer relative overflow-hidden block ${
                          paymentMethod === 'wallet' ? 'border-primary' : 'border-gray-200'
                        }`}
                        style={{ fontSize: '11px' }}
                      >
                        {paymentMethod === 'wallet' && (
                          <div 
                            className="absolute top-0 left-0 bg-primary text-white z-10 flex items-start justify-start pl-0.5 pt-0.5"
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              clipPath: 'polygon(0 0, 100% 0, 0 100%)' 
                            }}
                          >
                            <Check className="w-4 h-4" strokeWidth={4} />
                          </div>
                        )}
                        <img src="/upload/walletpay.png" alt="Select Wallet" className="p-2 mx-auto" style={{ height: '5.9rem' }} />
                        <div className="bg-[#d1d5db] text-left p-1 mt-2">
                          <p className="text-xs p-0 capitalize fb-normal text-gray-600"> Wallet Pay </p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="text-center w-full">
                    <div className="m-1">
                      <label 
                        onClick={() => setPaymentMethod('instant')}
                        className={`mb-0 w-full border rounded-md pt-2 cursor-pointer relative overflow-hidden block ${
                          paymentMethod === 'instant' ? 'border-primary' : 'border-gray-200'
                        }`}
                        style={{ fontSize: '11px' }}
                      >
                        {paymentMethod === 'instant' && (
                          <div 
                            className="absolute top-0 left-0 bg-primary text-white z-10 flex items-start justify-start pl-0.5 pt-0.5"
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              clipPath: 'polygon(0 0, 100% 0, 0 100%)' 
                            }}
                          >
                            <Check className="w-4 h-4" strokeWidth={4} />
                          </div>
                        )}
                        <img src="/upload/instantpay.png" alt="Instant Pay" className="p-2 mx-auto" style={{ height: '5.9rem' }} />
                        <div className="bg-[#d1d5db] text-left p-1 mt-2">
                          <p className="text-xs p-0 capitalize fb-normal text-gray-600"> Instant Pay </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pb-5 px-3 space-y-3">
                  <div>
                    <div className="font-normal text-xs flex items-center mb-2 text-gray-500">
                      <Info className="w-3.5 h-3.5 mr-1" />
                      আপনার অ্যাকাউন্ট ব্যালেন্স 
                      <div className="inline-flex items-center">
                        <span className="pl-2 text-primary fb"> ৳ {profile?.balance || 0}.00</span>
                        <div 
                          className="border ml-2 p-1 rounded cursor-pointer"
                          onClick={() => {
                            // Simple refresh simulation since we're using real-time listener in AuthContext
                            showAlert("ব্যালেন্স আপডেট করা হয়েছে", "success");
                          }}
                        >
                          <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path fill="currentColor" d="M2 12C2 16.97 6.03 21 11 21C13.39 21 15.68 20.06 17.4 18.4L15.9 16.9C14.63 18.25 12.86 19 11 19C4.76 19 1.64 11.46 6.05 7.05C10.46 2.64 18 5.77 18 12H15L19 16H19.1L23 12H20C20 7.03 15.97 3 11 3C6.03 3 2 7.03 2 12Z"></path></svg>
                        </div>
                      </div>
                    </div>
                    <p className="font-normal text-xs flex items-center mb-3 text-gray-500">
                      <Info className="w-3.5 h-3.5 mr-1" />
                      প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-primary fb px-1"> ৳ {selectedPrice} </span> । 
                    </p>
                    
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        
                        const newErrors = {
                          package: !selectedOption,
                          playerId: !playerId
                        };
                        
                        if (newErrors.package || newErrors.playerId) {
                          setErrors(newErrors);
                          if (newErrors.package) showAlert("Please select a package", "error");
                          else if (newErrors.playerId) showAlert("Please enter your Player ID", "error");
                          return;
                        }
                        
                        if (paymentMethod === 'instant') {
                          navigate('/checkout', { 
                            state: { 
                              product, 
                              selectedOption: rechargeOptions.find((o: any) => o.id === selectedOption),
                              playerId 
                            } 
                          });
                        } else {
                          // Wallet Pay logic
                          const currentBalance = profile?.balance || 0;
                          const packageOption = rechargeOptions.find((o: any) => o.id === selectedOption);
                          
                          if (!packageOption) {
                            showAlert("Please select a package", "error");
                            return;
                          }

                          if (currentBalance < packageOption.price) {
                            showAlert("আপনার পর্যাপ্ত ব্যালেন্স নেই। অনুগ্রহ করে অ্যাড মানি করুন।", "error");
                            navigate('/add-money');
                            return;
                          }

                          try {
                            // Deduct balance
                            await updateDoc(doc(db, 'users', user.uid), {
                              balance: increment(-packageOption.price),
                              totalSpent: increment(packageOption.price),
                              totalOrder: increment(1)
                            });

                            // Create order
                            await addDoc(collection(db, 'orders'), {
                              userId: user.uid,
                              userName: profile?.displayName || user.email,
                              productId: product.id,
                              productTitle: product.title,
                              optionLabel: packageOption.label,
                              price: packageOption.price,
                              playerId: playerId,
                              trxId: 'WALLET-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                              paymentMethod: 'wallet',
                              status: 'Pending',
                              createdAt: Timestamp.now()
                            });

                            showAlert("অর্ডার সফল হয়েছে!", "success");
                            navigate('/orders');
                          } catch (error: any) {
                            console.error("Wallet purchase error:", error);
                            showAlert("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", "error");
                          }
                        }
                      }}
                      className="text-center px-4 py-2.5 text-white text-[16px] font-bold rounded inline-block shadow-lg w-full transition bg-primary-500 hover:opacity-90"
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* Rules & Conditions */}
        <div className="mt-3 md:mt-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border-b border-gray-100">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z"></path>
            </svg>
            <h2 className="fb-normal text-gray-800 text-sm md:text-base"> Rules & Conditions </h2>
          </div>
          <div className="p-3 text-sm text-gray-700 leading-relaxed space-y-2 description-content">
            <p>✔️ শুধুমাত্র Bangladesh সার্ভারের Player ID/UID দিয়ে Top Up করা যাবে। অন্য সার্ভারের Player ID/UID হলে অর্ডার করবেন না। Diamond নিতে শুধু মাত্র আপনার Player ID Code/UID লাগবে  </p>
            <p>&nbsp;</p>
            <p>✔️ Player ID Code/UID ভুল দিয়ে Diamond না পেলে কর্তৃপক্ষ দায়ী নয় ।</p>
            <p>&nbsp;</p>
            <p>✔️ সাধারণত 30 সেকেন্ড থেকে ২ মিনিটের ভিতরে Order Complete করা হয়।  ইভেন্টে টাইমে সর্বোচ্চ 5 মিনিট সময় লাগতে পারে।</p>
            <p>&nbsp;</p>
            <p>✔️ 2-5 মিনিটের মধ্যে ডেলিভারি না পেলে বা যেকোনো প্রয়োজনে ওয়েবসাইটের নিচে ডানপাশে থাকা লাইভ চ্যাটে যোগাযোগ করুন। অথবা আমাদের ফেসবুক পেজে মেসেজ করুন আমাদের Support-Team আপনাকে সাহায্য করবে।</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p className="font-bold">Player ID/UID কিভাবে পাবেন ?</p>
            <p>&nbsp;</p>
            <p>✔️ আপনার মোবাইল থেকে Free fire গেমটি Login করুন।</p>
            <p>✔️ উপরের বাম কর্ণারে আপনার Profile Name এ ক্লিক করুন।</p>
            <p>✔️ এখন ডান দিকে আপনার Profile Name এর নিচে একটি  UID </p>
            <p>✔️ নাম্বার দেয়া আছে, এটিই আপনার Player ID/UID.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
