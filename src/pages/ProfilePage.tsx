import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { deleteProduct, getProductsByUser } from "../data/products";
import { BRAND, Product } from "../types";

function formatPrice(price: number): string {
  return price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) {
      setProducts(getProductsByUser(user.id));
    }
  }, [user]);

  function handleDelete(productId: string): void {
    if (!confirm("Bạn chắc chắn muốn xóa tin này?")) return;
    deleteProduct(productId);
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  }

  if (!user) return null;

  return (
    <main className="page">
      <section
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1.35rem",
          marginBottom: "1.5rem",
          cursor: "default",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: BRAND.primary,
            color: "#fff",
            fontSize: "1.8rem",
            flex: "0 0 auto",
          }}
        >
          👤
        </div>
        <div>
          <h1 style={{ fontSize: "1.35rem" }}>{user.name}</h1>
          <p className="muted">{user.email}</p>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.15rem" }}>
            Thành viên từ {new Date(user.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem" }}>Tin do bạn đăng ({products.length})</h2>
        <Link to="/dang-tin" className="btn btn-primary">
          + Đăng tin
        </Link>
      </div>

      {products.length === 0 ? (
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.5rem" }}>📭</p>
          <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
            Bạn chưa đăng tin nào.
          </p>
          <Link to="/dang-tin" className="btn btn-primary">
            Đăng tin đầu tiên
          </Link>
        </section>
      ) : (
        <section style={{ display: "grid", gap: "0.85rem" }}>
          {products.map((product) => (
            <article
              key={product.id}
              className="card profile-product-item"
            >
              <img
                src={product.image}
                alt={product.title}
                style={{ width: 88, height: 72, objectFit: "cover", borderRadius: "var(--radius)" }}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/placeholder.jpg";
                }}
              />
              <div style={{ minWidth: 0 }}>
                <Link to={`/san-pham/${product.id}`} className="line-clamp-2" style={{ fontWeight: 800 }}>
                  {product.title}
                </Link>
                <p style={{ color: BRAND.primary, fontWeight: 900, marginTop: "0.25rem" }}>{formatPrice(product.price)}</p>
                <p className="muted" style={{ fontSize: "0.8rem" }}>
                  {new Date(product.createdAt).toLocaleDateString("vi-VN")} · {product.location}
                </p>
              </div>
              <div className="profile-product-actions">
                <Link to={`/san-pham/${product.id}`} className="btn btn-ghost">
                  Xem
                </Link>
                <Link to={`/sua-tin/${product.id}`} className="btn btn-ghost">
                  Sửa
                </Link>
                <button type="button" onClick={() => handleDelete(product.id)} className="btn btn-danger">
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
