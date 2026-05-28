import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface WishlistContextValue {
  ids: string[];
  toggle: (productId: string) => void;
  isWished: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

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

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      setIds(readWishlist(user.id));
    } else {
      setIds([]);
    }
  }, [user?.id]);

  const toggle = useCallback(
    (productId: string) => {
      if (!user?.id) return;

      setIds((previousIds) => {
        const nextIds = previousIds.includes(productId)
          ? previousIds.filter((id) => id !== productId)
          : [...previousIds, productId];

        localStorage.setItem(getWishlistKey(user.id), JSON.stringify(nextIds));
        return nextIds;
      });
    },
    [user?.id],
  );

  const isWished = useCallback(
    (productId: string) => {
      return ids.includes(productId);
    },
    [ids],
  );

  return React.createElement(WishlistContext.Provider, { value: { ids, toggle, isWished } }, children);
}

export function useWishlist(_userId?: string | undefined): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

