import React, { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../data/products";
import { BRAND } from "../types";

export default function SellerPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [searchParams] = useSearchParams();
  const requestedSellerName = searchParams.get("name") ?? "Người bán";

  const sellerProducts = useMemo(() => {
    if (!sellerId) return [];

    return getAllProducts()
      .filter((product) => {
        if (sellerId === "seed") return product.seller === requestedSellerName;
        return product.sellerId === sellerId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sellerId, requestedSellerName]);

  const sellerName = sellerProducts[0]?.seller ?? requestedSellerName;
  const sellerLocation = sellerProducts[0]?.location ?? "Chưa có địa điểm";
  const initials = sellerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="page">
      <Link to="/" className="muted" style={{ display: "inline-block", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>
        ← Quay lại
      </Link>

      <section className="card" style={{ padding: "1.35rem", marginBottom: "1.5rem", cursor: "default" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: BRAND.primary,
              color: "#fff",
              fontSize: "1.35rem",
              fontWeight: 900,
            }}
          >
            {initials || "NB"}
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>{sellerName}</h1>
            <p className="muted">{sellerLocation}</p>
            <p className="muted" style={{ fontSize: "0.875rem", marginTop: "0.2rem" }}>
              {sellerProducts.length} tin đang hiển thị
            </p>
          </div>
        </div>
      </section>

      <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Tin của người bán</h2>

      {sellerProducts.length > 0 ? (
        <section className="product-grid">
          {sellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.5rem" }}>📭</p>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Chưa có tin nào từ người bán này.
          </p>
        </section>
      )}
    </main>
  );
}
