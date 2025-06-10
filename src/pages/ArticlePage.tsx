import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";
import { Article } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share2, Edit2, Save, X } from "lucide-react";
import ArticleInteractions from "@/components/ArticleInteractions";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';

const MARKDOWN_TEMPLATE = `# Article Title

## Introduction

Start your article with an engaging introduction.

## Main Section

- Use bullet points for lists
- **Bold** important terms
- *Italicize* for emphasis

### Subsection

1. Numbered lists are easy
2. Just use numbers and periods

> Blockquotes are great for highlighting key points.

## Conclusion

Wrap up your article with a strong conclusion.`;

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!id) return;
        const data = await api.articles.getById(id);
        setArticle(data);
        setEditedContent(data.content);
        if (user) {
          const bookmarked = await api.bookmarks.isBookmarked(id);
          setIsBookmarked(bookmarked);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast({
          title: "Error",
          description: "Failed to load article.",
          variant: "destructive",
        });
        navigate("/articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, user, toast, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(article?.content || "");
  };

  const handleSaveEdit = async () => {
    if (!article || !id) return;

    try {
      const formData = new FormData();
      formData.append("title", article.title);
      formData.append("content", editedContent);
      formData.append("category", article.category);
      formData.append("tags", JSON.stringify(article.tags));
      formData.append("readTime", String(article.readTime));
      if (article.imageUrl) formData.append("imageUrl", article.imageUrl);
      if (article.videoUrl) formData.append("videoUrl", article.videoUrl);

      const updatedArticle = await api.articles.update(id, formData);
      setArticle(updatedArticle.article);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Article updated successfully.",
      });
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Error",
        description: "Failed to update article.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like articles.",
        variant: "destructive",
      });
      return;
    }
    if (!id || typeof id !== 'string' || id.length < 10) {
      toast({
        title: "Invalid article",
        description: "Cannot like an article with an invalid ID.",
        variant: "destructive",
      });
      return;
    }
    try {
      await api.articles.like(id);
      const updatedArticle = await api.articles.getById(id);
      setArticle(updatedArticle);
    } catch (error) {
      console.error("Error liking article:", error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
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
        await api.bookmarks.remove(id!);
      } else {
        await api.bookmarks.add(id!);
      }
      setIsBookmarked(!isBookmarked);
      toast({
        title: "Success",
        description: isBookmarked ? "Article removed from bookmarks." : "Article bookmarked.",
      });
    } catch (error) {
      console.error("Error updating bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article?.title,
        text: article?.content.substring(0, 100) + "...",
        url: window.location.href,
      });
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link has been copied to clipboard.",
      });
    }
  };

  // Helper to insert or wrap markdown
  const applyMarkdown = (syntax: string, multiline = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    let newValue = value;
    let newStart = start;
    let newEnd = end;
    const selected = value.slice(start, end);

    switch (syntax) {
      case 'bold':
        newValue = value.slice(0, start) + `**${selected || 'bold text'}**` + value.slice(end);
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case 'italic':
        newValue = value.slice(0, start) + `*${selected || 'italic text'}*` + value.slice(end);
        newStart = start + 1;
        newEnd = end + 1;
        break;
      case 'heading':
        newValue = value.slice(0, start) + `# ${selected || 'Heading'}` + value.slice(end);
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case 'ul':
        if (multiline && selected) {
          const lines = selected.split('\n').map(line => line ? `- ${line}` : '- ');
          newValue = value.slice(0, start) + lines.join('\n') + value.slice(end);
        } else {
          newValue = value.slice(0, start) + `- ${selected || 'List item'}` + value.slice(end);
        }
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case 'ol':
        if (multiline && selected) {
          const lines = selected.split('\n').map((line, i) => `${i + 1}. ${line || 'List item'}`);
          newValue = value.slice(0, start) + lines.join('\n') + value.slice(end);
        } else {
          newValue = value.slice(0, start) + `1. ${selected || 'List item'}` + value.slice(end);
        }
        newStart = start + 3;
        newEnd = end + 3;
        break;
      case 'blockquote':
        if (multiline && selected) {
          const lines = selected.split('\n').map(line => `> ${line}`);
          newValue = value.slice(0, start) + lines.join('\n') + value.slice(end);
        } else {
          newValue = value.slice(0, start) + `> ${selected || 'Blockquote'}` + value.slice(end);
        }
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case 'code':
        newValue = value.slice(0, start) + `\n\ndef codeBlock():\n    pass\n\n` + value.slice(end);
        newStart = start + 2;
        newEnd = newStart + 9;
        break;
      case 'inlinecode':
        newValue = value.slice(0, start) + '`' + (selected || 'code') + '`' + value.slice(end);
        newStart = start + 1;
        newEnd = end + 1;
        break;
      case 'link':
        newValue = value.slice(0, start) + `[${selected || 'link text'}](url)` + value.slice(end);
        newStart = start + 1;
        newEnd = end + 9;
        break;
      case 'image':
        newValue = value.slice(0, start) + `![${selected || 'alt text'}](image-url)` + value.slice(end);
        newStart = start + 2;
        newEnd = end + 11;
        break;
      case 'paragraph':
        newValue = value.slice(0, start) + `\n\n` + value.slice(end);
        newStart = newEnd = start + 2;
        break;
      default:
        break;
    }
    setEditedContent(newValue);
    setTimeout(() => {
      textarea.setSelectionRange(newStart, newEnd);
      textarea.focus();
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-navy mb-2 sm:mb-4">{article.title}</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-500">By {article.author.username}</span>
              <span className="hidden sm:inline text-sm text-gray-500">•</span>
              <span className="text-xs sm:text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</span>
              <span className="hidden sm:inline text-sm text-gray-500">•</span>
              <span className="text-xs sm:text-sm text-gray-500">{article.readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              {user && (user._id === article.author._id) && (
                <>
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 text-green-600"
                      >
                        <Save size={18} />
                        <span>Save</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 text-red-600"
                      >
                        <X size={18} />
                        <span>Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="flex items-center gap-1"
                    >
                      <Edit2 size={18} />
                      <span>Edit</span>
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-1"
              >
                <Heart
                  size={18}
                  className={article.likes.includes(user?._id || "") ? "fill-current text-red-500" : ""}
                />
                <span>{article.likes.length}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="flex items-center gap-1"
              >
                <Bookmark
                  size={18}
                  className={isBookmarked ? "fill-current text-navy" : ""}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 size={18} />
              </Button>
            </div>
          </div>
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-48 sm:h-96 object-cover rounded-lg mb-6 sm:mb-8"
            />
          )}
        </header>
        {isEditing ? (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Editor */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Bold (Ctrl+B)" aria-label="Bold" onClick={() => applyMarkdown('bold')}><b>B</b></button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Italic (Ctrl+I)" aria-label="Italic" onClick={() => applyMarkdown('italic')}><i>I</i></button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Heading" aria-label="Heading" onClick={() => applyMarkdown('heading')}>H</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Bulleted List" aria-label="Bulleted List" onClick={() => applyMarkdown('ul', true)}>&bull; List</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Numbered List" aria-label="Numbered List" onClick={() => applyMarkdown('ol', true)}>1. List</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Blockquote" aria-label="Blockquote" onClick={() => applyMarkdown('blockquote', true)}>&gt;</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Code Block" aria-label="Code Block" onClick={() => applyMarkdown('code')}>{'{}'}</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Inline Code" aria-label="Inline Code" onClick={() => applyMarkdown('inlinecode')}>{'<>'}</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Link" aria-label="Link" onClick={() => applyMarkdown('link')}>🔗</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Image" aria-label="Image" onClick={() => applyMarkdown('image')}>🖼️</button>
                  <button type="button" className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200" title="Paragraph" aria-label="Paragraph" onClick={() => applyMarkdown('paragraph')}>¶</button>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder={MARKDOWN_TEMPLATE}
                />
                <div className="mt-4 text-sm text-gray-500">
                  <p className="font-semibold mb-1">Markdown Cheat Sheet:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><code># Heading 1</code>, <code>## Heading 2</code>, etc. for headings</li>
                    <li><code>**bold**</code> or <code>__bold__</code> for <strong>bold text</strong></li>
                    <li><code>*italic*</code> or <code>_italic_</code> for <em>italic text</em></li>
                    <li><code>`inline code`</code> for <code>inline code</code></li>
                    <li><code>```\ncode block\n```</code> for code blocks</li>
                    <li><code>[text](url)</code> for <a href="#" className="text-blue-600">links</a></li>
                    <li><code>- item</code> or <code>* item</code> for bullet points</li>
                    <li><code>1. item</code> for numbered lists</li>
                    <li><code>{'>'} quote</code> for blockquotes</li>
                    <li>Leave a blank line between paragraphs</li>
                  </ul>
                </div>
              </div>
              {/* Live Preview */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-auto">
                <div className="prose prose-sm sm:prose-lg max-w-none">
                  <ReactMarkdown>{editedContent || MARKDOWN_TEMPLATE}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm sm:prose-lg max-w-none mb-6 sm:mb-8">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <ArticleInteractions
          article={article}
          onArticleUpdate={async () => {
            const updatedArticle = await api.articles.getById(id!);
            setArticle(updatedArticle);
          }}
        />
      </article>
    </div>
  );
};

export default ArticlePage; 