
import { Book } from "@/services/gutendexService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  book: Book;
  onClick?: () => void; // Make onClick optional
}

const BookCard = ({ book, onClick }: BookCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/book-details?id=${book.id}`);
    }
  };

  // Get cover image if available
  const coverImage = book.formats["image/jpeg"] || 
                    book.formats["image/png"] || 
                    book.formats["image/jpg"] || 
                    "/placeholder.svg";

  // Format author names
  const authorNames = book.authors.map(author => author.name).join(", ");

  return (
    <Card 
      className="glass-card h-full transition-all hover:scale-[1.02] cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg line-clamp-2 gradient-text">
          {book.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2 pb-0">
        <div className="aspect-[2/3] overflow-hidden rounded-md">
          <img 
            src={coverImage} 
            alt={`Cover for ${book.title}`} 
            className="object-cover w-full h-full"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        
        <p className="text-xs sm:text-sm opacity-80 line-clamp-1">
          {authorNames || "Unknown Author"}
        </p>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-1 pt-2">
        {book.languages.slice(0, 2).map((lang, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {lang.toUpperCase()}
          </Badge>
        ))}
        <Badge variant="outline" className="text-xs ml-auto">
          {book.download_count.toLocaleString()} downloads
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default BookCard;
