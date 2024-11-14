const PHOTO_STORAGE_KEY = 'student_photos';

export function saveStudentPhoto(studentId: string, photoData: string): void {
  try {
    const photos = getStoredPhotos();
    photos[studentId] = photoData;
    localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Erreur de sauvegarde de la photo:', error);
    throw error;
  }
}

export function getStudentPhoto(studentId: string): string | null {
  try {
    const photos = getStoredPhotos();
    return photos[studentId] || null;
  } catch (error) {
    console.error('Erreur de récupération de la photo:', error);
    return null;
  }
}

function getStoredPhotos(): Record<string, string> {
  try {
    const stored = localStorage.getItem(PHOTO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}