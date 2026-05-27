import { useCallback, useMemo, useState } from "react";
import { Message } from "../types";

const MESSAGES_KEY = "edutrade_messages";

export function readMessages(): Message[] {
  const raw = localStorage.getItem(MESSAGES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(MESSAGES_KEY);
    return [];
  }
}

function writeMessages(messages: Message[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function useMessages(
  productId: string,
  currentUserId: string | undefined,
  otherUserId: string,
  otherName = "Người bán",
): {
  conversation: Message[];
  sendMessage: (text: string, fromName: string) => void;
} {
  const [messages, setMessages] = useState<Message[]>(() => readMessages());

  const conversation = useMemo(() => {
    if (!currentUserId) return [];

    return messages
      .filter((message) => message.productId === productId)
      .filter(
        (message) =>
          (message.fromUserId === currentUserId && message.toUserId === otherUserId) ||
          (message.fromUserId === otherUserId && message.toUserId === currentUserId),
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [currentUserId, messages, productId, otherUserId]);

  const sendMessage = useCallback(
    (text: string, fromName: string) => {
      if (!currentUserId || !text.trim()) return;

      const message: Message = {
        id: `m-${Date.now()}`,
        productId,
        fromUserId: currentUserId,
        fromName,
        toUserId: otherUserId,
        toName: otherName,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...readMessages(), message];

      writeMessages(nextMessages);
      setMessages(nextMessages);
    },
    [currentUserId, otherName, productId, otherUserId],
  );

  return { conversation, sendMessage };
}
