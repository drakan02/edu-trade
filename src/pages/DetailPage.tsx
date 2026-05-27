import React, { KeyboardEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../data/products";
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
  const { comments, addComment } = useComments(id ?? "");
  const [commentText, setCommentText] = useState("");

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
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddComment();
    }
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
          ) : isOwner ? (
            <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
              Đây là tin bạn đăng.{" "}
              <Link to="/ca-nhan" style={{ fontWeight: 900 }}>
                Quản lý tại trang cá nhân
              </Link>
            </div>
          ) : (
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

          <button type="button" onClick={handleWishlistClick} className="btn btn-ghost" style={{ width: "100%" }}>
            {isWished(product.id) ? "❤️ Đã yêu thích" : "🤍 Lưu yêu thích"}
          </button>
        </div>
      </section>

      <section className="card" style={{ marginTop: "2rem", padding: "1.25rem", cursor: "default" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>💭 Bình luận ({comments.length})</h2>

        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
          {comments.length === 0 ? (
            <p className="muted" style={{ padding: "1rem", textAlign: "center", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)" }}>
              Chưa có bình luận nào.
            </p>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.id}
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
              </article>
            ))
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
