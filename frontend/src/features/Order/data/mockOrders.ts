import type {Order} from '../types'

export const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "ORD-1001",
    customerId: "customer-1",
    items: [
      {
        productId: "p1",
        productName: "Wireless Headphones",
        productImage:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        quantity: 2,
        unitPrice: 69.99,
      },
    ],
    totalAmount: 139.98,
    status: "confirmed",
    createdAt: "2026-10-25T10:30:00.000Z",
  },
  {
    id: "order-2",
    orderNumber: "ORD-1002",
    customerId: "customer-1",
    items: [
      {
        productId: "p3",
        productName: "Classic Sneakers",
        productImage:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        quantity: 1,
        unitPrice: 59.99,
      },
      {
        productId: "p8",
        productName: "Cotton T-Shirt",
        productImage:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        quantity: 2,
        unitPrice: 24.99,
      },
    ],
    totalAmount: 109.97,
    status: "processing",
    createdAt: "2026-10-26T14:15:00.000Z",
  },
  {
    id: "order-3",
    orderNumber: "ORD-1003",
    customerId: "customer-1",
    items: [
      {
        productId: "p6",
        productName: "Ceramic Coffee Mug",
        productImage:
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
        quantity: 3,
        unitPrice: 14.99,
      },
    ],
    totalAmount: 44.97,
    status: "delivered",
    createdAt: "2026-10-20T09:00:00.000Z",
  },
  {
    id: "order-4",
    orderNumber: "ORD-1004",
    customerId: "customer-1",
    items: [
      {
        productId: "p7",
        productName: "Portable Speaker",
        productImage:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
        quantity: 1,
        unitPrice: 49.99,
      },
    ],
    totalAmount: 49.99,
    status: "failed",
    createdAt: "2026-10-27T08:45:00.000Z",
  },
];
