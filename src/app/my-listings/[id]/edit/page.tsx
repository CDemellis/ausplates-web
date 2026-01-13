'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { updateListing, UpdateListingData } from '@/lib/api';
import { revalidateListing } from '@/app/actions';
import { PlateView } from '@/components/PlateView';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PlateSizeFormat,
  PlateMaterial,
  VehicleType,
  PLATE_TYPE_NAMES,
  SIZE_FORMAT_NAMES,
  PLATE_MATERIAL_NAMES,
  COLOR_SCHEME_COLORS,
} from '@/types/listing';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

const PLATE_TYPES: PlateType[] = [
  'custom', 'heritage', 'euro', 'standard', 'slimline', 'numeric',
  'prestige', 'deluxe', 'liquid_metal', 'frameless', 'signature',
  'afl_team', 'fishing', 'business', 'sequential', 'car_brand',
];

const SIZE_FORMATS: PlateSizeFormat[] = [
  'standard', 'slimline', 'euro', 'square', 'us_style', 'jdm', 'motorcycle',
];

const MATERIALS: PlateMaterial[] = ['aluminium', 'acrylic', 'polycarbonate', 'enamel'];

const COMMON_COLOR_SCHEMES: PlateColorScheme[] = [
  'white_on_black', 'black_on_white', 'blue_on_white', 'black_on_yellow',
  'silver_on_black', 'gold_on_black', 'yellow_on_black', 'green_on_white',
];

const ALL_COLOR_SCHEMES: PlateColorScheme[] = [
  ...COMMON_COLOR_SCHEMES,
  'maroon_on_white', 'white_on_blue', 'white_on_maroon',
  'red_on_white', 'pink_on_white', 'purple_on_white',
  'orange_on_white', 'grey_on_black', 'teal_on_white', 'ocean_blue_on_white',
  'sky_blue_on_white', 'navy_on_white', 'lime_on_white', 'forest_green_on_white',
  'burgundy_on_white', 'fire_red_on_white', 'charcoal_on_white', 'brown_on_white',
  'tan_on_black', 'cream_on_black', 'off_white_on_black',
  'matte_black_on_white', 'matte_white_on_black',
];

interface ListingForm {
  combination: string;
  state: AustralianState;
  plateType: PlateType;
  colorScheme: PlateColorScheme;
  sizeFormats: [PlateSizeFormat, PlateSizeFormat];
  material: PlateMaterial;
  vehicleType: VehicleType;
  price: number;
  isOpenToOffers: boolean;
  description: string;
  photos: string[];
}

interface PhotoUpload {
  file: File;
  preview: string;
  uploading: boolean;
}

export default function EditListingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  const [form, setForm] = useState<ListingForm>({
    combination: '',
    state: 'VIC',
    plateType: 'custom',
    colorScheme: 'white_on_black',
    sizeFormats: ['standard', 'standard'],
    material: 'aluminium',
    vehicleType: 'car',
    price: 0,
    isOpenToOffers: true,
    description: '',
    photos: [],
  });
  const [newPhotos, setNewPhotos] = useState<PhotoUpload[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const [originalSlug, setOriginalSlug] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/my-listings');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch listing data
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        // Fetch by ID - we need to use the listings endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com'}/api/listings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Listing not found');
          }
          throw new Error('Failed to fetch listing');
        }

        const listing = await res.json();

        // Verify ownership
        if (listing.user_id !== user?.id) {
          throw new Error('You do not have permission to edit this listing');
        }

        setOriginalSlug(listing.slug);

        // Merge photos from both sources:
        // 1. photo_urls column (web uploads)
        // 2. photos from listing_photos table (iOS app uploads)
        const photoUrlsFromColumn = listing.photo_urls || [];
        const photoUrlsFromTable = (listing.photos || []).map((p: { url: string }) => p.url);
        const allPhotos = [...new Set([...photoUrlsFromColumn, ...photoUrlsFromTable])];

        setForm({
          combination: listing.combination,
          state: listing.state,
          plateType: listing.plate_type,
          colorScheme: listing.color_scheme,
          sizeFormats: listing.size_formats || ['standard', 'standard'],
          material: listing.material || 'aluminium',
          vehicleType: listing.vehicle_type || 'car',
          price: listing.price / 100, // Convert from cents
          isOpenToOffers: listing.is_open_to_offers ?? true,
          description: listing.description || '',
          photos: allPhotos,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [isAuthenticated, id, getAccessToken, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      // Upload any new photos first
      const allPhotoUrls = [...form.photos];
      if (newPhotos.length > 0) {
        setIsUploadingPhotos(true);
        const { uploadPhoto } = await import('@/lib/api');
        for (const photo of newPhotos) {
          try {
            const result = await uploadPhoto(token, photo.file, id);
            allPhotoUrls.push(result.url);
          } catch (uploadErr) {
            console.error('Failed to upload photo:', uploadErr);
          }
        }
        setIsUploadingPhotos(false);
      }

      // Note: combination is NOT included - it cannot be changed after listing creation
      // This prevents URL/slug changes for SEO and abuse prevention
      const updateData: UpdateListingData = {
        state: form.state,
        plateType: form.plateType,
        colorScheme: form.colorScheme,
        sizeFormats: form.sizeFormats,
        material: form.material,
        vehicleType: form.vehicleType,
        price: form.price * 100, // Convert to cents
        isOpenToOffers: form.isOpenToOffers,
        description: form.description,
        // Always send photoUrls so API can sync listing_photos table
        photoUrls: allPhotoUrls,
      };

      await updateListing(token, id, updateData);

      // Revalidate the listing page cache so changes appear immediately
      await revalidateListing(originalSlug);

      setSuccess(true);

      // Redirect to listing after short delay
      setTimeout(() => {
        router.push(`/plate/${originalSlug}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsSaving(false);
      setIsUploadingPhotos(false);
    }
  };

  const displayedColors = showAllColors ? ALL_COLOR_SCHEMES : COMMON_COLOR_SCHEMES;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error && !form.combination) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text)] mb-2">{error}</h1>
          <Link href="/my-listings" className="text-[var(--green)] hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/my-listings" className="text-[var(--text-secondary)] hover:text-[var(--text)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text)]">Edit Listing</h1>
            <div className="w-6" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Plate Details */}
              <section className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Plate Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Combination
                    </label>
                    <input
                      type="text"
                      value={form.combination}
                      disabled
                      className="w-full px-4 py-3 text-xl font-mono tracking-wider uppercase border border-[var(--border)] rounded-xl bg-[var(--background-subtle)] text-[var(--text-secondary)] cursor-not-allowed"
                      aria-describedby="combination-note"
                    />
                    <p id="combination-note" className="mt-1 text-sm text-[var(--text-muted)]">
                      Plate combination cannot be changed after listing creation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">State</label>
                    <div className="grid grid-cols-4 gap-2">
                      {STATES.map((state) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => setForm({ ...form, state })}
                          className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                            form.state === state
                              ? 'bg-[var(--green)] text-white border-[var(--green)]'
                              : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Plate Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PLATE_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, plateType: type })}
                          className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                            form.plateType === type
                              ? 'bg-[var(--green)] text-white border-[var(--green)]'
                              : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
                          }`}
                        >
                          {PLATE_TYPE_NAMES[type]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Appearance */}
              <section className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Appearance</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Color Scheme</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {displayedColors.map((scheme) => {
                        const colors = COLOR_SCHEME_COLORS[scheme];
                        return (
                          <button
                            key={scheme}
                            type="button"
                            onClick={() => setForm({ ...form, colorScheme: scheme })}
                            className={`relative p-2 rounded-xl border-2 transition-colors ${
                              form.colorScheme === scheme
                                ? 'border-[var(--green)]'
                                : 'border-transparent hover:border-[var(--border)]'
                            }`}
                          >
                            <div
                              className="w-full aspect-[2/1] rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: colors?.background, color: colors?.text }}
                            >
                              AB
                            </div>
                            {form.colorScheme === scheme && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--green)] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAllColors(!showAllColors)}
                      className="mt-2 text-sm text-[var(--green)] hover:underline"
                    >
                      {showAllColors ? 'Show fewer colors' : `Show all colors (${ALL_COLOR_SCHEMES.length})`}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">Front Format</label>
                      <select
                        value={form.sizeFormats[0]}
                        onChange={(e) => setForm({ ...form, sizeFormats: [e.target.value as PlateSizeFormat, form.sizeFormats[1]] })}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                      >
                        {SIZE_FORMATS.map((format) => (
                          <option key={format} value={format}>{SIZE_FORMAT_NAMES[format]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">Rear Format</label>
                      <select
                        value={form.sizeFormats[1]}
                        onChange={(e) => setForm({ ...form, sizeFormats: [form.sizeFormats[0], e.target.value as PlateSizeFormat] })}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                      >
                        {SIZE_FORMATS.map((format) => (
                          <option key={format} value={format}>{SIZE_FORMAT_NAMES[format]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Material</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MATERIALS.map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setForm({ ...form, material: mat })}
                          className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                            form.material === mat
                              ? 'bg-[var(--green)] text-white border-[var(--green)]'
                              : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
                          }`}
                        >
                          {PLATE_MATERIAL_NAMES[mat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Vehicle Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['car', 'motorcycle'] as VehicleType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, vehicleType: type })}
                          className={`px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                            form.vehicleType === type
                              ? 'bg-[var(--green)] text-white border-[var(--green)]'
                              : 'bg-white text-[var(--text)] border-[var(--border)] hover:border-[var(--green)]'
                          }`}
                        >
                          {type === 'car' ? 'Car' : 'Motorcycle'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Pricing & Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Price (AUD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
                      <input
                        type="number"
                        value={form.price || ''}
                        onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                        min={100}
                        className="w-full pl-8 pr-4 py-3 text-xl border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isOpenToOffers}
                      onChange={(e) => setForm({ ...form, isOpenToOffers: e.target.checked })}
                      className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                    />
                    <span className="text-sm font-medium text-[var(--text)]">Open to offers</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 1000) })}
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] resize-none"
                    />
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{form.description.length}/1000</p>
                  </div>
                </div>
              </section>

              {/* Photos */}
              <section className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Photos</h2>

                <div className="space-y-4">
                  {/* Existing photos */}
                  {form.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">Current photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {form.photos.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--background-subtle)]">
                            <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = form.photos.filter((_, i) => i !== index);
                                setForm({ ...form, photos: updated });
                              }}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              aria-label={`Remove photo ${index + 1}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New photos to upload */}
                  {newPhotos.length > 0 && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">New photos (will upload on save)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {newPhotos.map((photo, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--background-subtle)]">
                            <img src={photo.preview} alt={`New photo ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                URL.revokeObjectURL(photo.preview);
                                setNewPhotos(newPhotos.filter((_, i) => i !== index));
                              }}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              aria-label={`Remove new photo ${index + 1}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add photos button */}
                  {form.photos.length + newPhotos.length < 5 && (
                    <div>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const remaining = 5 - form.photos.length - newPhotos.length;
                          const toAdd = files.slice(0, remaining);

                          const newUploads: PhotoUpload[] = toAdd.map(file => ({
                            file,
                            preview: URL.createObjectURL(file),
                            uploading: false,
                          }));

                          setNewPhotos([...newPhotos, ...newUploads]);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--green)] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm text-[var(--text-secondary)]">
                          Add photos ({5 - form.photos.length - newPhotos.length} remaining)
                        </span>
                      </label>
                    </div>
                  )}

                  <p className="text-sm text-[var(--text-muted)]">
                    Up to 5 photos. Supported formats: JPEG, PNG, WebP. Max 5MB each.
                  </p>
                </div>
              </section>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-600">Listing updated successfully! Redirecting...</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving || isUploadingPhotos || !form.combination || form.price < 100}
                className="w-full py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploadingPhotos ? 'Uploading photos...' : isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <div className="bg-[var(--background-subtle)] rounded-xl p-8 flex flex-col items-center justify-center">
                <PlateView
                  combination={form.combination || 'PLATE'}
                  state={form.state}
                  colorScheme={form.colorScheme}
                  size="large"
                />
                <p className="mt-4 text-sm text-[var(--text-muted)]">
                  {form.state} • {PLATE_TYPE_NAMES[form.plateType]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
