export type ProductDTO = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  minStock: number;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  isActive: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl: string | null;
};

export type PaymentType = "CASH" | "CARD";

export type SaleDTO = {
  id: string;
  number: number;
  total: number;
  paymentType: PaymentType;
  cashGiven: number | null;
  changeGiven: number | null;
  createdAt: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
};

export type StatsDTO = {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  monthTotal: number;
  cashTotal: number;
  cardTotal: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  dailyTotals: { date: string; total: number }[];
  lowStock: { id: string; name: string; sku: string; stock: number; minStock: number }[];
};
