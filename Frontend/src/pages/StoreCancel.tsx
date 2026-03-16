"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "@/components/compat/RouterLink"

export default function CheckoutCancelPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="z-10 w-full max-w-md"
            >
                <Card className="p-8 text-center border-red-500/20 shadow-2xl shadow-red-500/10 backdrop-blur-sm bg-card/80">
                    <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
                    <p className="text-muted-foreground mb-8">
                        Your checkout process was cancelled. No charges were made to your account.
                    </p>

                    <div className="space-y-4">
                        <Link href="/" className="block">
                            <Button className="w-full h-12">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </main>
    )
}
