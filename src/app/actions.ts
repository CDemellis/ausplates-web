'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateListing(slug: string) {
  revalidatePath(`/plate/${slug}`);
}

export async function revalidateMyListings() {
  revalidatePath('/my-listings');
}
