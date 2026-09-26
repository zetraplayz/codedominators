"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Star, Download, MessageSquare, 
  Send, User as UserIcon, Calendar, Info, FileText, Sparkles, BookOpen, Plus, X, Loader2
} from "lucide-react";
import Link from 'next/link';
import { useSession } from "@/context/session";
import { ClayButton } from "@/components/ui/ClayButton";

interface ResourceDetails {
  id: number;
  title: string;
  description: string;
  visibility: string;
  created_at: string;
  owner_id: string;
  owner_name: string;
  owner_photo: string | null;
  rating: number;
  review_count: number;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  visibility: string;
  created_at: string;
}

interface Review {
  id: number;
  rating: number;
  feedback: string;
  created_at: string;
  reviewer_name: string;
  reviewer_photo: string | null;
}

export default function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const resourceId = resolvedParams.id;
  const router = useRouter();
  const { user } = useSession();

  const [resource, setResource] = useState<ResourceDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newFeedback, setNewFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Kit state
  const [myKits, setMyKits] = useState<{id: number, name: string}[]>([]);
  const [showKitModal, setShowKitModal] = useState(false);
  const [selectedKit, setSelectedKit] = useState('');
  const [addingToKit, setAddingToKit] = useState(false);

  useEffect(() => {
    fetchResourceAndReviews();
  }, [resourceId]);

  const fetchResourceAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resReq, reviewsReq, recReq, kitsReq] = await Promise.all([
        fetch(`/api/resources/${resourceId}`, { credentials: "include" }),
        fetch(`/api/resources/${resourceId}/reviews`, { credentials: "include" }),
        fetch(`/api/resources/${resourceId}/recommendations`, { credentials: "include" }),
        fetch(`/api/kits`, { credentials: "include" })
      ]);
      
      if (!resReq.ok) throw new Error("Failed to load resource details");
      
      const resData = await resReq.json();
      const reviewsData = await reviewsReq.json();
      const recData = await recReq.json();
      const kitsData = await kitsReq.json();
      
      setResource(resData);
      setReviews(reviewsData);
      setRecommendations(recData);
      setMyKits(Array.isArray(kitsData) ? kitsData.filter(k => k.owner_id === user?.id) : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;
    
    try {
      setSubmitting(true);
      const res = await fetch(`/api/resources/${resourceId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating: newRating,
          feedback: newFeedback
        })
      });
      
      if (!res.ok) throw new Error("Failed to submit review");
      
      setNewFeedback("");
      setNewRating(5);
      await fetchResourceAndReviews();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToKit = async () => {
    if (!selectedKit) return;
    setAddingToKit(true);
    try {
      const res = await fetch(`/api/kits/${selectedKit}/resources`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource_id: Number(resourceId) })
      });
      if (res.ok) {
        alert("Added to kit successfully!");
        setShowKitModal(false);
      } else {
        alert("Failed to add to kit");
      }
    } catch {
      alert("Network error");
    } finally {
      setAddingToKit(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-base-text)] opacity-50 animate-spin" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center text-[var(--color-base-text)] opacity-60 hover:opacity-100 font-bold mb-6 transition-all group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="bg-[var(--color-base-yellow)] shadow-clay-pressed rounded-3xl p-6 text-[var(--color-base-text)] font-bold">
          {error || "Resource not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 space-y-8">
      {/* Header section */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-[var(--color-base-text)] opacity-60 hover:opacity-100 font-bold mb-2 transition-all group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
        Back to Resources
      </button>

      {/* Main Resource Info (Claymorphism) */}
      <div className="relative bg-[var(--color-base-mint)] rounded-[2rem] p-8 md:p-10 shadow-clay-card border border-white/20">
        <div className="flex flex-col md:flex-row md:justify-between items-start mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight mb-4">{resource.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-base-text)] font-bold">
              <span className="flex items-center bg-[var(--color-base-bg)] shadow-clay-btn px-3 py-1.5 rounded-full">
                <Info className="w-4 h-4 mr-1.5 opacity-60" />
                {resource.visibility}
              </span>
              <span className="flex items-center bg-[var(--color-base-bg)] shadow-clay-btn px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 mr-1.5 opacity-60" />
                {resource.created_at ? new Date(resource.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <ClayButton onClick={() => setShowKitModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              Add to Kit
            </ClayButton>
            <ClayButton onClick={() => window.open(`/api/resources/${resourceId}/download`, '_blank')} variant="primary" className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Download
            </ClayButton>
          </div>
        </div>

        <p className="text-[var(--color-base-text)] opacity-80 text-lg leading-relaxed mb-8 font-medium bg-[var(--color-base-bg)] p-6 rounded-3xl shadow-clay-pressed">
          {resource.description || "No description provided."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[var(--color-base-text)]/10 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-base-bg)] shadow-clay-btn flex items-center justify-center border border-white/20 overflow-hidden">
              {resource.owner_photo ? (
                <img src={resource.owner_photo} alt={resource.owner_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-[var(--color-base-text)] opacity-40" />
              )}
            </div>
            <div>
              <p className="font-bold text-[var(--color-base-text)] text-lg">{resource.owner_name}</p>
              <p className="text-sm text-[var(--color-base-text)] opacity-50 font-medium">Resource Owner</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[var(--color-base-yellow)] shadow-clay-btn px-5 py-3 rounded-2xl border border-white/20 text-[var(--color-base-text)]">
            <Star className="w-5 h-5 fill-current opacity-80" />
            <span className="font-extrabold text-lg">{resource.rating.toFixed(1)}</span>
            <span className="opacity-60 text-sm font-bold ml-1">({resource.review_count} reviews)</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Review List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--color-base-text)] flex items-center mb-6">
            <MessageSquare className="w-6 h-6 mr-3 opacity-60" />
            Reviews & Comments
          </h2>
          
          {reviews.length === 0 ? (
            <div className="bg-[var(--color-base-mint)] rounded-3xl p-10 text-center shadow-clay-card border border-white/20">
              <div className="bg-[var(--color-base-bg)] w-16 h-16 rounded-full shadow-clay-pressed flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-[var(--color-base-text)] opacity-40" />
              </div>
              <p className="text-[var(--color-base-text)] font-bold opacity-60 text-lg">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-[var(--color-base-mint)] rounded-3xl p-6 shadow-clay-card border border-white/20 transition-transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-base-bg)] shadow-clay-btn flex items-center justify-center overflow-hidden border border-white/10">
                        {r.reviewer_photo ? (
                          <img src={r.reviewer_photo} alt={r.reviewer_name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-[var(--color-base-text)] opacity-40" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-base-text)]">{r.reviewer_name}</p>
                        <p className="text-xs text-[var(--color-base-text)] opacity-50 font-medium">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-[var(--color-base-bg)] px-2 py-1.5 rounded-xl shadow-clay-pressed">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-[var(--color-base-text)] fill-current' : 'text-[var(--color-base-text)] opacity-20'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[var(--color-base-text)] opacity-80 text-sm leading-relaxed font-medium bg-[var(--color-base-bg)] p-4 rounded-2xl shadow-clay-pressed inline-block w-full">{r.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review Form */}
        <div>
          <div className="bg-[var(--color-base-mint)] rounded-3xl p-6 sticky top-8 shadow-clay-card border border-white/20">
            <h3 className="text-xl font-extrabold text-[var(--color-base-text)] mb-6">Write a Review</h3>
            <form onSubmit={handleAddReview} className="space-y-6">
              <div>
                <label className="block text-sm text-[var(--color-base-text)] font-bold mb-3">Rating</label>
                <div className="flex space-x-2 bg-[var(--color-base-bg)] p-3 rounded-2xl shadow-clay-pressed inline-flex">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 p-1"
                    >
                      <Star className={`w-7 h-7 ${star <= newRating ? 'text-[var(--color-base-yellow)] fill-current drop-shadow-md' : 'text-[var(--color-base-text)] opacity-20'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[var(--color-base-text)] font-bold mb-3">Your Feedback</label>
                <textarea
                  required
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  className="w-full bg-[var(--color-base-bg)] border-none outline-none rounded-2xl p-4 text-[var(--color-base-text)] font-medium placeholder:text-[var(--color-base-text)] placeholder:opacity-30 focus:ring-2 focus:ring-[var(--color-base-text)]/20 transition-all shadow-clay-pressed h-32 resize-none"
                  placeholder="What did you think of this resource?"
                />
              </div>
              
              <ClayButton
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Review</span>
                  </>
                )}
              </ClayButton>
            </form>
          </div>
        </div>

      </div>

      {/* Intelligent Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-[var(--color-base-text)] mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-3 opacity-60" />
            Similar Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <Link key={rec.id} href={`/dashboard/resources/${rec.id}`} className="block group h-full">
                <div className="bg-[var(--color-base-mint)] p-6 rounded-3xl border border-white/20 shadow-clay-card transition-all group-hover:shadow-clay-pressed h-full flex flex-col gap-4">
                  <div className="p-3 w-12 h-12 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-btn text-[var(--color-base-text)] mb-2 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-[var(--color-base-text)] text-lg leading-tight line-clamp-2">
                    {rec.title}
                  </h3>
                  {rec.description && (
                    <p className="text-[var(--color-base-text)] opacity-60 font-medium text-sm line-clamp-2 flex-1">{rec.description}</p>
                  )}
                  <p className="text-[var(--color-base-text)] opacity-40 font-bold text-xs mt-auto pt-2 border-t border-[var(--color-base-text)]/10">
                    {rec.created_at ? new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Add to Kit Modal */}
      {showKitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-8 rounded-[2rem] bg-[var(--color-base-bg)] shadow-clay-card flex flex-col relative border border-white/40">
            <button
              onClick={() => setShowKitModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[var(--color-base-text)] flex items-center">
                <BookOpen className="w-6 h-6 mr-3 opacity-60" />
                Add to Kit
              </h2>
              <p className="text-[var(--color-base-text)] opacity-60 font-medium text-sm mt-2">Select a teaching kit to add this resource to.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              {myKits.length === 0 ? (
                <div className="p-6 bg-[var(--color-base-mint)] shadow-clay-pressed rounded-2xl text-center text-[var(--color-base-text)] text-sm font-bold">
                  <p className="opacity-60 mb-2">You don't have any teaching kits yet.</p>
                  <Link href="/dashboard/kits" className="inline-block mt-2 opacity-100 hover:underline">
                    Create one first
                  </Link>
                </div>
              ) : (
                <>
                  <select
                    value={selectedKit}
                    onChange={(e) => setSelectedKit(e.target.value)}
                    className="w-full p-4 rounded-2xl border-none outline-none bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] font-bold focus:ring-2 focus:ring-[var(--color-base-text)]/20 cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select a kit...</option>
                    {myKits.map(kit => (
                      <option key={kit.id} value={kit.id}>{kit.name}</option>
                    ))}
                  </select>
                  <ClayButton 
                    onClick={handleAddToKit}
                    disabled={addingToKit || !selectedKit}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {addingToKit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {addingToKit ? 'Adding...' : 'Add Resource'}
                  </ClayButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

