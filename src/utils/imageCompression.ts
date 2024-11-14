import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Erreur de compression:', error);
    throw error;
  }
}