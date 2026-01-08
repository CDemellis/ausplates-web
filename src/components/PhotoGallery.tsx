'use client';

import { useState, useEffect, useCallback } from 'react';

interface PhotoGalleryProps {
  photos: string[];
  combination: string;
}

export function PhotoGallery({ photos, combination }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, photos.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedIndex, closeModal, goToPrevious, goToNext]);

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          Photos from seller
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="aspect-square rounded-lg overflow-hidden bg-[var(--background-subtle)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2"
              aria-label={`View photo ${index + 1} of ${photos.length}`}
            >
              <img
                src={url}
                alt={`${combination} photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Previous photo"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {selectedIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Next photo"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={photos[selectedIndex]}
            alt={`${combination} photo ${selectedIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
