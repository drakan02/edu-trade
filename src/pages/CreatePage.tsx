import React, { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { saveProduct } from "../data/products";
import { BRAND, CATEGORIES, CONDITIONS, Product } from "../types";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Product["category"]>("sach");
  const [condition, setCondition] = useState<Product["condition"]>("tot");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    setImageDataUrl("");
    setImageName("");
    setImageError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Vui lòng chọn đúng file ảnh.");
      event.target.value = "";
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setImageError("Ảnh tối đa 1MB để lưu ổn định trong localStorage.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
        setImageName(file.name);
        return;
      }

      setImageError("Không đọc được ảnh này. Vui lòng chọn ảnh khác.");
      event.target.value = "";
    };
    reader.onerror = () => {
      setImageError("Không đọc được ảnh này. Vui lòng chọn ảnh khác.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!user) return;
    if (!imageDataUrl) {
      setImageError("Vui lòng chọn ảnh sản phẩm.");
      return;
    }

    setSubmitError("");

    const product: Product = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      price: Math.max(0, Number(price) || 0),
      category,
      condition,
      image: imageDataUrl,
      sellerId: user.id,
      seller: user.name,
      phone: phone.trim(),
      location: location.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      saveProduct(product);
      navigate(`/san-pham/${product.id}`);
    } catch (err: any) {
      if (err.message === "QUOTA_EXCEEDED") {
        setSubmitError("Bộ nhớ trình duyệt (localStorage) đã đầy! Vui lòng xóa bớt tin cũ hoặc tải ảnh có kích thước nhỏ hơn.");
      } else {
        setSubmitError("Đã xảy ra lỗi khi đăng tin. Vui lòng thử lại.");
      }
    }
  }

  return (
    <main className="page" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.7rem" }}>Đăng tin bán hàng</h1>
      <p className="muted" style={{ marginTop: "0.35rem", marginBottom: "1.4rem" }}>
        Tên người bán: <strong style={{ color: BRAND.primary }}>{user?.name}</strong> · {user?.email}
      </p>

      {submitError ? (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "1rem", padding: "1.25rem", cursor: "default" }}>
        <label className="form-field">
          Tiêu đề
          <input required value={title} placeholder="VD: Sách Giải tích 1 còn mới" onChange={(event) => setTitle(event.target.value)} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <label className="form-field">
            Danh mục
            <select value={category} onChange={(event) => setCategory(event.target.value as Product["category"])}>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            Tình trạng
            <select value={condition} onChange={(event) => setCondition(event.target.value as Product["condition"])}>
              {CONDITIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          Giá
          <input type="number" min="0" required value={price} placeholder="0 = miễn phí" onChange={(event) => setPrice(event.target.value)} />
        </label>

        <label className="form-field">
          Mô tả
          <textarea rows={5} required value={description} placeholder="Mô tả tình trạng, phụ kiện, thời gian sử dụng..." onChange={(event) => setDescription(event.target.value)} />
        </label>

        <label className="form-field">
          Ảnh sản phẩm
          <input type="file" accept="image/*" required onChange={handleImageChange} />
          {imageError ? (
            <span style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 700 }}>{imageError}</span>
          ) : null}
        </label>

        {imageDataUrl ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px minmax(0, 1fr)",
              gap: "0.9rem",
              alignItems: "center",
              padding: "0.75rem",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius)",
              background: "var(--gray-50)",
            }}
          >
            <img
              src={imageDataUrl}
              alt="Xem trước ảnh sản phẩm"
              style={{ width: 120, height: 90, objectFit: "cover", borderRadius: "var(--radius)" }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.jpg";
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 800 }}>Ảnh đã chọn</p>
              <p className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.875rem" }}>
                {imageName}
              </p>
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <label className="form-field">
            SĐT
            <input type="tel" required value={phone} placeholder="09xxxxxxxx" onChange={(event) => setPhone(event.target.value)} />
          </label>

          <label className="form-field">
            Địa điểm
            <input required value={location} placeholder="VD: ĐH Bách Khoa HN" onChange={(event) => setLocation(event.target.value)} />
          </label>
        </div>

        <div className="alert alert-info">Ảnh là bắt buộc khi đăng tin và được lưu trong trình duyệt của bạn.</div>

        <button type="submit" className="btn btn-primary" style={{ minHeight: "2.85rem", fontSize: "1rem" }}>
          Đăng tin
        </button>
      </form>
    </main>
  );
}
