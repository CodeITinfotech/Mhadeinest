/**
 * Crop-centers and JPEG-compresses an image file before storing it.
 *
 * @param file      The raw File from an <input type="file">
 * @param maxW      Max output width in px  (default 1200)
 * @param maxH      Max output height in px (default 900)
 * @param quality   JPEG quality 0–1        (default 0.82)
 * @returns         A JPEG data-URL safe to store in the DB
 */
export function processImage(
  file: File,
  maxW = 1200,
  maxH = 900,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;

        // Scale down maintaining aspect ratio
        const scale = Math.min(1, maxW / srcW, maxH / srcH);
        const outW = Math.round(srcW * scale);
        const outH = Math.round(srcH * scale);

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, outW, outH);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
