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
  messages: Message[],
  setMessages: (messages: Message[]) => void,
): {
  conversation: Message[];
  sendMessage: (text: string, fromName: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
} {

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

      // Check if seller has ever replied in this chat before
      const conversationMessages = readMessages().filter(
        (m) =>
          m.productId === productId &&
          ((m.fromUserId === currentUserId && m.toUserId === otherUserId) ||
            (m.fromUserId === otherUserId && m.toUserId === currentUserId))
      );
      const hasSellerRepliedBefore = conversationMessages.some(
        (m) => m.fromUserId === otherUserId
      );

      const nextMessages = [...readMessages(), message];

      writeMessages(nextMessages);
      setMessages(nextMessages);

      if (!hasSellerRepliedBefore) {
        setTimeout(() => {
          const currentMessages = readMessages();
          const sellerReply: Message = {
            id: `m-${Date.now() + 1}`,
            productId,
            fromUserId: otherUserId,
            fromName: otherName,
            toUserId: currentUserId,
            toName: fromName,
            text: `Chào bạn! Mình là ${otherName}. Cảm ơn bạn đã quan tâm đến sản phẩm này. Hiện tại sản phẩm vẫn còn nhé. Bạn đang ở đâu để tiện hẹn lịch qua xem đồ nhỉ?`,
            createdAt: new Date().toISOString(),
          };
          const updatedMessages = [...currentMessages, sellerReply];
          writeMessages(updatedMessages);
          setMessages(updatedMessages);
        }, 1500);
      }
    },
    [currentUserId, otherName, productId, otherUserId],
  );

  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!currentUserId) return;

      const allMsgs = readMessages();
      const nextMessages = allMsgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = { ...(msg.reactions ?? {}) };
        if (reactions[currentUserId] === emoji) {
          delete reactions[currentUserId];
        } else {
          reactions[currentUserId] = emoji;
        }

        return { ...msg, reactions };
      });

      writeMessages(nextMessages);
      setMessages(nextMessages);
    },
    [currentUserId],
  );

  return { conversation, sendMessage, reactToMessage };
}
