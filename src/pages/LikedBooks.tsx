
import { useState, useEffect } from "react";
import { Book } from "@/services/gutendexService";
import { Poem } from "@/services/poetryService";
import { useNavigate } from "react-router-dom";
import BookCard from "@/components/BookCard";
import PoemCard from "@/components/PoemCard";
import { Heart, Trash2, Search, Volume2, BookOpen, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { speechService } from "@/services/speechService";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const LikedBooks = () => {
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [likedPoems, setLikedPoems] = useState<Poem[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("books");
  const [speakingPoemId, setSpeakingPoemId] = useState<string | null>(null);
  const { settings } = useUserSettings();
  const navigate = useNavigate();

  useEffect(() => {
    loadLikedBooks();
    loadLikedPoems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, likedBooks, likedPoems]);

  const loadLikedBooks = () => {
    try {
      const booksFromStorage = localStorage.getItem('likedBooks');
      if (booksFromStorage) {
        const books = JSON.parse(booksFromStorage);
        setLikedBooks(books);
        setFilteredBooks(books);
      }
    } catch (error) {
      console.error("Error loading liked books:", error);
      toast.error("Failed to load your favorite books");
    }
  };

  const loadLikedPoems = () => {
    try {
      const poemsFromStorage = localStorage.getItem('likedPoems');
      if (poemsFromStorage) {
        const poems = JSON.parse(poemsFromStorage);
        setLikedPoems(poems);
        setFilteredPoems(poems);
      }
    } catch (error) {
      console.error("Error loading liked poems:", error);
      toast.error("Failed to load your favorite poems");
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(likedBooks);
      setFilteredPoems(likedPoems);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    const matchedBooks = likedBooks.filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.authors.some(author => author.name.toLowerCase().includes(query))
    );
    setFilteredBooks(matchedBooks);
    
    const matchedPoems = likedPoems.filter(poem => 
      poem.title.toLowerCase().includes(query) || 
      poem.author.toLowerCase().includes(query) ||
      poem.lines.some(line => line.toLowerCase().includes(query))
    );
    setFilteredPoems(matchedPoems);
  };

  const handleRemoveBook = (bookId: number) => {
    try {
      const updatedBooks = likedBooks.filter(book => book.id !== bookId);
      localStorage.setItem('likedBooks', JSON.stringify(updatedBooks));
      setLikedBooks(updatedBooks);
      toast.success("Book removed from favorites");
    } catch (error) {
      console.error("Error removing book:", error);
      toast.error("Failed to remove book");
    }
  };

  const handleRemovePoem = (poem: Poem) => {
    try {
      const updatedPoems = likedPoems.filter(p => 
        !(p.title === poem.title && p.author === poem.author)
      );
      localStorage.setItem('likedPoems', JSON.stringify(updatedPoems));
      setLikedPoems(updatedPoems);
      toast.success("Poem removed from favorites");
    } catch (error) {
      console.error("Error removing poem:", error);
      toast.error("Failed to remove poem");
    }
  };

  const handleClearAll = () => {
    try {
      if (activeTab === "books") {
        localStorage.setItem('likedBooks', JSON.stringify([]));
        setLikedBooks([]);
        setFilteredBooks([]);
      } else {
        localStorage.setItem('likedPoems', JSON.stringify([]));
        setLikedPoems([]);
        setFilteredPoems([]);
        speechService.stop();
        setSpeakingPoemId(null);
      }
      setShowClearConfirm(false);
      toast.success(`All favorite ${activeTab} cleared`);
    } catch (error) {
      console.error("Error clearing items:", error);
      toast.error("Failed to clear items");
    }
  };

  const handleViewBook = (bookId: number) => {
    navigate(`/book-details?id=${bookId}`);
  };

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  const getUniqueId = (poem: Poem, index: number) => {
    return `${poem.title}-${poem.author}-${index}`;
  };

  const readPoem = (poem: Poem, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const title = `${poem.title} by ${poem.author}.`;
    const poemLines = poem.lines.join(". ");
    const poemText = `${title} ${poemLines}`;
    
    let voice = null;
    if (settings.preferredVoice) {
      voice = window.speechSynthesis.getVoices().find(
        v => v.voiceURI === settings.preferredVoice?.id
      ) || null;
    }
    
    speechService.stop();
    const poemId = getUniqueId(poem, index);
    setSpeakingPoemId(poemId);
    speechService.speak(poemText, voice);
    toast.success("Reading poem aloud", {
      description: "Using " + (settings.preferredVoice?.name || "default voice")
    });
    
    const checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeakingPoemId(null);
        clearInterval(checkInterval);
      }
    }, 100);
  };

  const stopReading = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.stop();
    setSpeakingPoemId(null);
    toast.success("Stopped reading");
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-5 pb-28">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center">
            <Heart className="mr-2 h-6 w-6 text-red-500" /> Favorites
          </h1>
          
          {((activeTab === "books" && filteredBooks.length > 0) || 
            (activeTab === "poems" && filteredPoems.length > 0)) && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/30 rounded-full"
            />
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Books
            </TabsTrigger>
            <TabsTrigger value="poems" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              Poems
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="books" className="mt-4">
            {filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No favorite books yet</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "No books match your search" : "Your saved books will appear here"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/books')}>
                    Browse Books
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-230px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="relative group">
                      <BookCard 
                        book={book} 
                        onClick={() => handleViewBook(book.id)} 
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBook(book.id);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-background/80 p-1
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="poems" className="mt-4">
            {filteredPoems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <BookText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No favorite poems yet</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "No poems match your search" : "Your saved poems will appear here"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/poems')}>
                    Browse Poems
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-230px)]">
                <div className="space-y-6">
                  {filteredPoems.map((poem, index) => {
                    const poemId = getUniqueId(poem, index);
                    const isSpeaking = speakingPoemId === poemId;
                    
                    return (
                      <div 
                        key={poemId} 
                        className="cursor-pointer animate-fade-in relative"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div onClick={() => viewPoemDetails(poem)}>
                          <PoemCard poem={poem} />
                        </div>
                        
                        <div className="absolute top-4 right-16">
                          {isSpeaking ? (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={(e) => stopReading(e)} 
                              className="flex items-center gap-1"
                            >
                              <span>Stop</span>
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => readPoem(poem, index, e)} 
                              className="flex items-center gap-1"
                            >
                              <Volume2 size={16} />
                              <span>Read</span>
                            </Button>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePoem(poem);
                          }}
                          className="absolute top-4 right-4 rounded-full bg-background/80 p-1
                                   opacity-0 hover:opacity-100 transition-opacity"
                          aria-label="Remove from favorites"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all favorite {activeTab}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {activeTab} from your favorites list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LikedBooks;
