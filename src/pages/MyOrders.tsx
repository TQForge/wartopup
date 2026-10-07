import React, { useEffect, useState } from 'react';
import { List, Clock, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, orderBy, onSnapshot, auth, limit } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

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

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Load cached orders for instant display
  const [orders, setOrders] = useState<any[]>(() => {
    const cached = localStorage.getItem('cached_orders');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(orders.length === 0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort client-side to avoid index requirement
      fetchedOrders.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return (dateB || 0) - (dateA || 0);
      });
      
      setOrders(fetchedOrders);
      setLoading(false);
      
      // Cache orders for next time
      try {
        localStorage.setItem('cached_orders', JSON.stringify(fetchedOrders));
      } catch (e) {
        console.error("Failed to cache orders:", e);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).replace(/\//g, '-').toUpperCase();
  };

  return (
    <div className="bg-[#F3F7FF] min-h-screen pt-2 lg:pt-6 pb-20">
      <div className="max-w-[1200px] lg:max-w-7xl mx-auto px-2 md:px-0 lg:px-8 container">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="text-left px-3 flex items-center">
            <svg className="mr-2 w-6 text-gray-700" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11 15H17V17H11V15M9 7H7V9H9V7M11 13H17V11H11V13M11 9H17V7H11V9M9 11H7V13H9V11M21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5M19 5H5V19H19V5M9 15H7V17H9V15Z"></path>
            </svg>
            <h2 className="text-lg text-black py-2 font-primary">My Orders</h2>
          </div>
          <hr className="border-gray-100" />
          
          {loading ? (
            <div className="box-form w-full text-center py-10">
              <h4 className="fb-normal text-gray-500">Loading order data...</h4>
            </div>
          ) : orders.length === 0 ? (
            <div className="box-form w-full text-center pb-4 pt-6">
              <h4 className="fb-normal mb-3 text-gray-600">No order data found !</h4>
              <button 
                onClick={() => navigate('/')} 
                className="bg-primary-500 border border-primary-500 hover:opacity-90 text-white text-xs py-1.5 px-3 md:px-4 rounded uppercase transition-all"
              > 
                Order Now 
              </button>
            </div>
          ) : (
              <div className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 space-y-1.5 text-base font-primary">
                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[#1A1A1A]">Serial NO:</span>
                      <span className="text-[#333333] uppercase">{order.id.slice(-6)}</span>
                    </div>

                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[#1A1A1A]">Date:</span>
                      <span className="text-[#333333]">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[#1A1A1A]">Package:</span>
                      <span className="text-[#333333] flex items-center gap-1">
                        {order.optionLabel}
                      </span>
                    </div>

                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[#1A1A1A]">Player ID:</span>
                      <span className="text-[#333333]">{order.playerId}</span>
                    </div>

                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[#1A1A1A]">Price:</span>
                      <span className="text-[#333333]">৳ {order.price.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[#1A1A1A]">Status:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          order.status?.toLowerCase() === 'completed' ? 'text-green-600' : 
                          order.status?.toLowerCase() === 'pending' ? 'text-yellow-600' : 
                          'text-gray-800'
                        )}>
                          {order.status?.toLowerCase()}
                        </span>
                        <span className="text-gray-700">
                          ( {formatDate(order.completedAt || order.createdAt)} )
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
