import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Article } from "@/services/api";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 bg-navy text-white rounded-full flex items-center justify-center mr-4">
            <UserCircle size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        <Button onClick={fetchBookmarks}>
          <RefreshCw size={16} className="mr-2" /> Refresh
        </Button>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>
        
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

export default ProfilePage;
