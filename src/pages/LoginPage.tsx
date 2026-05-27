import React, { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BRAND } from "../types";

interface LoginLocationState {
  from?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LoginLocationState | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const loginError = await login(email, password);

    if (loginError) {
      setError(loginError);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", display: "grid", placeItems: "center", padding: "2rem 1rem" }}>
      <section className="card" style={{ width: "min(100%, 420px)", padding: "2rem", cursor: "default" }}>
        <div style={{ textAlign: "center", marginBottom: "1.35rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.35rem" }}>🎓</div>
          <h1 style={{ fontSize: "1.45rem" }}>Đăng nhập EduTrade</h1>
          <p className="muted" style={{ fontSize: "0.875rem", marginTop: "0.3rem" }}>
            Dùng email sinh viên để mở liên hệ, wishlist và chat.
          </p>
        </div>

        <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
          Chưa có tài khoản?{" "}
          <Link to="/dang-ky" style={{ color: BRAND.dark, fontWeight: 800 }}>
            Đăng ký bằng email .edu.vn
          </Link>
        </div>

        {error ? (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.9rem" }}>
          <label className="form-field">
            Email
            <input
              type="email"
              required
              placeholder="mssv@sis.hust.edu.vn"
              value={email}
              onChange={(event) => {
                setError("");
                setEmail(event.target.value);
              }}
            />
          </label>

          <label className="form-field">
            Mật khẩu
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(event) => {
                setError("");
                setPassword(event.target.value);
              }}
            />
          </label>

          <button type="submit" className="btn btn-primary" style={{ minHeight: "2.75rem", marginTop: "0.2rem" }}>
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
}
