import { useSignedUrl } from "@/hooks/use-signed-url";
import { Loader2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefectImageProps {
  imageUrl: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function DefectImage({ 
  imageUrl, 
  alt = "Defect", 
  className,
  fallbackClassName 
}: DefectImageProps) {
  const { signedUrl, isLoading, error } = useSignedUrl("defect-images", imageUrl);

  if (!imageUrl) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        fallbackClassName || className
      )}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        fallbackClassName || className
      )}>
        <ImageOff className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
    />
  );
}
