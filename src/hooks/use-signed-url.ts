import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get a signed URL for a storage object
 * @param bucketName - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Expiry time in seconds (default: 3600 = 1 hour)
 */
export function useSignedUrl(
  bucketName: string,
  path: string | null,
  expiresIn: number = 3600
) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setSignedUrl(null);
      return;
    }

    const fetchSignedUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Extract just the file path from a full URL if necessary
        const filePath = extractFilePath(path, bucketName);
        
        if (!filePath) {
          setSignedUrl(null);
          return;
        }

        const { data, error: urlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, expiresIn);

        if (urlError) {
          console.error("Error creating signed URL:", urlError);
          setError(urlError.message);
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (err: any) {
        console.error("Error fetching signed URL:", err);
        setError(err.message);
        setSignedUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [bucketName, path, expiresIn]);

  return { signedUrl, isLoading, error };
}

/**
 * Extract the file path from a storage URL or return the path if already a path
 */
function extractFilePath(urlOrPath: string, bucketName: string): string | null {
  if (!urlOrPath) return null;
  
  // If it's already just a filename/path (no http), return as-is
  if (!urlOrPath.startsWith("http")) {
    return urlOrPath;
  }

  try {
    // Try to extract the path after the bucket name
    const url = new URL(urlOrPath);
    const pathParts = url.pathname.split(`/${bucketName}/`);
    
    if (pathParts.length > 1) {
      return pathParts[1];
    }
    
    // Fallback: just get the last part of the path
    const segments = url.pathname.split("/");
    return segments[segments.length - 1];
  } catch {
    // If URL parsing fails, try to extract filename
    const segments = urlOrPath.split("/");
    return segments[segments.length - 1];
  }
}

/**
 * Get a signed URL without a hook (for one-time use)
 */
export async function getSignedUrl(
  bucketName: string,
  path: string | null,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!path) return null;

  try {
    const filePath = extractFilePath(path, bucketName);
    if (!filePath) return null;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error getting signed URL:", err);
    return null;
  }
}
