import { useState, useEffect } from "react";
import { api, Article } from "@/services/api";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      const data = await api.bookmarks.getAll();
      setBookmarks(data);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Bookmarked Articles</h2>
          <Button onClick={fetchBookmarks}>
            <RefreshCw size={16} className="mr-2" /> Refresh
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full"></div>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(article => (
              <ArticleCard 
                key={article._id} 
                article={article}
                onBookmarkChange={fetchBookmarks}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">You haven't bookmarked any articles yet.</p>
            <Button asChild>
              <Link to="/articles">Browse Articles</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookmarksPage; 