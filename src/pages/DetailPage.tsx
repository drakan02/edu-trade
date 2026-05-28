import React, { KeyboardEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById, deleteProduct } from "../data/products";
import { useAuth } from "../contexts/AuthContext";
import { useComments } from "../hooks/useComments";
import { useWishlist } from "../hooks/useWishlist";
import { BRAND, CATEGORIES, CONDITIONS } from "../types";

function formatPrice(price: number): string {
  return price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const product = id ? getProductById(id) : undefined;
  const { isWished, toggle } = useWishlist(user?.id);
  const { comments, addComment, deleteComment } = useComments(id ?? "");
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const rootComments = React.useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );

  const repliesByParent = React.useMemo(() => {
    const map = new Map<string, typeof comments>();
    comments.forEach((c) => {
      if (c.parentId) {
        const list = map.get(c.parentId) || [];
        list.push(c);
        map.set(c.parentId, list);
      }
    });
    return map;
  }, [comments]);

  if (!product) {
    return (
      <main className="page">
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.75rem" }}>😕</p>
          <h1 style={{ fontSize: "1.25rem", marginTop: "0.4rem" }}>Không tìm thấy sản phẩm</h1>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Về trang chủ
          </Link>
        </section>
      </main>
    );
  }

  const currentProduct = product;
  const categoryLabel = CATEGORIES.find((category) => category.value === currentProduct.category)?.label ?? currentProduct.category;
  const conditionLabel = CONDITIONS.find((condition) => condition.value === currentProduct.condition)?.label ?? currentProduct.condition;
  const isOwner = user?.id === currentProduct.sellerId;

  function handleDeleteProduct(): void {
    if (!confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) return;
    deleteProduct(currentProduct.id);
    navigate("/");
  }

  function handleWishlistClick(): void {
    if (!user) {
      navigate("/dang-nhap", { state: { from: `/san-pham/${currentProduct.id}` } });
      return;
    }

    toggle(currentProduct.id);
  }

  function handleAddComment(): void {
    if (!user || !commentText.trim()) return;
    addComment(commentText, user.id, user.name);
    setCommentText("");
  }

  function handleCommentKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleAddComment();
    }
  }

  function handleSendReply(parentId: string): void {
    if (!user || !replyText.trim()) return;
    addComment(replyText, user.id, user.name, parentId);
    setReplyText("");
    setReplyingToId(null);
  }

  return (
    <main className="page">
      <Link to="/" className="muted" style={{ display: "inline-block", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>
        ← Quay lại
      </Link>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        <div className="card" style={{ aspectRatio: "1 / 1", cursor: "default" }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder.jpg";
            }}
          />
        </div>

        <div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
            <span className="badge badge-blue">{categoryLabel}</span>
            <span className="badge badge-green">{conditionLabel}</span>
          </div>

          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", lineHeight: 1.15 }}>{product.title}</h1>
          <p style={{ color: BRAND.primary, fontSize: "2rem", fontWeight: 900, marginTop: "0.8rem" }}>
            {formatPrice(product.price)}
          </p>

          <p style={{ color: "var(--gray-700)", marginTop: "1rem", lineHeight: 1.75 }}>{product.description}</p>

          <dl
            style={{
              display: "grid",
              gap: "0.65rem",
              margin: "1.25rem 0",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--gray-200)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.75rem" }}>
              <dt className="muted">Người bán</dt>
              <dd>
                <Link
                  to={`/nguoi-ban/${encodeURIComponent(product.sellerId)}?name=${encodeURIComponent(product.seller)}`}
                  style={{ color: BRAND.primary, fontWeight: 900 }}
                >
                  {product.seller}
                </Link>
              </dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.75rem" }}>
              <dt className="muted">Địa điểm</dt>
              <dd>{product.location}</dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.75rem" }}>
              <dt className="muted">Ngày đăng</dt>
              <dd>{new Date(product.createdAt).toLocaleDateString("vi-VN")}</dd>
            </div>
          </dl>

          {!user ? (
            <div className="alert alert-info" style={{ display: "grid", gap: "0.8rem", marginBottom: "1rem" }}>
              <strong>🔒 Đăng nhập để xem thông tin liên hệ</strong>
              <span>Chỉ tài khoản sinh viên @*.edu.vn mới xem được SĐT người bán.</span>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <Link to="/dang-nhap" state={{ from: `/san-pham/${product.id}` }} className="btn btn-primary">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="btn btn-outline">
                  Đăng ký
                </Link>
              </div>
            </div>
          ) : (
            <>
              {isOwner || user.role === "admin" ? (
                <div className="alert alert-info" style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span>
                    {user.role === "admin"
                      ? isOwner
                        ? "🛡️ Đây là tin bạn đăng (Xem với quyền Admin)."
                        : "🛡️ Chế độ Quản trị viên: Bạn có quyền kiểm soát tin đăng này."
                      : "Đây là tin bạn đăng."}
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {isOwner && (
                      <Link to={`/sua-tin/${product.id}`} className="btn btn-ghost" style={{ flex: 1 }}>
                        ✏️ Sửa tin
                      </Link>
                    )}
                    <button type="button" onClick={handleDeleteProduct} className="btn btn-danger" style={{ flex: 1 }}>
                      🗑️ Xóa tin
                    </button>
                  </div>
                </div>
              ) : null}

              {!isOwner && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <a href={`tel:${product.phone}`} className="btn btn-primary">
                    📞 {product.phone}
                  </a>
                  <Link
                    to={`/hop-thu?productId=${encodeURIComponent(product.id)}&userId=${encodeURIComponent(product.sellerId)}&name=${encodeURIComponent(product.seller)}`}
                    className="btn btn-outline"
                  >
                    💬 Nhắn tin
                  </Link>
                </div>
              )}
            </>
          )}

          <button type="button" onClick={handleWishlistClick} className="btn btn-ghost" style={{ width: "100%" }}>
            {isWished(product.id) ? "❤️ Đã yêu thích" : "🤍 Lưu yêu thích"}
          </button>
        </div>
      </section>

      <section className="card" style={{ marginTop: "2rem", padding: "1.25rem", cursor: "default" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>💭 Bình luận ({comments.length})</h2>

        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
          {rootComments.length === 0 ? (
            <p className="muted" style={{ padding: "1rem", textAlign: "center", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)" }}>
              Chưa có bình luận nào.
            </p>
          ) : (
            rootComments.map((comment) => {
              const replies = repliesByParent.get(comment.id) || [];
              const isReplying = replyingToId === comment.id;

              return (
                <div key={comment.id} style={{ display: "grid", gap: "0.5rem" }}>
                  {/* Root Comment */}
                  <article
                    style={{
                      display: "grid",
                      gap: "0.3rem",
                      padding: "0.85rem",
                      border: "1px solid var(--gray-200)",
                      borderRadius: "var(--radius)",
                      background: "var(--gray-50)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                      <strong>{comment.userName}</strong>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>
                        {new Date(comment.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p style={{ color: "var(--gray-800)" }}>{comment.text}</p>
                    
                    {/* Actions: Reply & Delete */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                      {user && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setReplyingToId(isReplying ? null : comment.id);
                            setReplyText("");
                          }}
                          style={{
                            padding: "0.15rem 0.5rem",
                            minHeight: "1.7rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          💬 Trả lời
                        </button>
                      )}
                      {user && (user.id === comment.userId || user.role === "admin") && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
                              deleteComment(comment.id);
                            }
                          }}
                          style={{
                            padding: "0.15rem 0.5rem",
                            minHeight: "1.7rem",
                            fontSize: "0.75rem",
                            color: "var(--red)",
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  </article>

                  {/* Replies Thread */}
                  {replies.length > 0 && (
                    <div
                      style={{
                        marginLeft: "1.5rem",
                        display: "grid",
                        gap: "0.5rem",
                        borderLeft: "2px solid var(--gray-200)",
                        paddingLeft: "0.85rem",
                      }}
                    >
                      {replies.map((reply) => (
                        <article
                          key={reply.id}
                          style={{
                            display: "grid",
                            gap: "0.3rem",
                            padding: "0.65rem 0.75rem",
                            border: "1px solid var(--gray-200)",
                            borderRadius: "var(--radius)",
                            background: "#fff",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                            <strong>{reply.userName}</strong>
                            <span className="muted" style={{ fontSize: "0.75rem" }}>
                              {new Date(reply.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          <p style={{ color: "var(--gray-800)", fontSize: "0.88rem" }}>{reply.text}</p>

                          {/* Actions: Delete for reply */}
                          {user && (user.id === reply.userId || user.role === "admin") && (
                            <div style={{ marginTop: "0.25rem" }}>
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => {
                                  if (confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
                                    deleteComment(reply.id);
                                  }
                                }}
                                style={{
                                  padding: "0.15rem 0.5rem",
                                  minHeight: "1.7rem",
                                  fontSize: "0.75rem",
                                  color: "var(--red)",
                                }}
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Reply Editor Form */}
                  {isReplying && (
                    <div
                      style={{
                        marginLeft: "1.5rem",
                        display: "grid",
                        gap: "0.5rem",
                        padding: "0.75rem",
                        borderLeft: "2px solid var(--primary-accent)",
                      }}
                    >
                      <input
                        value={replyText}
                        placeholder={`Trả lời bình luận của ${comment.userName}...`}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            handleSendReply(comment.id);
                          }
                        }}
                        style={{ fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={!replyText.trim()}
                          onClick={() => handleSendReply(comment.id)}
                          style={{ minHeight: "2rem", padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                        >
                          Gửi
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setReplyingToId(null)}
                          style={{ minHeight: "2rem", padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {user ? (
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <input
              value={commentText}
              placeholder="Viết bình luận..."
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={handleCommentKeyDown}
            />
            <button type="button" className="btn btn-primary" disabled={!commentText.trim()} onClick={handleAddComment}>
              Gửi
            </button>
          </div>
        ) : (
          <div className="alert alert-info">
            <Link to="/dang-nhap" state={{ from: `/san-pham/${product.id}` }} style={{ fontWeight: 900 }}>
              Đăng nhập
            </Link>{" "}
            để bình luận về sản phẩm này.
          </div>
        )}
      </section>
    </main>
  );
}
