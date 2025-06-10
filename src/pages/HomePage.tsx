import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";
import TipBanner from "@/components/TipBanner";
import { api, Article } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const HomePage = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await api.articles.getAll({ limit: 3 });
        setFeaturedArticles(response.articles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setError("Failed to load articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-navy text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Stay Secure in the Digital World
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Your trusted source for cybersecurity awareness, tips, and best practices.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-cybersec-green hover:bg-cybersec-green/90">
                <Link to="/articles">
                  <BookOpen className="mr-2 h-5 w-5" /> Browse Articles
                </Link>
              </Button>
              {/* <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-navy">
                <Link to="/register">
                  Register Now
                </Link>
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Tip Banner */}
      <TipBanner />

      {/* Featured Articles */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <Link to="/articles" className="text-cybersec-blue hover:underline">
              View all articles
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading articles...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : featuredArticles.length === 0 ? (
            <div className="text-center py-8">No articles found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article._id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription>
                      By {article.author.username} • {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {article.readTime} min read
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `/articles/${article._id}`}
                    >
                      Read More
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Cyber Savvy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-navy text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">1</div>
              <h3 className="text-xl font-semibold mb-2">Expert Knowledge</h3>
              <p className="text-gray-600">Access curated content from cybersecurity experts and professionals.</p>
            </div>
            <div className="text-center">
              <div className="bg-navy text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">2</div>
              <h3 className="text-xl font-semibold mb-2">Practical Tips</h3>
              <p className="text-gray-600">Get actionable advice and best practices for staying secure online.</p>
            </div>
            <div className="text-center">
              <div className="bg-navy text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">3</div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-600">Keep up with the latest cybersecurity trends and threats.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
