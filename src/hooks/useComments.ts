import { useCallback, useMemo, useState } from "react";
import { ProductComment } from "../types";

const COMMENTS_KEY = "edutrade_comments";

function readComments(): ProductComment[] {
  const raw = localStorage.getItem(COMMENTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProductComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(COMMENTS_KEY);
    return [];
  }
}

function writeComments(comments: ProductComment[]): void {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function useComments(productId: string): {
  comments: ProductComment[];
  addComment: (text: string, userId: string, userName: string, parentId?: string) => void;
  deleteComment: (commentId: string) => void;
} {
  const [allComments, setAllComments] = useState<ProductComment[]>(() => readComments());

  const comments = useMemo(
    () =>
      allComments
        .filter((comment) => comment.productId === productId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [allComments, productId],
  );

  const addComment = useCallback(
    (text: string, userId: string, userName: string, parentId?: string) => {
      if (!text.trim()) return;

      const comment: ProductComment = {
        id: `c-${Date.now()}`,
        productId,
        userId,
        userName,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        parentId,
      };
      const nextComments = [...readComments(), comment];

      writeComments(nextComments);
      setAllComments(nextComments);
    },
    [productId],
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      const raw = readComments();
      // Remove comment itself, and if it's a root comment, also remove its replies
      const nextComments = raw.filter((c) => c.id !== commentId && c.parentId !== commentId);
      writeComments(nextComments);
      setAllComments(nextComments);
    },
    [],
  );

  return { comments, addComment, deleteComment };
}
