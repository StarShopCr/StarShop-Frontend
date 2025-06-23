import { UserData } from "../types/user"

// Placeholder data - to be replaced with real data from backend
export const mockUserData: UserData = {
  name: "Kevin Latino",
  membershipType: "Premium Member",
  avatar: "/images/user-profile/avatar.jpg",
  stats: {
    totalOrders: 47,
    reviews: 32,
    wishlist: 15,
  },
  recentOrders: [
    {
      id: "ORD-001",
      title: "Premium Hoodie",
      date: "March 05, 2024",
      amount: 89.99,
      status: "processing",
    },
    {
      id: "ORD-002",
      title: "Urban Sneakers",
      date: "March 08, 2024",
      amount: 129.99,
      status: "delivered",
    },
    {
      id: "ORD-003",
      title: "Graphic T-Shirt",
      date: "March 12, 2024",
      amount: 29.99,
      status: "in-transit",
    },
    {
      id: "ORD-004",
      title: "Graphic T-Shirt",
      date: "March 12, 2024",
      amount: 29.99,
      status: "cancelled",
    },
  ],
  deliveries: [
    {
      id: 1,
      type: "Package Arriving",
      date: "March 15, 2024",
    },
    {
      id: 2,
      type: "Expected Delivery",
      date: "March 18, 2024",
    },
  ],
} 