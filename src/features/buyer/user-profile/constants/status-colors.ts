import { OrderStatus } from "../types/user"

export const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "processing":
      return {
        bg: "bg-yellow-900/30",
        text: "text-yellow-400"
      }
    case "in-transit":
      return {
        bg: "bg-blue-900/30",
        text: "text-blue-400"
      }
    case "delivered":
      return {
        bg: "bg-green-900/30",
        text: "text-green-400"
      }
    case "cancelled":
      return {
        bg: "bg-red-900/30",
        text: "text-red-400"
      }
    default:
      return {
        bg: "bg-gray-900/30",
        text: "text-gray-400"
      }
  }
}

export const getDeliveryIconAndColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'package arriving':
      return { icon: 'Calendar', color: 'blue' }
    case 'expected delivery':
      return { icon: 'Clock', color: 'green' }
    default:
      return { icon: 'Calendar', color: 'blue' }
  }
} 