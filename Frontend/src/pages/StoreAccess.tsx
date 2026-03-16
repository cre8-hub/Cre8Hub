"use client"

import { useSearchParams } from "react-router-dom"
import { useEffect, useState, Suspense } from "react"
import { CheckCircle2, Loader2, AlertCircle, Download, ShoppingBag } from "lucide-react"
import Link from "@/components/compat/RouterLink"

interface AccessData {
    product_id: string
    user_email: string
    product_title?: string
    product_description?: string
}

function AccessContent() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const [data, setData] = useState<AccessData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing access token.")
            setLoading(false)
            return
        }

        const API = import.meta.env.VITE_API_URL
        fetch(`${API}/magic/${token}`)
            .then(async res => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err.message || "Invalid or expired link")
                }
                return res.json()
            })
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [token])

    if (loading) return (
        <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="w-10 h-10 text-[#6c47ff] animate-spin" />
            <p className="text-gray-500 text-sm">Verifying your access…</p>
        </div>
    )

    if (error) return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
            <p className="text-gray-500 text-sm max-w-xs">{error}</p>
            <Link href="/" className="text-[#6c47ff] text-sm hover:opacity-80 mt-2">← Back to Store</Link>
        </div>
    )

    if (!data) return null

    return (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
            {/* Success icon */}
            <div className="relative">
                <div className="w-20 h-20 bg-[#f0ecff] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-[#6c47ff]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center ring-2 ring-white">
                    <Download className="w-4 h-4 text-green-500" />
                </div>
            </div>

            <div>
                <p className="text-xs text-[#6c47ff] font-semibold uppercase tracking-widest mb-2">Purchase Verified</p>
                <h1 className="text-2xl font-extrabold text-gray-900">
                    {data.product_title || "Your Purchase"}
                </h1>
                {data.product_description && (
                    <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">{data.product_description}</p>
                )}
            </div>

            {/* Access details */}
            <div className="bg-[#f0ecff] rounded-2xl p-5 w-full text-left space-y-3">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#6c47ff] shrink-0" />
                    <span className="text-sm text-gray-600">
                        Purchased by <span className="font-semibold text-gray-900">{data.user_email}</span>
                    </span>
                </div>
                <div className="h-px bg-[#6c47ff]/10" />
                <p className="text-xs text-gray-400">
                    This link is valid for 30 days from your purchase date.
                    Keep it safe — it&apos;s your access key.
                </p>
            </div>

            {/* CTA — in a real implementation this would show download links, course access, etc. */}
            <div className="w-full space-y-3">
                <div className="w-full py-4 bg-[#6c47ff] text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-default shadow-lg shadow-[#6c47ff]/30">
                    <CheckCircle2 className="w-4 h-4" />
                    Access Granted
                </div>
                <p className="text-xs text-gray-400">
                    Your digital product is ready. Check your email for the download link,
                    or contact the seller if you need assistance.
                </p>
                <Link href="/" className="block">
                    <button className="w-full py-3 text-[#6c47ff] text-sm font-medium rounded-xl hover:bg-[#f0ecff] transition-colors">
                        ← Back to Store
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default function AccessPage() {
    return (
        <main className="min-h-screen bg-[#f4f4fb] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full px-8 py-10">
                <Suspense fallback={
                    <div className="flex flex-col items-center gap-4 py-16">
                        <Loader2 className="w-10 h-10 text-[#6c47ff] animate-spin" />
                    </div>
                }>
                    <AccessContent />
                </Suspense>
            </div>
        </main>
    )
}
