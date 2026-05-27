import React, { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BRAND } from "../types";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();

    navigate(query ? `/?search=${encodeURIComponent(query)}` : "/");
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.96)",
        borderBottom: "1px solid var(--gray-200)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="container"
        style={{
          minHeight: 64,
          display: "grid",
          gridTemplateColumns: "auto minmax(180px, 1fr) auto",
          alignItems: "center",
          gap: "0.85rem",
          padding: "0.65rem 0",
        }}
      >
        <Link to="/" style={{ color: BRAND.primary, fontSize: "1.2rem", fontWeight: 900, whiteSpace: "nowrap" }}>
          🎓 EduTrade
        </Link>

        <form onSubmit={handleSearchSubmit} style={{ display: "flex", minWidth: 0 }}>
          <input
            name="q"
            type="search"
            defaultValue={searchParams.get("search") ?? ""}
            placeholder="Tìm sách, laptop, quần áo..."
            aria-label="Tìm kiếm sản phẩm"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 0 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            aria-label="Tìm kiếm"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingInline: "0.85rem" }}
          >
            🔍
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
          {user ? (
            <>
              <Link to="/dang-tin" className="btn btn-primary">
                + Đăng tin
              </Link>
              <Link to="/yeu-thich" className="btn btn-ghost" aria-label="Yêu thích" title="Yêu thích" style={{ paddingInline: "0.75rem" }}>
                ❤️
              </Link>
              <Link to="/hop-thu" className="btn btn-ghost" aria-label="Hộp thư" title="Hộp thư" style={{ paddingInline: "0.75rem" }}>
                💬
              </Link>
              <Link
                to="/ca-nhan"
                title={user.name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  maxWidth: 150,
                  minHeight: "2.35rem",
                  padding: "0.45rem 0.7rem",
                  borderRadius: "999px",
                  background: BRAND.light,
                  border: `1px solid ${BRAND.accent}`,
                  color: BRAND.dark,
                  fontSize: "0.84rem",
                  fontWeight: 800,
                }}
              >
                <span aria-hidden="true">👤</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
              </Link>
              <button type="button" onClick={logout} className="btn btn-ghost">
                Thoát
              </button>
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="btn btn-outline">
                Đăng nhập
              </Link>
              <Link to="/dang-ky" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
