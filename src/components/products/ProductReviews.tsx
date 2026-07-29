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
    : "0.0";

  const avgNum = Number(averageRating);

  return (
    <section className="w-full space-y-10" aria-labelledby="reviews-heading">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-zinc-100 pb-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold">
            Community
          </p>
          <h3 id="reviews-heading" className="text-2xl md:text-3xl font-heading text-zinc-900">
            Customer Reviews
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-light text-zinc-900 tabular-nums">{averageRating}</span>
          <div className="space-y-1">
            <div className="flex gap-0.5" aria-label={`${averageRating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(avgNum) ? "currentColor" : "none"}
                  className={i < Math.round(avgNum) ? "text-brand-gold" : "text-zinc-200"}
                />
              ))}
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary + form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Rating breakdown */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-5 md:p-6 space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Rating breakdown
            </h4>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-10 shrink-0">
                      <span className="text-[11px] font-semibold text-zinc-700 tabular-nums">{star}</span>
                      <Star size={10} fill="currentColor" className="text-brand-gold" />
                    </div>
                    <div className="flex-1 h-2 bg-white border border-zinc-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-brand-gold rounded-full"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400 w-5 text-right tabular-nums">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-100 pt-4">
              Reviews are moderated to keep feedback professional and useful for fellow artists.
            </p>
          </div>
        </div>

        {/* Write review card */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 md:p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                Write a review
              </h4>
              {user && isVerifiedPurchaser && (
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 size={11} /> Verified purchaser
                </span>
              )}
            </div>

            {!user ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-5 py-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-zinc-100">
                  <AlertCircle className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">Sign in to leave a review</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Share your experience with this product after signing in.
                  </p>
                </div>
                <Link href="/login" className="shrink-0">
                  <Button
                    variant="outline"
                    className="rounded-full h-10 px-6 text-[10px] font-bold tracking-widest uppercase border-zinc-200"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 px-5 py-6"
              >
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <h5 className="text-sm font-bold">Review submitted</h5>
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed max-w-md">
                  Thank you — your feedback is with our team for moderation and will appear once approved.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setIsSuccess(false)}
                  className="h-9 px-0 text-[10px] font-bold tracking-widest uppercase text-emerald-800 hover:bg-transparent hover:text-emerald-950"
                >
                  Write another review
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Your rating
                  </span>
                  <div className="flex gap-1" role="group" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-0.5 transition-transform active:scale-90"
                        aria-label={`${s} star${s > 1 ? "s" : ""}`}
                        aria-pressed={s <= rating}
                      >
                        <Star
                          size={22}
                          fill={s <= rating ? "currentColor" : "none"}
                          className={s <= rating ? "text-brand-gold" : "text-zinc-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="What did you like? How did it perform in your work?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus-visible:ring-brand-gold/20 text-sm font-light leading-relaxed p-4 resize-y"
                />

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedImages.map((file, i) => (
                        <div
                          key={i}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImages((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            aria-label="Remove photo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {selectedImages.length < 3 && (
                        <label className="w-14 h-14 rounded-lg border border-dashed border-zinc-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-gold hover:bg-brand-rose/20 transition-colors text-zinc-400 hover:text-brand-gold">
                          <ImageIcon size={16} />
                          <span className="text-[8px] font-bold uppercase tracking-wide mt-0.5">
                            Photo
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setSelectedImages((prev) => [...prev, ...files].slice(0, 3));
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400">Optional — up to 3 work photos</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImages}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-black px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-gold disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isSubmitting ? (
                      uploadingImages ? "Uploading…" : "Submitting…"
                    ) : (
                      <>
                        Submit review <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            All reviews ({reviews.length})
          </h4>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-100 text-zinc-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-zinc-800">No reviews yet</p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first artist to share how this product performed in your practice.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reviews
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((review, idx) => (
                  <motion.article
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                    className="rounded-2xl border border-zinc-100 bg-white p-5 md:p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                            {review.userName
                              .split(" ")
                              .map((n, i) => (i === 0 ? n : n[0] + "***"))
                              .join(" ")}
                          </p>
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <CheckCircle2 size={9} /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < review.rating ? "currentColor" : "none"}
                              className={i < review.rating ? "text-brand-gold" : "text-zinc-200"}
                            />
                          ))}
                        </div>
                      </div>
                      <time className="text-[10px] text-zinc-400 shrink-0">
                        {formatDistanceToNow(review.createdAt)} ago
                      </time>
                    </div>

                    <p className="mt-3 text-sm text-zinc-600 font-light leading-relaxed">
                      {review.comment}
                    </p>

                    {review.imageUrls && review.imageUrls.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {review.imageUrls.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActivePhoto(url)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-100 shadow-sm hover:ring-2 hover:ring-brand-gold/40 transition"
                          >
                            <img src={url} alt="Review photo" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleHelpful(review.id!)}
                        disabled={helpfulClicked[review.id!]}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          helpfulClicked[review.id!]
                            ? "text-emerald-600"
                            : "text-zinc-400 hover:text-zinc-800"
                        }`}
                      >
                        <ThumbsUp
                          size={12}
                          className={helpfulClicked[review.id!] ? "fill-emerald-600" : ""}
                        />
                        Helpful (
                        {(review.helpfulCount || 0) + (helpfulClicked[review.id!] ? 1 : 0)})
                      </button>
                    </div>

                    {review.adminReply && (
                      <div className="mt-4 rounded-xl bg-zinc-50 border-l-2 border-brand-gold px-4 py-3 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">
                            Response from PMU Supply
                          </span>
                          {review.adminReplyAt && (
                            <span className="text-[9px] text-zinc-400">
                              {formatDistanceToNow(review.adminReplyAt)} ago
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">{review.adminReply}</p>
                      </div>
                    )}
                  </motion.article>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Full image modal */}
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
              <img
                src={activePhoto}
                alt="Full view"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="absolute top-0 right-0 p-4 text-white hover:text-brand-gold transition-colors"
                aria-label="Close photo"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
