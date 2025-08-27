import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidate cached resources related to catalog listing.
 * Use from server actions or route handlers after product/category changes.
 */
export async function revalidateCatalog() {
  // Invalidate data caches tagged as 'catalog'
  revalidateTag('catalog');
  // Optionally refresh the main catalog route (covers canonical without params)
  revalidatePath('/catalog');
}

/**
 * Revalidate specific product detail path (optional helper)
 */
export async function revalidateProductDetail(productIdOrSlug: string) {
  if (!productIdOrSlug) return;
  revalidatePath(`/catalog/${productIdOrSlug}`);
}
