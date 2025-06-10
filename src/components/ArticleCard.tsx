import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Bookmark } from "lucide-react";
import { Article } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";
import { useState, useEffect } from "react";

interface ArticleCardProps {
  article: Article;
  onBookmarkChange?: () => void;
}

const ArticleCard = ({ article, onBookmarkChange }: ArticleCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      if (user && article._id) {
        const bookmarked = await api.bookmarks.isBookmarked(article._id);
        setIsBookmarked(bookmarked);
      }
    };
    checkBookmark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, article._id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      await api.articles.like(article._id);
      // Refresh the article data
      onBookmarkChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to bookmark articles.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (isBookmarked) {
        await api.bookmarks.remove(article._id);
        setIsBookmarked(false);
        toast({ title: "Removed from bookmarks." });
      } else {
        await api.bookmarks.add(article._id);
        setIsBookmarked(true);
        toast({ title: "Bookmarked!" });
      }
      onBookmarkChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark.",
        variant: "destructive",
      });
    }
  };

  const likes = Array.isArray(article.likes) ? article.likes : [];

  return (
    <Link to={`/articles/${article._id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
        {article.imageUrl && (
          <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-48 xl:h-56">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-navy font-medium">{article.category}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-gray-500">
                <Eye size={16} />
                <span className="text-xs sm:text-sm">{article.views}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Heart
                  size={16}
                  className={likes.includes(user?._id || "") ? "fill-current text-red-500" : ""}
                />
                <span className="text-xs sm:text-sm">{likes.length}</span>
              </div>
            </div>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold mt-2 line-clamp-2">{article.title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 line-clamp-3 text-sm sm:text-base">{article.content}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span>{article.readTime} min read</span>
            <span>•</span>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="p-2"
            >
              <Heart
                size={18}
                className={likes.includes(user?._id || "") ? "fill-current text-red-500" : ""}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleBookmark}
            >
              <Bookmark size={18} className={isBookmarked ? "fill-current text-navy" : ""} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ArticleCard;
