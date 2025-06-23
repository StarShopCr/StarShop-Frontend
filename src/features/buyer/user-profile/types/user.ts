export type OrderStatus = "processing" | "delivered" | "cancelled" | "in-transit"

export interface UserData {
  name: string
  membershipType: string
  avatar: string
  stats: {
    totalOrders: number
    reviews: number
    wishlist: number
  }
  recentOrders: {
    id: string
    title: string
    date: string
    amount: number
    status: OrderStatus
  }[]
  deliveries: {
    id: number
    type: string
    date: string
  }[]
}

export interface UserInfoCardProps {
  name: string
  membershipType: string
  avatar: string
}

export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
  description: string
  color: string
}

export interface UserOrderItemProps {
  id: string
  title: string
  date: string
  amount: number
  status: OrderStatus
}

export interface DeliveryCalendarProps {
  type: string
  date: string
}

export interface HeaderProps {
  title: string
  backLink?: string
  activeDate?: string
}

export interface GlowCardProps {
  children: React.ReactNode
} 