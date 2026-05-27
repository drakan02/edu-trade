import React, { KeyboardEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProductById } from "../data/products";
import { readMessages, useMessages } from "../hooks/useMessages";
import { BRAND, Message } from "../types";

interface ConversationSummary {
  key: string;
  productId: string;
  productTitle: string;
  productImage: string;
  otherUserId: string;
  otherName: string;
  lastMessage: Message | null;
}

function buildConversationKey(productId: string, otherUserId: string): string {
  return `${productId}:${otherUserId}`;
}

export default function InboxPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedKey, setSelectedKey] = useState("");
  const [messageText, setMessageText] = useState("");
  const requestedProductId = searchParams.get("productId") ?? "";
  const requestedOtherUserId = searchParams.get("userId") ?? "";
  const requestedOtherName = searchParams.get("name") ?? "Người bán";
  const requestedKey =
    requestedProductId && requestedOtherUserId ? buildConversationKey(requestedProductId, requestedOtherUserId) : "";

  const conversations = useMemo<ConversationSummary[]>(() => {
    if (!user) return [];

    const grouped = new Map<string, ConversationSummary>();

    readMessages()
      .filter((message) => message.fromUserId === user.id || message.toUserId === user.id)
      .forEach((message) => {
        const product = getProductById(message.productId);
        const otherUserId = message.fromUserId === user.id ? message.toUserId : message.fromUserId;
        const otherName =
          message.fromUserId === user.id
            ? message.toName ?? (message.toUserId === product?.sellerId ? product.seller : requestedOtherName)
            : message.fromName;
        const key = buildConversationKey(message.productId, otherUserId);
        const current = grouped.get(key);

        if (!current || !current.lastMessage || new Date(message.createdAt).getTime() > new Date(current.lastMessage.createdAt).getTime()) {
          grouped.set(key, {
            key,
            productId: message.productId,
            productTitle: product?.title ?? "Sản phẩm đã xóa",
            productImage: product?.image ?? "/placeholder.jpg",
            otherUserId,
            otherName,
            lastMessage: message,
          });
        }
      });

    if (requestedProductId && requestedOtherUserId && requestedOtherUserId !== user.id) {
      const requestedProduct = getProductById(requestedProductId);
      const key = buildConversationKey(requestedProductId, requestedOtherUserId);

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          productId: requestedProductId,
          productTitle: requestedProduct?.title ?? "Sản phẩm",
          productImage: requestedProduct?.image ?? "/placeholder.jpg",
          otherUserId: requestedOtherUserId,
          otherName: requestedOtherName,
          lastMessage: null,
        });
      }
    }

    return [...grouped.values()].sort((a, b) => {
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      return bTime - aTime;
    });
  }, [refreshToken, requestedOtherName, requestedOtherUserId, requestedProductId, user]);

  const selectedConversation =
    conversations.find((conversation) => conversation.key === selectedKey) ??
    conversations.find((conversation) => conversation.key === requestedKey) ??
    conversations[0];
  const { conversation, sendMessage } = useMessages(
    selectedConversation?.productId ?? "",
    user?.id,
    selectedConversation?.otherUserId ?? "",
    selectedConversation?.otherName ?? "Người bán",
  );

  function handleSendMessage(): void {
    if (!user || !selectedConversation || !messageText.trim()) return;
    sendMessage(messageText, user.name);
    setMessageText("");
    setRefreshToken((value) => value + 1);
  }

  function handleMessageKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  }

  if (!user) return null;

  return (
    <main className="page">
      <h1 style={{ fontSize: "1.7rem", marginBottom: "1.25rem" }}>Hộp thư</h1>

      {conversations.length === 0 ? (
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.5rem" }}>💬</p>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Chưa có cuộc trò chuyện nào.
          </p>
        </section>
      ) : (
        <section style={{ display: "grid", gridTemplateColumns: "minmax(260px, 360px) minmax(0, 1fr)", gap: "1rem" }}>
          <aside className="card" style={{ overflow: "hidden", cursor: "default" }}>
            {conversations.map((item) => {
              const isSelected = item.key === selectedConversation?.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedKey(item.key)}
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "56px minmax(0, 1fr)",
                    gap: "0.75rem",
                    alignItems: "center",
                    padding: "0.85rem",
                    border: 0,
                    borderBottom: "1px solid var(--gray-200)",
                    background: isSelected ? "var(--primary-light)" : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--radius)" }}
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <strong className="line-clamp-2" style={{ fontSize: "0.9rem" }}>
                      {item.otherName}
                    </strong>
                    <span className="line-clamp-2" style={{ color: "var(--gray-600)", fontSize: "0.82rem" }}>
                      {item.productTitle}
                    </span>
                    <span className="line-clamp-2" style={{ color: "var(--gray-500)", fontSize: "0.78rem" }}>
                      {item.lastMessage?.text ?? "Bắt đầu cuộc trò chuyện"}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <section className="card" style={{ padding: "1rem", cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem" }}>{selectedConversation?.otherName}</h2>
                {selectedConversation ? (
                  <Link to={`/san-pham/${selectedConversation.productId}`} className="muted" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    {selectedConversation.productTitle}
                  </Link>
                ) : null}
              </div>
            </div>

            <div
              style={{
                minHeight: 320,
                maxHeight: 420,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
                padding: "0.9rem",
                marginBottom: "0.9rem",
                borderRadius: "var(--radius)",
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
              }}
            >
              {conversation.length === 0 ? (
                <p className="muted" style={{ textAlign: "center", marginTop: "8rem" }}>
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.
                </p>
              ) : (
                conversation.map((message) => {
                  const isMine = message.fromUserId === user.id;
                  return (
                    <div key={message.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <div
                        style={{
                          maxWidth: "min(78%, 520px)",
                          padding: "0.65rem 0.8rem",
                          borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: isMine ? BRAND.primary : "#fff",
                          color: isMine ? "#fff" : "var(--gray-900)",
                          border: isMine ? "none" : "1px solid var(--gray-200)",
                        }}
                      >
                        <p style={{ fontSize: "0.9rem" }}>{message.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <input
                value={messageText}
                placeholder="Nhập tin nhắn..."
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleMessageKeyDown}
              />
              <button type="button" className="btn btn-primary" disabled={!messageText.trim()} onClick={handleSendMessage}>
                Gửi
              </button>
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
