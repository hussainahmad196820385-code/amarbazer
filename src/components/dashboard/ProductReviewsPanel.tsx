import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Star, MessageSquare, ThumbsUp, Trash2, CheckCircle2, AlertCircle,
  MessageCircle, Send, ShieldCheck
} from 'lucide-react';

interface LocalReview {
  id: string;
  productTitle: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  replies: string[];
}

export const ProductReviewsPanel: React.FC = () => {
  const { language } = useApp();
  
  // Simulated list of reviews for administrative moderation
  const [reviews, setReviews] = useState<LocalReview[]>([
    {
      id: 'rev-1',
      productTitle: 'Walton PRIMEX 55" 4K Google TV (Voice Control)',
      userName: 'Kamal Hossain',
      rating: 5,
      comment: language === 'bn' ? 'অসাধারণ কোয়ালিটি! ঢাকার ভেতরে মাত্র ২৪ ঘণ্টায় পেয়েছি।' : 'Outstanding quality! Received within 24 hours inside Dhaka.',
      date: '2026-07-25',
      verified: true,
      replies: ['Thank you Kamal! We aim for swift delivery. Enjoy your Walton TV!']
    },
    {
      id: 'rev-2',
      productTitle: 'Authentic Handloom Dhakai Jamdani Saree',
      userName: 'Nusrat Jahan',
      rating: 4,
      comment: language === 'bn' ? 'পণ্যটি খুব ভালো, প্যাকেজিং সুন্দর ছিলো।' : 'Very good product, well packaged by seller.',
      date: '2026-07-20',
      verified: true,
      replies: []
    },
    {
      id: 'rev-3',
      productTitle: 'Sundarbans Pure Organic Honey (100% Raw)',
      userName: 'Mofizul Islam',
      rating: 5,
      comment: language === 'bn' ? 'অনেক খাঁটি মধু! এটার গন্ধ এবং স্বাদ দুটোই দারুণ।' : 'Extremely pure honey. Scent and taste are both superb.',
      date: '2026-07-18',
      verified: true,
      replies: []
    },
    {
      id: 'rev-4',
      productTitle: 'Walton PRIMEX 55" 4K Google TV (Voice Control)',
      userName: 'Sabbir Rahman',
      rating: 3,
      comment: language === 'bn' ? 'টিভি টা ভালো কিন্তু ডেলিভারি দিতে ৩ দিন সময় লেগেছে।' : 'TV is fine but delivery took 3 days.',
      date: '2026-07-15',
      verified: false,
      replies: ['Apologies for the courier delay, Sabbir. We are addressing this with RedX.']
    }
  ]);

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleToggleVerified = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, verified: !r.verified } : r));
  };

  const handleDeleteReview = (id: string) => {
    if (!window.confirm('Delete this customer review listing?')) return;
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleSendReply = (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;

    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return { ...r, replies: [...r.replies, text] };
      }
      return r;
    }));

    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center">
          <Star className="w-6 h-6 mr-2 text-amber-500 fill-amber-500" />
          {language === 'bn' ? 'গ্রাহক রিভিউ ও রেটিং মডারেশন' : 'Product Reviews Panel'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {language === 'bn' 
            ? 'প্লাটফর্মের সমস্ত পণ্যের রিভিউ ও গ্রাহকদের মন্তব্য দেখুন এবং এডমিন বা বিক্রেতা হিসেবে রিপ্লাই দিন।' 
            : 'Moderate customer reviews, toggle purchase verification badges, and reply as the official support operator.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
            
            {/* Review Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{r.productTitle}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{r.userName}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{r.date}</span>
                  
                  {/* Verified purchase status */}
                  <button
                    onClick={() => handleToggleVerified(r.id)}
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition ${
                      r.verified
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-700 dark:border-slate-600'
                    }`}
                    title="Click to toggle verified status"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{r.verified ? 'Verified Purchase' : 'Unverified'}</span>
                  </button>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`} />
                ))}
              </div>
            </div>

            {/* Comment text */}
            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
              "{r.comment}"
            </p>

            {/* Response Section */}
            <div className="space-y-3">
              {r.replies.length > 0 && (
                <div className="space-y-2.5 pl-4 border-l-2 border-amber-500">
                  {r.replies.map((rep, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-bold text-amber-500 block mb-0.5">Official Operator Support:</span>
                      <p className="text-slate-600 dark:text-slate-400">{rep}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add response form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyInputs[r.id] || ''}
                  onChange={(e) => setReplyInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder="Type an official response as Support..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={() => handleSendReply(r.id)}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => handleDeleteReview(r.id)}
                  className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition border border-red-500/20 shrink-0"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
