import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isEduEmail, useAuth } from "../contexts/AuthContext";
import { BRAND } from "../types";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const shouldValidateEmail = email.trim().length > 0;
  const isEmailValid = !shouldValidateEmail || isEduEmail(email);
  const shouldValidatePasswordMatch = confirmPassword.length > 0;
  const passwordsMatch = !shouldValidatePasswordMatch || password === confirmPassword;
  const canSubmit = isEmailValid && passwordsMatch && password.length >= 6 && name.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!otpSent) {
      setError("");
      setOtp("");
      setOtpSent(true);
      return;
    }

    if (otp.trim() !== "123456") {
      setError("Mã OTP không đúng. Vui lòng nhập 123456 để xác nhận demo.");
      return;
    }

    const registerError = register(name, email, password);
    if (registerError) {
      setError(registerError);
      return;
    }

    navigate("/");
  }

  function resetOtpStep(): void {
    setOtpSent(false);
    setOtp("");
  }

  return (
    <main style={{ minHeight: "calc(100vh - 64px)", display: "grid", placeItems: "center", padding: "2rem 1rem" }}>
      <section className="card" style={{ width: "min(100%, 460px)", padding: "2rem", cursor: "default" }}>
        <div style={{ textAlign: "center", marginBottom: "1.35rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.35rem" }}>🎓</div>
          <h1 style={{ fontSize: "1.45rem" }}>Tạo tài khoản</h1>
          <p className="muted" style={{ fontSize: "0.875rem", marginTop: "0.3rem" }}>
            Chỉ email dạng @*.edu.vn được đăng ký, ví dụ mssv@sis.hust.edu.vn.
          </p>
        </div>

        {error ? (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        ) : null}

        {otpSent ? (
          <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
            Đã gửi mã OTP xác nhận tới {email.trim().toLowerCase()}. Đây là demo, nhập 123456 để hoàn tất đăng ký.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.9rem" }}>
          <label className="form-field">
            Họ tên
            <input
              required
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(event) => {
                setError("");
                resetOtpStep();
                setName(event.target.value);
              }}
              disabled={otpSent}
            />
          </label>

          <label className="form-field">
            Email
            <input
              type="email"
              required
              placeholder="mssv@sis.hust.edu.vn"
              value={email}
              className={!isEmailValid ? "error" : ""}
              onChange={(event) => {
                setError("");
                resetOtpStep();
                setEmail(event.target.value);
              }}
              disabled={otpSent}
            />
            {!isEmailValid ? (
              <span style={{ color: "var(--red)", fontSize: "0.78rem", fontWeight: 600 }}>
                Email phải có dạng @*.edu.vn, ví dụ mssv@sis.hust.edu.vn.
              </span>
            ) : null}
          </label>

          <label className="form-field">
            Mật khẩu
            <input
              type="password"
              required
              minLength={6}
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(event) => {
                setError("");
                resetOtpStep();
                setPassword(event.target.value);
              }}
              disabled={otpSent}
            />
          </label>

          <label className="form-field">
            Xác nhận mật khẩu
            <input
              type="password"
              required
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              className={!passwordsMatch ? "error" : ""}
              onChange={(event) => {
                setError("");
                resetOtpStep();
                setConfirmPassword(event.target.value);
              }}
              disabled={otpSent}
            />
            {!passwordsMatch ? (
              <span style={{ color: "var(--red)", fontSize: "0.78rem", fontWeight: 600 }}>
                Mật khẩu không khớp.
              </span>
            ) : null}
          </label>

          {otpSent ? (
            <label className="form-field">
              Mã OTP
              <input
                required
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(event) => {
                  setError("");
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                }}
              />
            </label>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={!canSubmit} style={{ minHeight: "2.75rem", marginTop: "0.2rem" }}>
            {otpSent ? "Xác nhận OTP" : "Đăng ký"}
          </button>

          {otpSent ? (
            <button type="button" className="btn btn-ghost" onClick={resetOtpStep}>
              Sửa thông tin
            </button>
          ) : null}
        </form>

        <p className="muted" style={{ textAlign: "center", fontSize: "0.875rem", marginTop: "1.25rem" }}>
          Đã có tài khoản?{" "}
          <Link to="/dang-nhap" style={{ color: BRAND.primary, fontWeight: 800 }}>
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
