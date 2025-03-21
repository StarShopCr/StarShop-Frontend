"use client"

import { useState } from "react"
import {
    Download,
    FileText,
    Calendar,
    PieChart,
    DollarSign,
    ArrowUpRight,
    Bell,
    Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"



const InvoiceOverview = () => {
    const [progress, setProgress] = useState(62)

    const [selectedButton, setSelectedButton] = useState('invoice');

    const handleButtonSelect = (buttonId: string) => {
        setSelectedButton(buttonId);
    };

    return (
        <main className="flex-grow p-8 space-y-8 bg-stars">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Invoices</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage and track your business invoices</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-gray-700 text-white gap-2 bg-transparent hover:bg-gray-800/30 hover:text-white">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                                    <Plus className="h-4 w-4" />
                                    New Invoice
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#13111E] border border-white/20 text-white">
                                <DialogHeader>
                                    <DialogTitle>Comming soon...</DialogTitle>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Outstanding */}
                    <Card className="bg-[#13111E] bg-opacity-40 border border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-gray-300">Total Outstanding</CardTitle>
                            <DollarSign className="h-5 w-5 text-purple-400" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-gray-400 text-sm">Pending + Overdue invoices</p>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-bold">1,240 XLM</h2>
                                <div className="flex items-center text-sm text-red-400">
                                    <ArrowUpRight className="h-4 w-4 mr-1" />
                                    <span>+12.5% from last month</span>
                                </div>
                            </div>
                            <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-gray-400">
                                <span>0 XLM</span>
                                <span>2,000 XLM</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Status */}
                    <Card className="bg-[#13111E] bg-opacity-40 border border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-gray-300">Invoice Status</CardTitle>
                            <div className="text-purple-500">
                                <FileText className="h-6 w-6" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-gray-400 text-sm">Distribution by status</p>
                            <div className="flex justify-center py-2">
                                <div className="relative h-32 w-32">
                                    <PieChart className="h-32 w-32 text-purple-500 opacity-50 absolute" />
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-2xl font-bold">124</span>
                                        <span className="text-xs text-white/60">Total</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-4">
                                <div className="bg-green-900/30 bg-opacity-2 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-green-500">98</div>
                                    <div className="text-green-600 text-sm">Paid</div>
                                </div>
                                <div className="bg-amber-900/30 bg-opacity-2 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-amber-500">18</div>
                                    <div className="text-amber-600 text-sm">Pending</div>
                                </div>
                                <div className="bg-red-900/30 bg-opacity-2 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-red-500">8</div>
                                    <div className="text-red-600 text-sm">Overdue</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-[#13111E] bg-opacity-40 border border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-gray-300">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-400 text-sm">Common invoice tasks</p>

                            <Button
                                variant="ghost"
                                className={`w-full justify-start ${selectedButton === 'invoice' ? 'bg-purple-900/40' : 'bg-gray-800/40'
                                    } hover:bg-purple-900/60 text-white hover:text-white h-14 gap-3`}
                                onClick={() => handleButtonSelect('invoice')}
                            >
                                <FileText className="h-5 w-5 text-purple-300" />
                                Create New Invoice
                            </Button>

                            <Button
                                variant="ghost"
                                className={`w-full justify-start ${selectedButton === 'reminders' ? 'bg-purple-900/40' : 'bg-gray-800/40'
                                    } hover:bg-purple-900/60 text-white hover:text-white h-14 gap-3`}
                                onClick={() => handleButtonSelect('reminders')}
                            >
                                <Bell className="h-5 w-5" />
                                Send Payment Reminders
                            </Button>

                            <Button
                                variant="ghost"
                                className={`w-full justify-start ${selectedButton === 'calendar' ? 'bg-purple-900/40' : 'bg-gray-800/40'
                                    } hover:bg-purple-900/60 text-white hover:text-white h-14 gap-3`}
                                onClick={() => handleButtonSelect('calendar')}
                            >
                                <Calendar className="h-5 w-5" />
                                View Due Date Calendar
                            </Button>

                            <Button
                                variant="ghost"
                                className={`w-full justify-start ${selectedButton === 'export' ? 'bg-purple-900/40' : 'bg-gray-800/40'
                                    } hover:bg-purple-900/60 text-white hover:text-white h-14 gap-3`}
                                onClick={() => handleButtonSelect('export')}
                            >
                                <Download className="h-5 w-5" />
                                Export Invoice Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}



export default InvoiceOverview
