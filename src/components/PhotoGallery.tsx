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

      {/* Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Modal Container */}
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">
                {selectedIndex + 1} of {photos.length}
              </span>
              <button
                onClick={closeModal}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center bg-[var(--background-subtle)] overflow-hidden p-6">
              <img
                src={photos[selectedIndex]}
                alt={`${combination} photo ${selectedIndex + 1}`}
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            {/* Navigation */}
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-[var(--border)]">
                <button
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous photo"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="flex gap-1.5">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedIndex
                          ? 'bg-[var(--green)]'
                          : 'bg-[var(--border)] hover:bg-[var(--text-muted)]'
                      }`}
                      aria-label={`Go to photo ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  disabled={selectedIndex === photos.length - 1}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next photo"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
