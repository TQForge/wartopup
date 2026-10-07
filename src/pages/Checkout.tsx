import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Globe, X, ChevronLeft, Copy, CheckCircle2 } from 'lucide-react';
import { db, collection, addDoc, doc, updateDoc, Timestamp, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showAlert } = useAlert();
  const { product, selectedOption, playerId } = location.state || {};
  
  const [step, setStep] = useState<'select' | 'bkash' | 'nagad'>('select');
  const [trxId, setTrxId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!product || !selectedOption) {
    return <div className="p-8 text-center">Invalid checkout session.</div>;
  }

  const price = selectedOption.price;
  const number = "01605113725";
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerify = async () => {
    setErrorLocal(null);
    if (!trxId) {
      setErrorLocal("অনুগ্রহ করে ট্রানজেকশন আইডি প্রদান করুন");
      return;
    }
    
    if (!user) {
      setErrorLocal("অর্ডার করতে অনুগ্রহ করে লগইন করুন");
      return;
    }

    setIsVerifying(true);

    try {
      // Create the order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: profile?.displayName || user.email,
        productId: product.id,
        productTitle: product.title,
        optionLabel: selectedOption.label,
        price: price,
        playerId: playerId,
        trxId: trxId,
        paymentMethod: step,
        status: 'Pending',
        createdAt: Timestamp.now()
      });

      showAlert("পেমেন্ট ভেরিফিকেশন জমা দেওয়া হয়েছে। অ্যাডমিন ভেরিফাই করলে আপনার অর্ডারটি সম্পন্ন করা হবে।");
      navigate('/orders');

    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F3F7FF] z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
          {step === 'select' ? (
            <button onClick={() => navigate(-1)} className="text-gray-500">
              <Home className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={() => setStep('select')} className="text-gray-500">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-500">
            <Globe className="w-6 h-6" />
          </button>
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
          {step === 'select' ? (
            <div 
              className="p-6 flex flex-col items-center"
            >
              <div className="mt-8 mb-4">
                <div className="w-32 h-16 bg-white rounded-full border-2 border-blue-100 flex items-center justify-center p-2">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2592/2592317.png" 
                    alt="Secure Payment" 
                    className="h-10 object-contain"
                  />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-600 mb-8">Secure Payment</h1>

              <div className="w-full max-w-md bg-linear-to-r from-primary-start to-primary-end text-white py-3 px-4 rounded-md text-center font-bold mb-6 text-lg">
                মোবাইল ব্যাংকিং
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <button 
                  onClick={() => setStep('bkash')}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-center h-28"
                >
                  <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" alt="bKash" className="h-16 object-contain" />
                </button>
                <button 
                  onClick={() => setStep('nagad')}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-center h-28"
                >
                  <img src="https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg" alt="Nagad" className="h-16 object-contain" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="p-6 flex flex-col items-center"
            >
              <div className="mb-6">
                <img 
                  src={step === 'bkash' ? "https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" : "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg"} 
                  alt={step} 
                  className="h-16 object-contain" 
                />
              </div>

              <div className="w-full max-w-md bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-blue-50 flex items-center justify-center p-1">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2592/2592317.png" 
                    alt="Secure" 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
                <span className="text-lg font-bold text-gray-500">Secure Payment</span>
              </div>

              <div className="w-full max-w-md bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <span className="text-2xl font-bold text-gray-700">৳ {price}</span>
              </div>

              <div className={`w-full max-w-md rounded-2xl p-6 text-white ${step === 'bkash' ? 'bg-black' : 'bg-[#F7941D]'}`}>
                <h2 className="text-center text-xl font-bold mb-6">ট্রানজেকশন আইডি দিন</h2>
                
                <input 
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="ট্রানজেকশন আইডি দিন"
                  className="w-full p-4 rounded-xl text-gray-800 font-bold text-center mb-6 focus:outline-none shadow-inner bg-white"
                />

                <ul className="space-y-4 text-[13px] font-medium">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <span>*247# ডায়াল করে আপনার {step} মোবাইল মেনুতে যান অথবা {step} অ্যাপে যান।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <span>"Send Money" -এ ক্লিক করুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ</span>
                      <div className="flex items-center gap-2 bg-primary/30 px-3 py-1 rounded-md border border-white/20">
                        <span className="font-bold text-lg tracking-wider text-yellow-300">{number}</span>
                        <button 
                          onClick={handleCopy}
                          className="bg-black/40 p-1.5 rounded flex items-center gap-1 hover:bg-black/60 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px] font-bold">Copy</span>
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <span>টাকার পরিমাণঃ <span className="font-bold text-yellow-300 text-lg">{price}</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <span>নিশ্চিত করতে এখন আপনার {step} মোবাইল মেনু পিন লিখুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <span>সবকিছু ঠিক থাকলে, আপনি {step} থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                    <span>এখন উপরের বক্সে আপনার <span className="text-yellow-300 font-bold">Transaction ID</span> দিন এবং নিচের <span className="font-bold">VERIFY</span> বাটনে ক্লিক করুন।</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={handleVerify}
                className="w-full max-w-md mt-6 bg-linear-to-r from-primary-start to-primary-end text-white py-4 rounded-xl font-bold text-xl hover:opacity-90 transition-opacity uppercase tracking-widest"
              >
                Verify
              </button>
            </div>
          )}
        {errorLocal && (
          <div className="px-6 py-1">
            <h1 className="text-gray-900 text-[20px] font-bold leading-tight select-none text-center">
              {errorLocal === "অনুগ্রহ করে ট্রানজেকশন আইডি প্রদান করুন" ? "TrxID Is Require" : errorLocal}
            </h1>
          </div>
        )}
      </div>

      {/* Footer Button for Select Step */}
      {step === 'select' && (
        <div className="bg-primary/10 p-4 text-center border-t border-primary/20">
          <button className="text-primary font-bold text-xl">
            Pay {price}.00 BDT
          </button>
        </div>
      )}
    </div>
  );
}
