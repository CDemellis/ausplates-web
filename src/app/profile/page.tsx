'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTokens, getLinkingStatus, linkEmail, LinkingStatus, deleteAccount, clearTokens, changePassword } from '@/lib/auth';
import { getSavedListings, getUserProfile, updateUserProfile, uploadPhoto, UserProfile, UpdateProfileData, exportUserData } from '@/lib/api';
import { Listing } from '@/types/listing';
import { ListingCard, ListingCardSkeleton } from '@/components/ListingCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';
const APPLE_SERVICES_ID = 'app.ausplates.web';

function getAppleLinkUrl(): string {
  const params = new URLSearchParams({
    client_id: APPLE_SERVICES_ID,
    redirect_uri: `${API_BASE_URL}/api/auth/callback/apple`,
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
    state: 'link', // Indicate this is a linking request
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[var(--green)]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

// Removed unused UnlinkedIcon component

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function SavedPlatesSection() {
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedListings();
  }, []);

  const loadSavedListings = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    try {
      const listings = await getSavedListings(accessToken);
      setSavedListings(listings);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Saved Plates</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Saved Plates</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {savedListings.length} {savedListings.length === 1 ? 'plate' : 'plates'} saved
          </p>
        </div>
        {savedListings.length > 0 && (
          <Link
            href="/saved"
            className="text-sm font-medium text-[var(--green)] hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {savedListings.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)]">No saved plates yet</p>
            <Link
              href="/plates"
              className="inline-block mt-4 text-sm font-medium text-[var(--green)] hover:underline"
            >
              Browse plates
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedListings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditProfileSection({ user, onUpdate }: { user: { fullName: string; avatarUrl?: string; email: string; emailVerified?: boolean }; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    messages: true,
    priceDrops: true,
    newListings: false,
    savedPlateUpdates: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    try {
      const data = await getUserProfile(accessToken);
      setProfile(data);
      setFullName(data.fullName);
      setPhoneNumber(data.phoneNumber || '');
      setAvatarUrl(data.avatarUrl || '');
      if (data.notificationPreferences) {
        setNotifications(data.notificationPreferences);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load profile:', err);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsUploadingAvatar(true);
    setError('');

    try {
      const result = await uploadPhoto(accessToken, file);
      setAvatarUrl(result.url);
    } catch (err) {
      setError((err as Error).message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Name is required');
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsSaving(true);
    try {
      const updateData: UpdateProfileData = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        notificationPreferences: notifications,
      };

      await updateUserProfile(accessToken, updateData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset to original values
    if (profile) {
      setFullName(profile.fullName);
      setPhoneNumber(profile.phoneNumber || '');
      setAvatarUrl(profile.avatarUrl || '');
      if (profile.notificationPreferences) {
        setNotifications(profile.notificationPreferences);
      }
    } else {
      setFullName(user.fullName);
      setAvatarUrl(user.avatarUrl || '');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Profile</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-[var(--green)] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
            <CheckIcon />
            {success}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
                    <span className="text-3xl font-semibold text-[var(--green)]">
                      {fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--green)] rounded-full flex items-center justify-center text-white hover:bg-[#006B31] transition-colors disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Click the camera icon to change your photo
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] text-[var(--text-muted)] cursor-not-allowed"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--text)] mb-1">
                  Phone Number <span className="text-[var(--text-muted)]">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                  placeholder="0400 000 000"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.messages}
                    onChange={(e) => setNotifications({ ...notifications, messages: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <div>
                    <span className="font-medium text-[var(--text)]">Messages</span>
                    <p className="text-sm text-[var(--text-muted)]">Get notified when someone messages you</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.priceDrops}
                    onChange={(e) => setNotifications({ ...notifications, priceDrops: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <div>
                    <span className="font-medium text-[var(--text)]">Price Drops</span>
                    <p className="text-sm text-[var(--text-muted)]">Get notified about price drops on saved plates</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.savedPlateUpdates}
                    onChange={(e) => setNotifications({ ...notifications, savedPlateUpdates: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <div>
                    <span className="font-medium text-[var(--text)]">Saved Plate Updates</span>
                    <p className="text-sm text-[var(--text-muted)]">Get updates about plates you&apos;ve saved</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.newListings}
                    onChange={(e) => setNotifications({ ...notifications, newListings: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <div>
                    <span className="font-medium text-[var(--text)]">New Listings</span>
                    <p className="text-sm text-[var(--text-muted)]">Get notified about new plates matching your interests</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--green)] text-white font-medium hover:bg-[#006B31] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Display Info */}
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-[var(--green)]">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-[var(--text)]">{user.fullName}</h3>
                <p className="text-[var(--text-muted)]">{user.email}</p>
                {user.emailVerified && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-[var(--green)]">
                    <CheckIcon />
                    <span>Email verified</span>
                  </div>
                )}
              </div>
            </div>

            {profile?.phoneNumber && (
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-muted)]">Phone</p>
                <p className="text-[var(--text)]">{profile.phoneNumber}</p>
              </div>
            )}

            {/* Notification Summary */}
            <div className="pt-3 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)] mb-2">Notifications</p>
              <div className="flex flex-wrap gap-2">
                {notifications.messages && (
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--green)]/10 text-[var(--green)] rounded-full">Messages</span>
                )}
                {notifications.priceDrops && (
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--green)]/10 text-[var(--green)] rounded-full">Price Drops</span>
                )}
                {notifications.savedPlateUpdates && (
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--green)]/10 text-[var(--green)] rounded-full">Saved Updates</span>
                )}
                {notifications.newListings && (
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--green)]/10 text-[var(--green)] rounded-full">New Listings</span>
                )}
                {!notifications.messages && !notifications.priceDrops && !notifications.savedPlateUpdates && !notifications.newListings && (
                  <span className="text-sm text-[var(--text-muted)]">All notifications disabled</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountLinkingSection() {
  const [status, setStatus] = useState<LinkingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Link email form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    try {
      const data = await getLinkingStatus(accessToken);
      setStatus(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsLinking(true);
    try {
      const response = await linkEmail(accessToken, email, password);
      if (response.success) {
        setSuccess(response.requiresVerification
          ? 'Email linked! Check your inbox to verify.'
          : 'Email linked successfully!');
        setShowEmailForm(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        await loadStatus();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkApple = () => {
    // Store current page to redirect back after linking
    sessionStorage.setItem('link_redirect', '/profile');
    window.location.href = getAppleLinkUrl();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text)]">Account Linking</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Link multiple sign-in methods to access your account different ways
        </p>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckIcon />
            {success}
          </div>
        )}

        {/* Email Status */}
        <div className="flex items-center justify-between p-4 bg-[var(--background-subtle)] rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status?.hasEmail ? 'bg-[var(--green)]/10' : 'bg-gray-100'}`}>
              <EmailIcon className={`w-5 h-5 ${status?.hasEmail ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`} />
            </div>
            <div>
              <div className="font-medium text-[var(--text)]">Email & Password</div>
              {status?.email && (
                <div className="text-sm text-[var(--text-muted)]">{status.email}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status?.hasEmail ? (
              <CheckIcon />
            ) : (
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-sm font-medium text-[var(--green)] hover:underline"
              >
                Add email
              </button>
            )}
          </div>
        </div>

        {/* Link Email Form */}
        {showEmailForm && !status?.hasEmail && (
          <form onSubmit={handleLinkEmail} className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div>
              <label htmlFor="link-email" className="block text-sm font-medium text-[var(--text)] mb-1">
                Email
              </label>
              <input
                type="email"
                id="link-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="link-password" className="block text-sm font-medium text-[var(--text)] mb-1">
                Password
              </label>
              <input
                type="password"
                id="link-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="link-confirm" className="block text-sm font-medium text-[var(--text)] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="link-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLinking}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--green)] text-white font-medium hover:bg-[#006B31] transition-colors disabled:opacity-50"
              >
                {isLinking ? 'Linking...' : 'Link Email'}
              </button>
            </div>
          </form>
        )}

        {/* Apple Status */}
        <div className="flex items-center justify-between p-4 bg-[var(--background-subtle)] rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status?.hasApple ? 'bg-black' : 'bg-gray-100'}`}>
              <AppleIcon className={`w-5 h-5 ${status?.hasApple ? 'text-white' : 'text-[var(--text-muted)]'}`} />
            </div>
            <div>
              <div className="font-medium text-[var(--text)]">Apple ID</div>
              {status?.hasApple && (
                <div className="text-sm text-[var(--text-muted)]">Connected</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status?.hasApple ? (
              <CheckIcon />
            ) : (
              <button
                onClick={handleLinkApple}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
              >
                <AppleIcon className="w-4 h-4" />
                Link Apple
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const isValidPassword = passwordRegex.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const canSubmit = currentPassword && newPassword && confirmPassword && isValidPassword && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidPassword) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      await changePassword(accessToken, currentPassword, newPassword);
      setSuccess('Password changed successfully');
      setShowForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text)]">Security</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your password and account security
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
            <CheckIcon />
            {success}
          </div>
        )}

        {!showForm ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[var(--text)]">Password</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Change your account password
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-[var(--green)] hover:underline"
            >
              Change password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-[var(--text)] mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-[var(--text)] mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="At least 8 characters"
              />
              {newPassword && !isValidPassword && (
                <p className="text-sm text-red-600 mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, and a number
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--text)] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="Confirm new password"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--green)] text-white font-medium hover:bg-[#006B31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function ExportDataSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setError('');
    setSuccess('');

    const { accessToken } = getTokens();
    if (!accessToken) {
      setError('You must be signed in to export data');
      return;
    }

    setIsExporting(true);
    try {
      const data = await exportUserData(accessToken);

      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ausplates-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Your data has been exported successfully');
    } catch (err) {
      setError((err as Error).message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text)]">Your Data</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Download a copy of all your data
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
            <CheckIcon />
            {success}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-[var(--text)]">Export My Data</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Download a JSON file containing your profile, listings, messages, and more
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--green)] text-white font-medium hover:bg-[#006B31] transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountSection({ onDelete }: { onDelete: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteAccount(accessToken);
      clearTokens();
      onDelete();
    } catch (err) {
      setError((err as Error).message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Irreversible actions that affect your account
        </p>
      </div>

      <div className="p-6">
        {!showConfirm ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[var(--text)]">Delete Account</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-red-800">Are you absolutely sure?</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This action <strong>cannot be undone</strong>. This will permanently delete your account,
                    all your listings, messages, and remove your data from our servers.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="confirm-delete" className="block text-sm font-medium text-[var(--text)] mb-1">
                Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm
              </label>
              <input
                type="text"
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText('');
                  setError('');
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || confirmText !== 'DELETE'}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete My Account'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signOut, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = () => {
    // Clear auth context and redirect to home
    signOut();
    router.push('/');
  };

  const handleProfileUpdate = async () => {
    // Refresh the auth context to pick up updated user data
    if (refreshUser) {
      await refreshUser();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--green)] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-8">Profile & Settings</h1>

      <div className="space-y-6">
        {/* Editable Profile Section */}
        <EditProfileSection user={user} onUpdate={handleProfileUpdate} />

        {/* Saved Plates */}
        <SavedPlatesSection />

        {/* Account Linking */}
        <AccountLinkingSection />

        {/* Change Password */}
        <ChangePasswordSection />

        {/* Export Data */}
        <ExportDataSection />

        {/* Sign Out */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text)] font-medium hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Delete Account */}
        <DeleteAccountSection onDelete={handleDeleteAccount} />
      </div>
    </div>
  );
}
