
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Book, gutendexService } from "@/services/gutendexService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { BookOpen, ChevronLeft, Heart, BookText, Play, Pause } from "lucide-react";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { speechService } from "@/services/speechService";

const BookDetails = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useUserSettings();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get book ID from URL query parameter
  const params = new URLSearchParams(location.search);
  const bookId = Number(params.get("id"));

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) {
        setError("No book ID provided");
        setLoading(false);
        return;
      }
      
      try {
        const bookData = await gutendexService.getBookById(bookId);
        setBook(bookData);
        
        // Check if book is in liked books
        try {
          const likedBooks = JSON.parse(localStorage.getItem("likedBooks") || "[]");
          setIsLiked(likedBooks.some((b: Book) => b.id === bookId));
        } catch (err) {
          console.error("Failed to check liked status:", err);
        }
      } catch (err) {
        console.error("Failed to fetch book:", err);
        setError("Failed to load book details.");
        toast.error("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const fetchTextContent = async () => {
    if (!book) return;
    
    setLoadingText(true);
    
    try {
      // Try to find a text format to display
      const textUrl = 
        book.formats["text/plain"] || 
        book.formats["text/plain; charset=us-ascii"] ||
        book.formats["text/plain; charset=utf-8"];
      
      if (!textUrl) {
        toast.error("No readable text format available for this book");
        setLoadingText(false);
        return;
      }
      
      const content = await gutendexService.getTextContent(textUrl);
      setTextContent(content);
    } catch (err) {
      console.error("Failed to fetch text content:", err);
      toast.error("Failed to load book content");
      setTextContent("");
    } finally {
      setLoadingText(false);
    }
  };

  const handlePlayPause = () => {
    if (speaking) {
      speechService.stop();
      setSpeaking(false);
    } else {
      if (!textContent) {
        toast.error("No text content to read");
        return;
      }
      
      const chunks = textContent
        .split(/(?<=\.|\!|\?)\s+/)
        .filter(chunk => chunk.trim().length > 0)
        .slice(0, 100); // Limit to first 100 sentences to prevent overload
      
      // Use the updated speechService that handles VoiceOption
      speechService.speak(chunks.join(' '), settings.preferredVoice);
      setSpeaking(true);
      
      // Set up end callback
      speechService.onEnd(() => {
        setSpeaking(false);
      });
    }
  };
  
  const toggleLiked = () => {
    if (!book) return;
    
    try {
      const likedBooks = JSON.parse(localStorage.getItem("likedBooks") || "[]");
      
      if (isLiked) {
        // Remove from liked books
        const updatedLikedBooks = likedBooks.filter((b: Book) => b.id !== bookId);
        localStorage.setItem("likedBooks", JSON.stringify(updatedLikedBooks));
        setIsLiked(false);
        toast.success("Book removed from favorites");
      } else {
        // Add to liked books
        likedBooks.push(book);
        localStorage.setItem("likedBooks", JSON.stringify(likedBooks));
        setIsLiked(true);
        toast.success("Book added to favorites");
      }
    } catch (err) {
      console.error("Failed to update liked books:", err);
      toast.error("Failed to update favorites");
    }
  };

  useEffect(() => {
    // Clean up speech on unmount
    return () => {
      speechService.stop();
    };
  }, []);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <BookOpen className="h-16 w-16 mx-auto text-primary/50" />
            <p className="mt-4 text-lg">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="w-full h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-red-400">Error</h2>
          <p className="my-4">{error || "Book not found"}</p>
          <Button onClick={() => navigate("/books")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Button>
        </div>
      </div>
    );
  }

  // Get cover image if available
  const coverImage = book.formats["image/jpeg"] || 
                    book.formats["image/png"] || 
                    book.formats["image/jpg"] || 
                    "/placeholder.svg";

  // Format author names
  const authorNames = book.authors.map(author => {
    let name = author.name;
    if (author.birth_year || author.death_year) {
      name += ' (';
      if (author.birth_year) name += author.birth_year;
      name += ' - ';
      if (author.death_year) name += author.death_year;
      name += ')';
    }
    return name;
  }).join(", ");

  return (
    <div className="container max-w-4xl mx-auto px-4 py-5 pb-28">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleLiked}
            className="rounded-full"
          >
            <Heart 
              className={`h-5 w-5 ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
            />
          </Button>
          
          {textContent && (
            <Button 
              variant="secondary"
              size="sm"
              onClick={handlePlayPause}
            >
              {speaking ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Reading
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Read Aloud
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="glass-card overflow-hidden">
            <div className="aspect-[2/3] overflow-hidden">
              <img 
                src={coverImage} 
                alt={`Cover for ${book.title}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-1 gradient-text">{book.title}</h2>
                  <p className="text-sm opacity-80">{authorNames || "Unknown Author"}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {book.languages.map((lang, i) => (
                    <Badge key={i} variant="secondary">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                
                <div>
                  <p className="text-sm mb-1">Downloads: {book.download_count.toLocaleString()}</p>
                  {book.download_count > 1000 && (
                    <p className="text-xs text-muted-foreground">Popular book!</p>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={fetchTextContent}
                  disabled={loadingText}
                >
                  <BookText className="mr-2 h-4 w-4" />
                  Read Book
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="glass-card h-full">
            <CardContent className="p-4">
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="read">Read Book</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-6">
                  {book.subjects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.subjects.slice(0, 15).map((subject, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {book.subjects.length > 15 && (
                          <span className="text-xs text-muted-foreground">
                            +{book.subjects.length - 15} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {book.bookshelves.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Bookshelves</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.bookshelves.map((shelf, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {shelf}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Available Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(book.formats).map((format) => {
                        const shortFormat = format.split(';')[0].split('/')[1];
                        return (
                          <Badge key={format} variant="outline" className="text-xs">
                            {shortFormat}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  {book.translators.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Translators</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.translators.map((translator, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {translator.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="read">
                  {!textContent && !loadingText && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookText className="h-16 w-16 text-muted-foreground" />
                      <h3 className="mt-4 text-xl font-semibold">Read Book Content</h3>
                      <p className="text-muted-foreground text-center my-2">
                        Load the book content to read it directly in the app
                      </p>
                      <Button 
                        onClick={fetchTextContent}
                        className="mt-4"
                      >
                        Load Book Content
                      </Button>
                    </div>
                  )}
                  
                  {loadingText && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-pulse text-center">
                        <BookOpen className="h-16 w-16 mx-auto text-primary/50" />
                        <p className="mt-4 text-lg">Loading book content...</p>
                      </div>
                    </div>
                  )}
                  
                  {textContent && (
                    <div 
                      ref={contentRef}
                      className="prose prose-invert max-w-none whitespace-pre-wrap"
                      style={{ 
                        fontSize: '0.95rem', 
                        lineHeight: '1.7',
                        maxHeight: '70vh',
                        overflowY: 'auto'
                      }}
                    >
                      {textContent}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
