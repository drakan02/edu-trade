import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import { getAllProducts } from "../data/products";
import { useWishlist } from "../hooks/useWishlist";

export default function WishlistPage() {
  const { user } = useAuth();
  const { ids } = useWishlist(user?.id);
  const wishedProducts = getAllProducts().filter((product) => ids.includes(product.id));

  return (
    <main className="page">
      <h1 style={{ fontSize: "1.7rem", marginBottom: "1.25rem" }}>Yêu thích ({wishedProducts.length})</h1>

      {wishedProducts.length > 0 ? (
        <section className="product-grid">
          {wishedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.5rem" }}>🤍</p>
          <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
            Chưa có sản phẩm yêu thích.
          </p>
          <Link to="/" className="btn btn-primary">
            Khám phá sản phẩm
          </Link>
        </section>
      )}
    </main>
  );
}
