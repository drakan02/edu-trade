import React, { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../hooks/useWishlist";
import { BRAND, CATEGORIES, Product } from "../types";

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number): string {
  return price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { isWished, toggle } = useWishlist(user?.id);
  const categoryLabel = CATEGORIES.find((category) => category.value === product.category)?.label ?? product.category;

  function handleWishlistClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      alert("Đăng nhập để lưu sản phẩm yêu thích.");
      return;
    }

    toggle(product.id);
  }

  return (
    <Link to={`/san-pham/${product.id}`} className="card" style={{ display: "block", position: "relative" }}>
      <div style={{ aspectRatio: "4 / 3", background: "var(--gray-100)", overflow: "hidden" }}>
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(event) => {
            event.currentTarget.src = "/placeholder.jpg";
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={isWished(product.id) ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        title={isWished(product.id) ? "Bỏ yêu thích" : "Yêu thích"}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 34,
          height: 34,
          border: "1px solid rgba(255,255,255,0.8)",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: "1rem",
        }}
      >
        {isWished(product.id) ? "❤️" : "🤍"}
      </button>

      <div style={{ padding: "0.85rem" }}>
        <p style={{ color: "var(--gray-500)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.35rem" }}>
          {categoryLabel}
        </p>
        <h3 className="line-clamp-2" style={{ minHeight: "2.5rem", fontSize: "0.95rem", lineHeight: 1.35 }}>
          {product.title}
        </h3>
        <p style={{ color: BRAND.primary, fontSize: "1.05rem", fontWeight: 800, marginTop: "0.5rem" }}>
          {formatPrice(product.price)}
        </p>
        <p className="line-clamp-2" style={{ color: "var(--gray-500)", fontSize: "0.78rem", marginTop: "0.45rem" }}>
          📍 {product.location}
        </p>
      </div>
    </Link>
  );
}
