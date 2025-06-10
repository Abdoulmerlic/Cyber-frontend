import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { Article } from "@/services/api";

interface ArticleInteractionsProps {
  article: Article;
  onArticleUpdate: (updatedArticle: Article) => void;
}

const ArticleInteractions = ({ article, onArticleUpdate }: ArticleInteractionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like articles.",
        variant: "destructive",
      });
      return;
    }
    if (!article._id || typeof article._id !== 'string' || article._id.length < 10) {
      toast({
        title: "Invalid article",
        description: "Cannot like an article with an invalid ID.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await api.articles.like(article._id);
      onArticleUpdate({
        ...article,
        likes: response.likes,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }
    if (!article._id || typeof article._id !== 'string' || article._id.length < 10) {
      toast({
        title: "Invalid article",
        description: "Cannot comment on an article with an invalid ID.",
        variant: "destructive",
      });
      return;
    }
    if (!comment.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.articles.addComment(article._id, { content: comment });
      onArticleUpdate({
        ...article,
        comments: [...article.comments, response.comment],
      });
      setComment("");
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.articles.deleteComment(article._id, commentId);
      onArticleUpdate({
        ...article,
        comments: article.comments.filter(c => c.user._id !== commentId),
      });
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-2 ${
            article.likes.includes(user?._id || "") ? "text-red-500" : ""
          }`}
        >
          <Heart
            size={20}
            className={article.likes.includes(user?._id || "") ? "fill-current" : ""}
          />
          <span>{article.likes.length}</span>
        </Button>
        <div className="flex items-center gap-2 text-gray-500">
          <Eye size={20} />
          <span>{article.views}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments ({article.comments.length})</h3>
        
        {user && (
          <form onSubmit={handleComment} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {article.comments.map((comment) => (
            <div key={comment.user._id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user?._id === comment.user._id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.user._id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleInteractions; 