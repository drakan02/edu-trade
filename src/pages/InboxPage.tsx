import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
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
  const [messages, setMessages] = useState<Message[]>(() => readMessages());
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedKey, setSelectedKey] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const requestedProductId = searchParams.get("productId") ?? "";
  const requestedOtherUserId = searchParams.get("userId") ?? "";
  const requestedOtherName = searchParams.get("name") ?? "Người bán";
  const requestedKey =
    requestedProductId && requestedOtherUserId ? buildConversationKey(requestedProductId, requestedOtherUserId) : "";

  // Mobile navigation state
  const [mobileShowChat, setMobileShowChat] = useState(!!requestedKey);

  const conversations = useMemo<ConversationSummary[]>(() => {
    if (!user) return [];

    const grouped = new Map<string, ConversationSummary>();

    messages
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
  }, [refreshToken, messages, requestedOtherName, requestedOtherUserId, requestedProductId, user]);

  const selectedConversation =
    conversations.find((conversation) => conversation.key === selectedKey) ??
    conversations.find((conversation) => conversation.key === requestedKey) ??
    conversations[0];
  const { conversation, sendMessage, reactToMessage } = useMessages(
    selectedConversation?.productId ?? "",
    user?.id,
    selectedConversation?.otherUserId ?? "",
    selectedConversation?.otherName ?? "Người bán",
    messages,
    setMessages,
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on conversation change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation.length]);

  function handleSendMessage(): void {
    if (!user || !selectedConversation || !messageText.trim()) return;
    sendMessage(messageText, user.name);
    setMessageText("");
    setRefreshToken((value) => value + 1);
  }

  function handleMessageKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
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
        <section className="inbox-layout" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 360px) minmax(0, 1fr)", gap: "1rem" }}>
          <aside className={`card inbox-sidebar ${mobileShowChat ? "hidden-mobile" : ""}`} style={{ overflow: "hidden", cursor: "default" }}>
            {conversations.map((item) => {
              const isSelected = item.key === selectedConversation?.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelectedKey(item.key);
                    setMobileShowChat(true);
                  }}
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
                      event.currentTarget.onerror = null;
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

          <section className={`card inbox-chat ${!mobileShowChat ? "hidden-mobile" : ""}`} style={{ padding: "1rem", cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-ghost inbox-back-btn"
                onClick={() => setMobileShowChat(false)}
                style={{ display: "none" }}
              >
                ← Trở lại
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: "1.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedConversation?.otherName}
                </h2>
                {selectedConversation ? (
                  <Link to={`/san-pham/${selectedConversation.productId}`} className="muted" style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                padding: "2.2rem 0.9rem",
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
                <>
                  {conversation.map((message) => {
                    const isMine = message.fromUserId === user.id;
                    const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

                    return (
                      <div
                        key={message.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isMine ? "flex-end" : "flex-start",
                          position: "relative",
                          marginBlock: "0.2rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            maxWidth: "100%",
                          }}
                        >
                          {/* Reaction Floating Picker */}
                          {activeReactionPickerId === message.id && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: "calc(100% - 2px)",
                                right: isMine ? "10px" : "auto",
                                left: !isMine ? "10px" : "auto",
                                background: "#fff",
                                border: "1px solid var(--gray-200)",
                                borderRadius: "20px",
                                padding: "4px 8px",
                                display: "flex",
                                gap: "0.4rem",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                zIndex: 10,
                              }}
                            >
                              {["❤️", "👍", "😂", "😮", "😢", "🙏"].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    reactToMessage(message.id, emoji);
                                    setActiveReactionPickerId(null);
                                  }}
                                  style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontSize: "1.15rem",
                                    transition: "transform 0.1s ease",
                                  }}
                                  className="reaction-emoji-btn"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}

                          {isMine ? (
                            <>
                              {/* Reaction Trigger Button */}
                              <button
                                type="button"
                                onClick={() => setActiveReactionPickerId(activeReactionPickerId === message.id ? null : message.id)}
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  fontSize: "0.95rem",
                                  padding: "0.25rem",
                                  opacity: activeReactionPickerId === message.id ? 1 : 0.4,
                                  transition: "opacity 0.15s ease",
                                }}
                                className="reaction-trigger-btn"
                                title="Bày tỏ cảm xúc"
                              >
                                😀
                              </button>

                              {/* Message text bubble */}
                              <div
                                style={{
                                  maxWidth: "min(78%, 520px)",
                                  padding: "0.65rem 0.8rem",
                                  borderRadius: "14px 14px 4px 14px",
                                  background: BRAND.primary,
                                  color: "#fff",
                                  border: "none",
                                }}
                              >
                                <p style={{ fontSize: "0.9rem" }}>{message.text}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Message text bubble */}
                              <div
                                style={{
                                  maxWidth: "min(78%, 520px)",
                                  padding: "0.65rem 0.8rem",
                                  borderRadius: "14px 14px 14px 4px",
                                  background: "#fff",
                                  color: "var(--gray-900)",
                                  border: "1px solid var(--gray-200)",
                                }}
                              >
                                <p style={{ fontSize: "0.9rem" }}>{message.text}</p>
                              </div>

                              {/* Reaction Trigger Button */}
                              <button
                                type="button"
                                onClick={() => setActiveReactionPickerId(activeReactionPickerId === message.id ? null : message.id)}
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  fontSize: "0.95rem",
                                  padding: "0.25rem",
                                  opacity: activeReactionPickerId === message.id ? 1 : 0.4,
                                  transition: "opacity 0.15s ease",
                                }}
                                className="reaction-trigger-btn"
                                title="Bày tỏ cảm xúc"
                              >
                                😀
                              </button>
                            </>
                          )}
                        </div>

                        {/* Docked Reactions List */}
                        {hasReactions && (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.2rem",
                              marginTop: "-4px",
                              marginRight: isMine ? "0px" : "auto",
                              marginLeft: !isMine ? "0px" : "auto",
                              background: "#fff",
                              border: "1px solid var(--gray-200)",
                              borderRadius: "12px",
                              padding: "2px 6px",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                              width: "fit-content",
                              zIndex: 1,
                            }}
                          >
                            {Object.entries(message.reactions || {}).map(([userId, emoji]) => (
                              <span
                                key={userId}
                                title={userId === user.id ? "Bạn" : "Đối phương"}
                                style={{ fontSize: "0.75rem", cursor: "default" }}
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </>
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
