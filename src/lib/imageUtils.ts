import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a public URL for an image stored in Supabase Storage
 * @param imagePath - The file path in the storage bucket
 * @returns Public URL that can be accessed by anyone
 */
export function getPublicImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  
  // Get the public URL from Supabase Storage
  const { data } = supabase.storage
    .from("defect-images")
    .getPublicUrl(imagePath);
  
  return data.publicUrl;
}

/**
 * Generate a signed URL for an image (for temporary access)
 * @param imagePath - The file path in the storage bucket
 * @param expiresIn - Expiry time in seconds (default: 24 hours)
 * @returns Signed URL with expiration
 */
export async function getSignedImageUrl(imagePath: string | null, expiresIn: number = 86400): Promise<string | null> {
  if (!imagePath) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from("defect-images")
      .createSignedUrl(imagePath, expiresIn);
    
    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }
}