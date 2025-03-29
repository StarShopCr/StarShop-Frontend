"use client"

// import ConnectedWallet from "@/components/features/user/billing/connected-wallet";
import React from "react";

export default function Page() {
  return (
    <div className="space-y-6 p-6 bg-starshopBackground ">
      {/* <ConnectedWallet /> */}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import StellarWallet from "@/components/features/user/billing/stellar-wallets"
import PaymentMethods from "@/components/features/user/billing/payment-methods"
import TransactionHistory from "@/components/features/user/billing/transaction-history"
import Subscription from "@/components/features/user/billing/subscription"
import SendXLM from "@/components/features/user/billing/send-xlm"
export default function BillingPage() {
  return (
    <div className="min-h-screen  text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <header className="flex items-center mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold ml-4">Billing & Payments</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <StellarWallet />
            <PaymentMethods />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <TransactionHistory />
            <Subscription />
            <SendXLM />
          </div>
        </div>
      </div>

    </div>
  )
}