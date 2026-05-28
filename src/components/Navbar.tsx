import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BRAND } from "../types";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");

  const searchParamValue = searchParams.get("search") ?? "";
  useEffect(() => {
    setSearchQuery(searchParamValue);
  }, [searchParamValue]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : "/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          🎓 EduTrade
        </Link>

        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <input
            name="q"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/dang-tin" className="btn btn-primary navbar-btn-create" title="Đăng tin">
                <span>+ Đăng tin</span>
              </Link>
              <Link to="/yeu-thich" className="btn btn-ghost" aria-label="Yêu thích" title="Yêu thích">
                ❤️
              </Link>
              <Link to="/hop-thu" className="btn btn-ghost" aria-label="Hộp thư" title="Hộp thư">
                💬
              </Link>
              <Link to="/ca-nhan" title={user.name} className="navbar-profile">
                <span aria-hidden="true">👤</span>
                <span className="navbar-profile-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
              </Link>
              <button type="button" onClick={logout} className="btn btn-ghost navbar-btn-logout" title="Thoát">
                <span>Thoát</span>
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
