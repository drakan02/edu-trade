export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "sach" | "dien-tu" | "quan-ao" | "noi-that" | "khac";
  condition: "moi" | "tot" | "binh-thuong" | "cu";
  image: string;
  sellerId: string;
  seller: string;
  phone: string;
  location: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Message {
  id: string;
  productId: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName?: string;
  text: string;
  createdAt: string;
  reactions?: Record<string, string>;
}

export interface ProductComment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  parentId?: string;
}

export const CATEGORIES = [
  { value: "sach", label: "📚 Sách" },
  { value: "dien-tu", label: "💻 Điện tử" },
  { value: "quan-ao", label: "👕 Quần áo" },
  { value: "noi-that", label: "🪑 Nội thất" },
  { value: "khac", label: "📦 Khác" },
] as const;

export const CONDITIONS = [
  { value: "moi", label: "✨ Mới" },
  { value: "tot", label: "👍 Tốt" },
  { value: "binh-thuong", label: "😐 Bình thường" },
  { value: "cu", label: "🔧 Cũ" },
] as const;

export const BRAND = {
  name: "EduTrade",
  primary: "#2563EB",
  light: "#EFF6FF",
  dark: "#1E40AF",
  accent: "#DBEAFE",
};
