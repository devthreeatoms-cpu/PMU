"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle, Image as ImageIcon, X, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Review, Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { submitReviewAction, getApprovedReviewsAction, checkProductPurchaseAction, markReviewHelpfulAction } from "@/app/admin/reviews/review-actions";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "@/lib/firebase";
import Link from "next/link";

interface ProductReviewsProps {
  product: Product;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifiedPurchaser, setIsVerifiedPurchaser] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!product.id) return;

    const fetchReviews = async () => {
      const result = await getApprovedReviewsAction(product.id as string);
      if (result.success) {
        setReviews(result.reviews as Review[]);
      }
    };

    fetchReviews();
    // Poll every 5 seconds for a near-realtime experience
    const interval = setInterval(fetchReviews, 5000);
    return () => clearInterval(interval);
  }, [product.id]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (user && product.id) {
        const result = await checkProductPurchaseAction(user.uid, product.id as string);
        if (result.success) {
          setIsVerifiedPurchaser(result.hasPurchased || false);
        }
      }
    };
    checkPurchase();
  }, [user, product.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        const storage = getStorage(app);
        
        for (const file of selectedImages) {
          const storageRef = ref(storage, `reviews/${product.id}/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          uploadedImageUrls.push(url);
        }
      }

      const result = await submitReviewAction({
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: user.displayName || "Anonymous Artist",
        userEmail: user.email || "",
        rating,
        comment: comment.trim(),
        isVerifiedPurchase: isVerifiedPurchaser,
        imageUrls: uploadedImageUrls,
      });

      if (result.success) {
        setIsSuccess(true);
        setComment("");
        setRating(5);
        setSelectedImages([]);
        toast.success("Review submitted for approval!");
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClicked[reviewId]) return;
    
    const result = await markReviewHelpfulAction(reviewId);
    if (result.success) {
      setHelpfulClicked(prev => ({ ...prev, [reviewId]: true }));
      toast.success("Thanks for your feedback!");
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-12 gap-12">
        {/* Summary Column */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-2xl font-heading italic text-zinc-900">Artist Feedback</h3>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-light text-zinc-900">{averageRating}</div>
            <div className="space-y-1">
              <div className="flex gap-0.5 text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} 
                    className={i < Math.round(Number(averageRating)) ? "text-brand-gold" : "text-zinc-200"}
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Based on {reviews.length} reviews
              </p>
            </div>
          </div>
          
          {/* Rating Bars */}
          <div className="space-y-2 pt-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => Math.round(r.rating) === star).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-8">
                    <span className="text-[10px] font-bold text-zinc-600">{star}</span>
                    <Star size={8} fill="currentColor" className="text-zinc-400" />
                  </div>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-brand-gold"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-zinc-400 w-6">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              All reviews are from verified artists and undergo a standard moderation process to maintain professional standards.
            </p>
          </div>
        </div>

        {/* Review Form Column */}
        <div className="md:col-span-6 space-y-6 border-x border-zinc-50 px-12">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Share your experience</h4>
          
          {!user ? (
            <div className="p-8 border border-dashed border-zinc-200 rounded-3xl flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-8 h-8 text-zinc-300" />
              <p className="text-sm text-zinc-500 italic">Please sign in to leave a review for this product.</p>
              <Link href="/login">
                <Button variant="outline" className="rounded-full px-8 text-[10px] font-bold tracking-widest uppercase">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-green-50 border border-green-100 rounded-3xl flex flex-col items-center gap-4 text-center"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <h5 className="font-bold text-green-900 text-sm uppercase tracking-widest">Review Submitted</h5>
              <p className="text-xs text-green-700 leading-relaxed">
                Thank you for your feedback! Your review has been sent to our moderators for approval.
              </p>
              <Button 
                variant="ghost" 
                onClick={() => setIsSuccess(false)}
                className="text-[10px] font-bold tracking-widest uppercase text-green-700 hover:text-green-900"
              >
                Write another review
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={20} 
                        fill={s <= rating ? "#FF4D6D" : "none"} 
                        className={s <= rating ? "text-[#FF4D6D]" : "text-zinc-200"}
                      />
                    </button>
                  ))}
                </div>
                {isVerifiedPurchaser && (
                  <span className="ml-auto flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 size={10} /> Verified Purchaser
                  </span>
                )}
              </div>
              
              <div className="relative">
                <Textarea
                  placeholder="Write your professional feedback here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[200px] rounded-3xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-[#FF4D6D]/10 text-sm italic font-light p-6"
                />
                <div className="absolute bottom-4 right-4">
                  <MessageSquare className="w-5 h-5 text-zinc-200" />
                </div>
              </div>

                {/* Image Upload Area */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {selectedImages.map((file, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-100 shadow-sm group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          className="w-full h-full object-cover" 
                          alt="preview" 
                        />
                        <button 
                          type="button"
                          onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 3 && (
                      <label className="w-14 h-14 rounded-xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF4D6D]/30 hover:bg-[#FF4D6D]/5 transition-all text-zinc-400 hover:text-[#FF4D6D] group">
                        <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[6px] font-black uppercase tracking-tighter mt-1">ADD PHOTO</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          multiple 
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setSelectedImages(prev => [...prev, ...files].slice(0, 3));
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest italic">
                    Up to 3 work photos
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || uploadingImages}
                  className="w-full h-14 bg-[#FF4D6D] text-white rounded-full font-bold tracking-[0.3em] text-[10px] uppercase hover:bg-zinc-900 active:scale-[0.98] transition-all duration-500 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (uploadingImages ? "Uploading Photos..." : "Submitting...") : (
                  <span className="flex items-center gap-3">
                    Submit Review <Send size={14} />
                  </span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Reviews List Column */}
        <div className="md:col-span-4 space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Verified Reviews ({reviews.length})</h4>
          </div>
          
          <div className="space-y-10 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
            <AnimatePresence>
              {reviews.length === 0 ? (
                <p className="text-zinc-400 text-xs italic">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((review, idx) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                        {/* Content Area */}
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                {review.userName.split(' ').map((n, i) => i === 0 ? n : n[0] + '***').join(' ')}
                                {review.isVerifiedPurchase && (
                                  <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={8} /> VERIFIED
                                  </span>
                                )}
                              </p>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={10} 
                                    fill={i < review.rating ? "#FF4D6D" : "none"} 
                                    className={i < review.rating ? "text-[#FF4D6D]" : "text-zinc-100"}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Review Images - Placed horizontally between header and time */}
                            {review.imageUrls && review.imageUrls.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 flex-1 justify-center">
                                {review.imageUrls.map((url, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => setActivePhoto(url)}
                                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-50 shadow-sm cursor-zoom-in hover:scale-110 transition-transform duration-300 shrink-0"
                                  >
                                    <img src={url} alt="Artist Result" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}

                            <span className="text-[9px] text-zinc-400 font-medium shrink-0">{formatDistanceToNow(review.createdAt)} ago</span>
                          </div>

                          <p className="text-[11px] text-zinc-500 font-light leading-relaxed italic mt-2">
                            &ldquo;{review.comment}&rdquo;
                          </p>

                          {/* Helpful Button */}
                          <div className="flex items-center gap-4 pt-1">
                            <button 
                              onClick={() => handleHelpful(review.id!)}
                              disabled={helpfulClicked[review.id!]}
                              className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                                helpfulClicked[review.id!] ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-900"
                              }`}
                            >
                              <ThumbsUp size={12} className={helpfulClicked[review.id!] ? "fill-emerald-600" : ""} />
                              Helpful ({ (review.helpfulCount || 0) + (helpfulClicked[review.id!] ? 1 : 0) })
                            </button>
                          </div>

                          {/* Admin Reply */}
                          {review.adminReply && (
                            <div className="mt-4 p-4 bg-zinc-50 rounded-2xl border-l-2 border-[#FF4D6D] space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4D6D]">Response from Elite PMU</span>
                                {review.adminReplyAt && (
                                  <span className="text-[8px] text-zinc-400">{formatDistanceToNow(review.adminReplyAt)} ago</span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                                {review.adminReply}
                              </p>
                            </div>
                          )}
                        </div>
                      <div className="h-px bg-zinc-50 w-full mt-6 mb-6" />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Full Image Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
              <img src={activePhoto} alt="Full view" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
              <button 
                onClick={() => setActivePhoto(null)}
                className="absolute top-0 right-0 p-4 text-white hover:text-[#FF4D6D] transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
