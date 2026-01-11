'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateListing(slug: string) {
  revalidatePath(`/plate/${slug}`);
}

export async function revalidateMyListings() {
  revalidatePath('/my-listings');
}

export async function revalidateAfterStatusChange(slug: string) {
  // Revalidate all pages that show listings
  revalidatePath(`/plate/${slug}`);
  revalidatePath('/my-listings');
  revalidatePath('/browse');
  revalidatePath('/');
}
