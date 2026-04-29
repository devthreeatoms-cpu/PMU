"use client";

import { useState, useEffect } from "react";
import { 
  Check, X, Trash2, Star, User, Package, 
  MessageSquare, Plus, Loader2, Filter,
  ExternalLink, CheckCircle2, XCircle, Clock, Reply, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Review, Product } from "@/lib/types";
import { toast } from "sonner";
import { 
  updateReviewStatusAction, 
  deleteReviewAction, 
  createManualReviewAction,
  getAllReviewsAction,
  replyToReviewAction
} from "./review-actions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { getProductsAction } from "../products/actions";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<Review["status"] | "all">("all");

  // Manual Review Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [manualUserName, setManualUserName] = useState("");
  const [manualRating, setManualRating] = useState(5);
  const [manualComment, setManualComment] = useState("");

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const fetchReviews = async () => {
    const reviewResult = await getAllReviewsAction();
    if (reviewResult.success) {
      setReviews(reviewResult.reviews as Review[]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const prodResult = await getProductsAction();
        if (prodResult.success) setProducts(prodResult.products as Product[]);
        await fetchReviews();
        setIsLoading(false);
      } catch (err: any) {
        toast.error("Failed to fetch reviews.");
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    
    setIsReplying(true);
    const result = await replyToReviewAction(selectedReview, replyText.trim());
    if (result.success) {
      toast.success("Reply posted successfully!");
      setReplyText("");
      setSelectedReview(null);
      setIsReplyDialogOpen(false);
      fetchReviews();
    } else {
      toast.error(result.error || "Failed to post reply");
    }
    setIsReplying(false);
  };

  const handleStatusUpdate = async (id: string, status: Review["status"]) => {
    setIsActionLoading(id);
    try {
      const result = await updateReviewStatusAction(id, status);
      if (result.success) {
        toast.success(`Review ${status}`);
        await fetchReviews();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update review.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsActionLoading(id);
    try {
      const result = await deleteReviewAction(id);
      if (result.success) {
        toast.success("Review deleted.");
        await fetchReviews();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleAddManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !manualUserName || !manualComment) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    
    setIsActionLoading("manual");
    try {
      const result = await createManualReviewAction({
        productId: selectedProductId,
        productName: product?.name || "Unknown Product",
        userName: manualUserName,
        rating: manualRating,
        comment: manualComment,
        userEmail: "admin@pmu.com",
        userId: "admin",
      });

      if (result.success) {
        toast.success("Manual review added!");
        setIsDialogOpen(false);
        setManualComment("");
        setManualUserName("");
        setSelectedProductId("");
        await fetchReviews();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add review.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(r => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-heading font-normal tracking-tight text-zinc-900">Artist Feedback</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Review Moderation Console</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            {(["all", "pending", "approved", "declined"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === s 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="bg-[#FF4D6D] hover:opacity-90 text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 h-10 inline-flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 mr-2" /> Add Manual Review
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-heading italic">Add Manual Review</DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Create a professional review that will be automatically approved.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddManualReview} className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Target Product</label>
                  <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50 text-sm focus:ring-2 focus:ring-[#FF4D6D]/10 outline-none"
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Reviewer Name</label>
                  <Input 
                    placeholder="e.g. Sarah J. (Master Artist)" 
                    value={manualUserName}
                    onChange={(e) => setManualUserName(e.target.value)}
                    className="h-12 rounded-xl border-zinc-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => setManualRating(s)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={24} 
                          fill={s <= manualRating ? "#FF4D6D" : "none"} 
                          className={s <= manualRating ? "text-[#FF4D6D]" : "text-zinc-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Professional Feedback</label>
                  <Textarea 
                    placeholder="Enter the artist's comment..." 
                    value={manualComment}
                    onChange={(e) => setManualComment(e.target.value)}
                    className="min-h-[100px] rounded-xl border-zinc-100 italic font-light"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isActionLoading === "manual"}
                  className="w-full h-12 bg-zinc-900 text-white rounded-xl font-bold tracking-widest text-[10px] uppercase hover:bg-[#FF4D6D] transition-all"
                >
                  {isActionLoading === "manual" ? "Posting..." : "Post Official Review"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-[2rem] bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-100 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Reviewer</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Product</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Comment</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Rating</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-200" />
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-4">Analyzing Feedback...</p>
                </TableCell>
              </TableRow>
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24 text-zinc-400 italic text-xs">
                  No feedback found for the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id} className="border-zinc-50 group hover:bg-zinc-50/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-900 uppercase tracking-tighter">{review.userName}</span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">{review.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-700 font-medium truncate max-w-[150px]">{review.productName}</span>
                      <Link href={`/products/${review.productId}`} target="_blank" className="text-[9px] text-zinc-400 hover:text-[#FF4D6D] flex items-center gap-1 uppercase font-bold">
                        View <ExternalLink size={8} />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[11px] text-zinc-500 italic font-light line-clamp-2" title={review.comment}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex flex-col gap-1 shrink-0 mt-1">
                          {review.imageUrls.map((url, i) => (
                            <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-100 shadow-sm">
                              <img src={url} alt="Review" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={10} 
                          fill={i < review.rating ? "#FF4D6D" : "none"} 
                          className={i < review.rating ? "text-[#FF4D6D]" : "text-zinc-200"}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full text-[8px] uppercase tracking-widest font-black px-3 ${
                      review.status === "approved" ? "border-green-100 text-green-600 bg-green-50" :
                      review.status === "declined" ? "border-red-100 text-red-600 bg-red-50" :
                      "border-orange-100 text-orange-600 bg-orange-50"
                    }`}>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {review.status !== "approved" && (
                        <Button 
                          variant="ghost" size="icon"
                          onClick={() => handleStatusUpdate(review.id!, "approved")}
                          disabled={isActionLoading === review.id}
                          className="h-8 w-8 rounded-full text-zinc-400 hover:text-green-600 hover:bg-green-50"
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      {review.status !== "declined" && (
                        <Button 
                          variant="ghost" size="icon"
                          onClick={() => handleStatusUpdate(review.id!, "declined")}
                          disabled={isActionLoading === review.id}
                          className="h-8 w-8 rounded-full text-zinc-400 hover:text-orange-600 hover:bg-orange-50"
                        >
                          <X size={14} />
                        </Button>
                      )}
                      <Dialog open={isReplyDialogOpen && selectedReview === review.id} onOpenChange={(open) => {
                        setIsReplyDialogOpen(open);
                        if (!open) setSelectedReview(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" size="icon"
                            onClick={() => {
                              setSelectedReview(review.id!);
                              setReplyText(review.adminReply || "");
                              setIsReplyDialogOpen(true);
                            }}
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Reply size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reply to {review.userName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <p className="text-xs text-zinc-500 italic bg-zinc-50 p-3 rounded-lg">"{review.comment}"</p>
                            <Textarea 
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write response..."
                            />
                          </div>
                          <DialogFooter className="pt-4 border-t border-zinc-100">
                            <Button 
                              onClick={handleReply} 
                              disabled={isReplying}
                              className="w-full h-12 bg-[#FF4D6D] hover:opacity-90 text-white rounded-xl font-bold tracking-[0.2em] text-[10px] uppercase shadow-lg shadow-pink-500/10"
                            >
                              {isReplying ? "Posting..." : <span className="flex items-center gap-2">Send Official Reply <Send size={12} /></span>}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" size="icon"
                        onClick={() => handleDelete(review.id!)}
                        disabled={isActionLoading === review.id}
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
