import { Product } from "../types";

const STORAGE_KEY = "edutrade_products";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "seed-1",
    title: "Giải tích 1 - Nguyễn Đình Trí",
    description: "Sách còn mới 95%, không ghi chép, đầy đủ bài tập và lời giải.",
    price: 35000,
    category: "sach",
    condition: "tot",
    image: "https://sachtiengviet.com/cdn/shop/products/45abc311e520118c1c01af3dd016bdb4.jpg?v=1693185520",
    sellerId: "seed",
    seller: "Minh Tuấn",
    phone: "0912345678",
    location: "ĐH Bách Khoa HN",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "seed-2",
    title: "Tai nghe Sony WH-1000XM3",
    description: "Chống ồn ANC, pin 30h, tặng túi đựng và cáp sạc.",
    price: 2800000,
    category: "dien-tu",
    condition: "tot",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/o/sony_wh-1000xm4_2.png",
    sellerId: "seed",
    seller: "Lan Anh",
    phone: "0987654321",
    location: "ĐH Ngoại Thương HN",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "seed-3",
    title: "Áo hoodie size L",
    description: "Mặc 3-4 lần, còn đẹp, màu xanh navy. Wash được máy.",
    price: 120000,
    category: "quan-ao",
    condition: "tot",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    sellerId: "seed",
    seller: "Quang Huy",
    phone: "0933111222",
    location: "ĐH Kinh tế QD",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "seed-4",
    title: "Laptop Asus VivoBook 15",
    description: "Core i5 gen 11, 8GB RAM, 512GB SSD, màn 15.6 FHD, pin khoảng 6h.",
    price: 8500000,
    category: "dien-tu",
    condition: "binh-thuong",
    image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/s/s/ssss_1__1_24.png",
    sellerId: "seed",
    seller: "Thành Long",
    phone: "0944222333",
    location: "ĐH Bách Khoa HN",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "seed-5",
    title: "Bàn học gấp gọn IKEA",
    description: "Gỗ MDF, 120x60cm, chân sắt, còn tốt, tháo lắp dễ.",
    price: 450000,
    category: "noi-that",
    condition: "binh-thuong",
    image: "https://product.hstatic.net/200000302896/product/bjorkasen_beea6686ed6e4adeb1b53c515efca8c4.jpg",
    sellerId: "seed",
    seller: "Phương Linh",
    phone: "0955333444",
    location: "Cầu Giấy, HN",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "seed-6",
    title: "Vật lý đại cương tập 1+2",
    description: "Bộ 2 cuốn, ghi chú nhẹ bằng bút chì, dễ tẩy.",
    price: 55000,
    category: "sach",
    condition: "binh-thuong",
    image: "https://bizweb.dktcdn.net/100/362/945/products/22962519643091565cb115a29a2b2f29-1751277793931.jpg?v=1752353636120",
    sellerId: "seed",
    seller: "Hà My",
    phone: "0966444555",
    location: "ĐH Khoa học TN",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: "seed-7",
    title: "Máy tính Casio 580VN X2",
    description: "Còn bảo hành, đầy đủ phụ kiện hộp, pin mới thay.",
    price: 180000,
    category: "dien-tu",
    condition: "tot",
    image: "https://media.meta.vn/Data/image/2020/07/27/may-tinh-khoa-hoc-casio-fx-580vn-x.png",
    sellerId: "seed",
    seller: "Nam Anh",
    phone: "0977555666",
    location: "ĐH Xây Dựng HN",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "seed-8",
    title: "Ghế xoay văn phòng",
    description: "Lưng lưới, tay vịn điều chỉnh, bánh xe trơn. Mang ra cửa nhà.",
    price: 350000,
    category: "noi-that",
    condition: "binh-thuong",
    image: "https://noithatvito.vn/wp-content/uploads/2021/06/1-6-510x510.webp",
    sellerId: "seed",
    seller: "Bích Thảo",
    phone: "0988666777",
    location: "Đống Đa, HN",
    createdAt: new Date(Date.now() - 500000000).toISOString(),
  },
];

function readUserProducts(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function writeUserProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
}

export function getAllProducts(): Product[] {
  return [...readUserProducts(), ...MOCK_PRODUCTS];
}

export function saveProduct(product: Product): void {
  writeUserProducts([product, ...readUserProducts()]);
}

export function deleteProduct(id: string): void {
  writeUserProducts(readUserProducts().filter((product) => product.id !== id));
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((product) => product.id === id);
}

export function getProductsByUser(userId: string): Product[] {
  return readUserProducts().filter((product) => product.sellerId === userId && product.sellerId !== "seed");
}
