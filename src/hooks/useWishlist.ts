import { useCallback, useEffect, useState } from "react";

function getWishlistKey(userId: string): string {
  return `edutrade_wishlist_${userId}`;
}

function readWishlist(userId: string): string[] {
  const raw = localStorage.getItem(getWishlistKey(userId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(getWishlistKey(userId));
    return [];
  }
}

export function useWishlist(userId: string | undefined): {
  ids: string[];
  toggle: (productId: string) => void;
  isWished: (productId: string) => boolean;
} {
  const [ids, setIds] = useState<string[]>(() => (userId ? readWishlist(userId) : []));

  useEffect(() => {
    setIds(userId ? readWishlist(userId) : []);
  }, [userId]);

  const toggle = useCallback(
    (productId: string) => {
      if (!userId) return;

      setIds((previousIds) => {
        const nextIds = previousIds.includes(productId)
          ? previousIds.filter((id) => id !== productId)
          : [...previousIds, productId];

        localStorage.setItem(getWishlistKey(userId), JSON.stringify(nextIds));
        return nextIds;
      });
    },
    [userId],
  );

  function isWished(productId: string): boolean {
    return ids.includes(productId);
  }

  return { ids, toggle, isWished };
}
