import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Cycle, Class, SchoolSettings, Student, Result, ImportedFile } from '../types';

// School Settings
export async function getSchoolSettings(): Promise<SchoolSettings> {
  const docRef = doc(db, 'settings', 'school');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as SchoolSettings : { name: 'EduManager', logo: '' };
}

export async function updateSchoolSettings(settings: SchoolSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'school'), settings);
}

// Admin Management
export async function checkAdminExists(): Promise<boolean> {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.some(doc => doc.data().role === 'admin');
}

export async function createAdminUser(userId: string, userData: { 
  email: string;
  name: string;
  role: 'admin';
}): Promise<void> {
  await setDoc(doc(db, 'users', userId), userData);
}

// File Storage
export async function uploadFile(path: string, data: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadString(storageRef, data, 'data_url');
  return await getDownloadURL(storageRef);
}

// Data Import Functions
export async function uploadDataFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await uploadString(storageRef, e.target?.result as string, 'data_url');
        const url = await getDownloadURL(storageRef);
        resolve(url);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function saveImportedData(classId: string, importData: ImportedFile): Promise<void> {
  const classRef = doc(db, 'classes', classId);
  const classDoc = await getDoc(classRef);
  
  if (classDoc.exists()) {
    const currentData = classDoc.data();
    const importedData = currentData.importedData || [];
    
    await updateDoc(classRef, {
      importedData: [...importedData, importData]
    });
  }
}