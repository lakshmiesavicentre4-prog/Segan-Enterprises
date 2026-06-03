import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, X, Loader2 } from 'lucide-react';
import { Cashfree } from '@cashfreepayments/cashfree-js';

// Load cashfree to satisfy the import, even though we mock it for pure client-side behavior
const cashfreeLoad = async () => {
  try {
    await window.Cashfree?.({ mode: 'sandbox' });
  } catch (e) {
    // Ignore as we run without backend
  }
};

interface CashfreeMockModalProps {
  appId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CashfreeMockModal: React.FC<CashfreeMockModalProps> = ({ appId, amount, onSuccess, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cashfreeLoad();
  }, []);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-reveal">
        <button 
          onClick={() => { if (!loading && step === 1) onCancel(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
          disabled={loading || step === 2}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3A229E] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm tracking-tighter">cf.</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">Cashfree Payments</h3>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Checkout
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center space-y-1 py-4">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Amount to Pay</p>
                <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tighter">
                  ₹{amount.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400">Order Ref: {appId}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full bg-[#3A229E] hover:bg-[#321c8b] text-white py-3.5 rounded-xl font-bold flex flex-col items-center justify-center transition-all min-h-[56px] shadow-lg shadow-[#3A229E]/20"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Using UPI / Cards</span>
                    </div>
                  )}
                </button>
                <button 
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Payment Successful</h3>
              <p className="text-sm text-slate-500">Redirecting to application...</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center">
          <p className="text-[10px] text-slate-400 font-medium">Secured by Cashfree PCI-DSS Compliant Gateway</p>
        </div>
      </div>
    </div>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
