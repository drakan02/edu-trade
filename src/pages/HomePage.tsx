import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../data/products";
import { CATEGORIES, Product } from "../types";

type SortKey = "newest" | "price-asc" | "price-desc";
type CategoryFilter = Product["category"] | "all";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const products = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const filteredProducts = getAllProducts().filter((product) => {
      const matchesSearch = !normalizedSearch || product.title.toLowerCase().includes(normalizedSearch);
      const matchesCategory = category === "all" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    return [...filteredProducts].sort((a, b) => {
      if (sortKey === "price-asc") return a.price - b.price;
      if (sortKey === "price-desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [category, search, sortKey]);

  return (
    <main className="page">
      <section
        style={{
          minHeight: 190,
          display: "grid",
          alignContent: "center",
          gap: "0.65rem",
          marginBottom: "1.5rem",
          padding: "2rem",
          borderRadius: "var(--radius)",
          color: "#fff",
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 48%, #1E40AF 100%)",
          boxShadow: "var(--shadow)",
        }}
      >
        <p style={{ fontWeight: 800, opacity: 0.9 }}>Chợ sinh viên demo</p>
        <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 3.3rem)", lineHeight: 1.05 }}>EduTrade</h1>
        <p style={{ maxWidth: 620, opacity: 0.94 }}>
          Mua bán sách, đồ điện tử, quần áo và nội thất giữa sinh viên. Liên hệ người bán chỉ mở cho tài khoản @*.edu.vn.
        </p>
      </section>

      <section style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", flex: "1 1 560px" }}>
          <button
            type="button"
            className={`btn ${category === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setCategory("all")}
          >
            Tất cả
          </button>
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`btn ${category === item.value ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Sắp xếp"
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          style={{ width: "auto", minWidth: 170 }}
        >
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </section>

      {search ? (
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
          Tìm kiếm "{search}" có {products.length} sản phẩm.
        </p>
      ) : null}

      {products.length > 0 ? (
        <section className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.5rem" }}>🔍</p>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Không tìm thấy sản phẩm phù hợp.
          </p>
        </section>
      )}
    </main>
  );
}
