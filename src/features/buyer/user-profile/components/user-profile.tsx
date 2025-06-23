"use client"

import { Star, Heart, Calendar, Package } from "lucide-react"
import { mockUserData } from "../constants/mock-data"
import UserOrderItem from "./user-order-item"
import StatCard from "./stat-card"
import DeliveryCalendar from "./delivery-calendar"
import UserInfoCard from "./user-info-card"
import GlowCard from "./glow-card"
import Header from "./header"

const UserProfile: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Header
        title="My Profile"
        backLink="/dashboard"
        activeDate="March 2024"
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* User Info Section */}
        <div className="md:col-span-4">
          <GlowCard>
            <UserInfoCard
              name={mockUserData.name}
              membershipType={mockUserData.membershipType}
              avatar={mockUserData.avatar}
            />
          </GlowCard>

          {/* Shopping Activity */}
          <GlowCard>
            <h3 className="text-lg font-bold text-white mb-4">
              Shopping Activity
            </h3>
            <div className="space-y-4">
              <StatCard
                icon={Package}
                value={mockUserData.stats.totalOrders}
                label="Total Orders"
                description="Currently listed"
                color="blue"
              />
              <StatCard
                icon={Star}
                value={mockUserData.stats.reviews}
                label="Reviews Given"
                description="Customer feedback"
                color="yellow"
              />
              <StatCard
                icon={Heart}
                value={mockUserData.stats.wishlist}
                label="Wishlist Items"
                description="Saved for later"
                color="red"
              />
            </div>
          </GlowCard>
        </div>

        {/* Recent Orders Section */}
        <div className="md:col-span-8">
          <GlowCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-500" />
              Recent Orders
            </h3>
            <div className="space-y-4">
              {mockUserData.recentOrders.map((order) => (
                <UserOrderItem
                  key={order.id}
                  id={order.id}
                  title={order.title}
                  date={order.date}
                  amount={order.amount}
                  status={order.status}
                />
              ))}
            </div>
          </GlowCard>

          {/* Delivery Calendar */}
          <GlowCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              Delivery Calendar
            </h3>
            <div className="space-y-4">
              {mockUserData.deliveries.map((delivery) => (
                <DeliveryCalendar
                  key={delivery.id}
                  type={delivery.type}
                  date={delivery.date}
                />
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  )
}

export default UserProfile 