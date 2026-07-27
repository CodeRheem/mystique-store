import { supabase } from "@/lib/supabase";

/**
 * Uploads a photo file to the 'product-photos' storage bucket
 * and returns its public URL, ready to save into a product's photo_url field.
 *
 * Automatically resizes large images down before upload, so phone camera
 * photos (often 5-10MB+) don't slow down the site for her or her customers.
 */
export async function uploadProductPhoto(file: File): Promise<string> {
  const resizedFile = await resizeImage(file, 1200); // max 1200px on the longest side

  const fileExt = "jpg"; // we convert everything to jpg during resize, for consistency
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("product-photos")
    .upload(fileName, resizedFile, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    console.error("uploadProductPhoto error:", error.message);
    throw error;
  }

  const { data } = supabase.storage.from("product-photos").getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Resizes an image file down to a max dimension and converts it to JPEG,
 * using the browser's canvas API. Keeps photo uploads fast on mobile data.
 */
function resizeImage(file: File, maxDimension: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to process image"));
          resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85 // quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = objectUrl;
  });
}