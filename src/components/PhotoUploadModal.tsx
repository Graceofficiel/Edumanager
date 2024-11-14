import React, { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { compressImage } from '../utils/imageCompression';
import { saveStudentPhoto } from '../utils/photoStorage';
import { toast } from 'sonner';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (photoUrl: string) => void;
  studentId: string;
}

export default function PhotoUploadModal({ isOpen, onClose, onPhotoUploaded, studentId }: PhotoUploadModalProps) {
  const { theme } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setProgress(0);
        setProcessing(true);
        
        try {
          setProgress(30);
          const compressedDataUrl = await compressImage(file);
          setProgress(70);
          setPreview(compressedDataUrl);
          setProgress(100);
        } catch (error) {
          console.error('Erreur de traitement de l\'image:', error);
          toast.error('Erreur de traitement', {
            description: 'Une erreur est survenue lors du traitement de l\'image.'
          });
        } finally {
          setProcessing(false);
        }
      } else {
        toast.error('Type de fichier invalide', {
          description: 'Veuillez sélectionner une image.'
        });
      }
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    setProcessing(true);
    try {
      saveStudentPhoto(studentId, preview);
      onPhotoUploaded(preview);
      toast.success('Photo enregistrée', {
        description: 'La photo de profil a été mise à jour avec succès.'
      });
      onClose();
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Une erreur est survenue lors de la sauvegarde de la photo.'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Photo de Profil
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {preview ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
              >
                <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Cliquez pour sélectionner une photo
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {processing && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div
                  className={`bg-${theme.primaryColor}-600 h-2.5 rounded-full transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!preview || processing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {processing ? 'Traitement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}