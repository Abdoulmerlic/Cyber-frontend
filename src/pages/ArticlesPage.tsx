import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api, Article } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import ArticleCard from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "cybersecurity",
    tags: "",
    readTime: 3,
    media: undefined as File | undefined,
  });

  const category = searchParams.get("category") || "all";
  const tag = searchParams.get("tag") || "all";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await api.articles.getAll({
          category: category === "all" ? undefined : category,
          tag: tag === "all" ? undefined : tag,
          search,
          page,
          limit,
        });
        if (Array.isArray(response)) {
          setArticles(response);
        } else if (response && Array.isArray(response.articles)) {
          setArticles(response.articles);
        } else {
          setArticles([]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load articles.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [category, tag, search, page, limit, toast]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;
    setSearchParams({ search: searchQuery });
  };

  const handleCategoryChange = (value: string) => {
    setSearchParams({ ...Object.fromEntries(searchParams), category: value });
  };

  const handleTagChange = (value: string) => {
    setSearchParams({ ...Object.fromEntries(searchParams), tag: value });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, media: e.target.files![0] }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("tags", JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean)));
      formData.append("readTime", String(form.readTime));
      if (form.media) formData.append("media", form.media);
      await api.articles.create(formData);
      toast({ title: "Article created!", description: "Your article has been published." });
      setShowCreateModal(false);
      setForm({ title: "", content: "", category: "cybersecurity", tags: "", readTime: 3, media: undefined });
      // Refresh articles
      const response = await api.articles.getAll({
        category: category === "all" ? undefined : category,
        tag: tag === "all" ? undefined : tag,
        search,
        page,
        limit,
      });
      if (Array.isArray(response)) {
        setArticles(response);
      } else if (response && Array.isArray(response.articles)) {
        setArticles(response.articles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create article.", variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-4 md:mb-0">Articles</h1>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto">Create Article</Button>
        )}
      </div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                name="search"
                placeholder="Search articles..."
                defaultValue={search}
                className="pl-10"
              />
            </div>
          </form>
          <div className="flex gap-4">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="ethical-hacking">Ethical Hacking</SelectItem>
                <SelectItem value="network-security">Network Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tag} onValueChange={handleTagChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="news">News</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No articles found</h2>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              onBookmarkChange={() => {
                // Refresh articles when bookmark status changes
                const fetchArticles = async () => {
                  const response = await api.articles.getAll({
                    category: category === "all" ? undefined : category,
                    tag: tag === "all" ? undefined : tag,
                    search,
                    page,
                    limit,
                  });
                  if (Array.isArray(response)) {
                    setArticles(response);
                  } else if (response && Array.isArray(response.articles)) {
                    setArticles(response.articles);
                  } else {
                    setArticles([]);
                  }
                };
                fetchArticles();
              }}
            />
          ))}
        </div>
      )}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleFormChange} required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" value={form.content} onChange={handleFormChange} required minLength={50} rows={5} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="category">Category</Label>
                <select id="category" name="category" value={form.category} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="privacy">Privacy</option>
                  <option value="ethical-hacking">Ethical Hacking</option>
                  <option value="network-security">Network Security</option>
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" value={form.tags} onChange={handleFormChange} placeholder="e.g. beginner, tutorial" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="readTime">Read Time (min)</Label>
                <Input id="readTime" name="readTime" type="number" min={1} value={form.readTime} onChange={handleFormChange} required />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="media">Image/Video (optional)</Label>
                <Input id="media" name="media" type="file" accept="image/*,video/*" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={createLoading}>{createLoading ? "Publishing..." : "Publish Article"}</Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 