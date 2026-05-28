import React, { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProductById, updateProduct } from "../data/products";
import { BRAND, CATEGORIES, CONDITIONS, Product } from "../types";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const product = id ? getProductById(id) : undefined;
  
  // Security check: only seller can edit
  const isOwner = product && user && product.sellerId === user.id;

  const [title, setTitle] = useState(product?.title ?? "");
  const [category, setCategory] = useState<Product["category"]>(product?.category ?? "sach");
  const [condition, setCondition] = useState<Product["condition"]>(product?.condition ?? "tot");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [phone, setPhone] = useState(product?.phone ?? "");
  const [location, setLocation] = useState(product?.location ?? "");
  const [imageDataUrl, setImageDataUrl] = useState(product?.image ?? "");
  const [imageName, setImageName] = useState(product ? "Ảnh hiện tại" : "");
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");

  if (!product || !isOwner) {
    return (
      <main className="page">
        <section className="card" style={{ padding: "3rem 1rem", textAlign: "center", cursor: "default" }}>
          <p style={{ fontSize: "2.75rem" }}>⚠️</p>
          <h1 style={{ fontSize: "1.25rem", marginTop: "0.4rem" }}>Không có quyền chỉnh sửa hoặc tin đăng không tồn tại</h1>
          <Link to="/ca-nhan" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Về trang cá nhân
          </Link>
        </section>
      </main>
    );
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Vui lòng chọn đúng file ảnh.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setImageError("Ảnh tối đa 1MB để lưu ổn định trong localStorage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
        setImageName(file.name);
        setImageError("");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!user || !product) return;
    if (!imageDataUrl) {
      setImageError("Vui lòng chọn ảnh sản phẩm.");
      return;
    }

    setSubmitError("");

    const updatedProduct: Product = {
      ...product,
      title: title.trim(),
      description: description.trim(),
      price: Math.max(0, Number(price) || 0),
      category,
      condition,
      image: imageDataUrl,
      phone: phone.trim(),
      location: location.trim(),
    };

    try {
      updateProduct(updatedProduct);
      navigate(`/san-pham/${product.id}`);
    } catch (err: any) {
      if (err.message === "QUOTA_EXCEEDED") {
        setSubmitError("Bộ nhớ trình duyệt (localStorage) đã đầy! Vui lòng tải ảnh nhỏ hơn hoặc xóa bớt tin cũ.");
      } else {
        setSubmitError("Đã xảy ra lỗi khi cập nhật tin. Vui lòng thử lại.");
      }
    }
  }

  return (
    <main className="page" style={{ maxWidth: 720 }}>
      <Link to="/ca-nhan" className="muted" style={{ display: "inline-block", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>
        ← Quay lại trang cá nhân
      </Link>
      <h1 style={{ fontSize: "1.7rem" }}>Chỉnh sửa tin đăng</h1>
      <p className="muted" style={{ marginTop: "0.35rem", marginBottom: "1.4rem" }}>
        Mã sản phẩm: <strong style={{ color: BRAND.primary }}>{product.id}</strong>
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
          <textarea rows={5} required value={description} placeholder="Mô tả tình trạng..." onChange={(event) => setDescription(event.target.value)} />
        </label>

        <label className="form-field">
          Ảnh sản phẩm
          <input type="file" accept="image/*" onChange={handleImageChange} />
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
              alt="Xem trước ảnh"
              style={{ width: 120, height: 90, objectFit: "cover", borderRadius: "var(--radius)" }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.jpg";
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 800 }}>Ảnh hiện tại/mới chọn</p>
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

        <button type="submit" className="btn btn-primary" style={{ minHeight: "2.85rem", fontSize: "1rem" }}>
          Lưu thay đổi
        </button>
      </form>
    </main>
  );
}
