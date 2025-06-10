import { useEffect, useState } from 'react';
import { articles, Article, ArticleResponse } from '@/services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function ArticleList() {
  const [articleData, setArticleData] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articles.getAll();
        setArticleData(data);
      } catch (err) {
        setError('Failed to load articles');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading articles...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!articleData?.articles.length) {
    return <div className="text-center py-8">No articles found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articleData.articles.map((article) => (
        <Card key={article.id} className="flex flex-col">
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
              onClick={() => navigate(`/articles/${article.id}`)}
            >
              Read More
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 