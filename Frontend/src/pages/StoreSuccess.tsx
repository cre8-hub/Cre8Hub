"use client"

import { useSearchParams } from "react-router-dom"
import { useEffect, useState, Suspense } from "react"
import { CheckCircle2, Loader2, AlertCircle, Mail, Download, ArrowRight, Sparkles, Shield, Package } from "lucide-react"
import Link from "@/components/compat/RouterLink"

interface SessionDetails {
    product_title: string
    product_description?: string
    user_email: string
    status: string
    total_amount: number
    magic_token: string | null
    store_slug: string | null
    order_type?: "DIGITAL" | "PHYSICAL"
    ships_in_days?: number | null
    shipping_name?: string | null
    shipping_line1?: string | null
    shipping_city?: string | null
    shipping_state?: string | null
    shipping_zip?: string | null
    shipping_country?: string | null
}

function SuccessContent() {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get("session_id")

    const [details, setDetails] = useState<SessionDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pollStep, setPollStep] = useState(0)
    const [storeSlug, setStoreSlug] = useState<string | null>(null)

    useEffect(() => {
        // Read slug saved before Stripe redirect
        setStoreSlug(sessionStorage.getItem("last_store_slug"))
    }, [])

    useEffect(() => {
        if (!sessionId) {
            setError("No session ID found.")
            setLoading(false)
            return
        }

        const API = import.meta.env.VITE_API_URL
        const poll = async (attempts = 0): Promise<void> => {
            try {
                setPollStep(attempts)
                const res = await fetch(`${API}/payments/session/${sessionId}`)
                if (!res.ok) throw new Error("Session not found")
                const data = await res.json()
                if (!data.magic_token && attempts < 10) {
                    await new Promise(r => setTimeout(r, 2000))
                    return poll(attempts + 1)
                }
                setDetails(data)
            } catch {
                setError("Payment received! Your access link will arrive via email shortly.")
            } finally {
                setLoading(false)
            }
        }
        poll()
    }, [sessionId])

    /* ── Loading ──────────────────────────────────────────────────────── */
    if (loading) return (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
            {/* Animated rings */}
            <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-violet-100 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-violet-600 border-t-transparent absolute inset-0 animate-spin" />
                    <Package className="w-7 h-7 text-violet-400" />
                </div>
            </div>
            <div>
                <p className="font-bold text-gray-900 text-lg">Confirming your payment…</p>
                <p className="text-gray-400 text-sm mt-1">
                    {pollStep < 3 ? "Checking payment status" : pollStep < 7 ? "Generating your access link" : "Almost there…"}
                </p>
                {/* Progress dots */}
                <div className="flex gap-1.5 justify-center mt-4">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i <= (pollStep % 3) ? "bg-violet-600" : "bg-gray-200"}`} />
                    ))}
                </div>
            </div>
        </div>
    )

    /* ── Error / fallback ─────────────────────────────────────────────── */
    if (error || !details) return (
        <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-amber-500" />
            </div>
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Payment Received!</h1>
                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">{error}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 w-full text-left">
                <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Check your inbox</p>
                        <p className="text-xs text-gray-500 mt-0.5">We&apos;ve sent your purchase confirmation and access link to your email address.</p>
                    </div>
                </div>
            </div>
            <Link href={`/store/${storeSlug ?? details?.store_slug ?? ""}`} className="text-sm text-violet-600 hover:opacity-80 flex items-center gap-1">
                ← Back to Store
            </Link>
        </div>
    )

    /* ── Success ──────────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col items-center gap-6 text-center">

            {/* Animated success icon */}
            <div className="relative mt-2">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                {/* Sparkle accents */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-3 h-3 text-white" />
                </div>
            </div>

            {/* Headline */}
            <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Payment Successful</p>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">You&apos;re All Set! 🎉</h1>
                <p className="text-gray-500 text-sm mt-2">
                    {details.order_type === "PHYSICAL"
                        ? "Your order is confirmed and will ship soon."
                        : "Your order has been confirmed and is ready to access."
                    }
                </p>
            </div>

            {/* Product card */}
            <div className="w-full bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 text-left">
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2">Order Confirmed</p>
                <h2 className="font-bold text-gray-900 text-lg leading-snug">{details.product_title}</h2>
                {details.product_description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{details.product_description}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-violet-100">
                    <div>
                        <p className="text-xs text-gray-400">Total paid</p>
                        <p className="text-2xl font-extrabold text-violet-600">${Number(details.total_amount).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </div>
                </div>
            </div>

            {/* Email delivery notice */}
            <div className="w-full flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4 text-left">
                <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-gray-800">Confirmation sent</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Receipt and access link sent to <span className="font-semibold text-gray-700">{details.user_email}</span>
                    </p>
                </div>
            </div>

            {/* What happens next — branches on order type */}
            <div className="w-full text-left space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">What happens next</p>
                {details.order_type === "PHYSICAL" ? (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-600">Check your email for your order confirmation</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-600">
                                Your order will ship in <strong>{details.ships_in_days ?? 3} business days</strong>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-600">You&apos;ll receive a tracking number by email once shipped</p>
                        </div>
                        {/* Shipping address summary */}
                        {details.shipping_line1 && (
                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 space-y-0.5">
                                <p className="font-semibold text-gray-800">Shipping to:</p>
                                <p>{details.shipping_name}</p>
                                <p>{details.shipping_line1}</p>
                                <p>{details.shipping_city}, {details.shipping_state} {details.shipping_zip}</p>
                                <p>{details.shipping_country}</p>
                            </div>
                        )}
                    </>
                ) : (
                    [
                        { icon: Mail, color: "bg-blue-100 text-blue-600", text: "Check your email for the access link" },
                        { icon: Download, color: "bg-violet-100 text-violet-600", text: "Click the link to access your purchase" },
                        { icon: Shield, color: "bg-emerald-100 text-emerald-600", text: "Your link is valid for 30 days" },
                    ].map((step, i) => {
                        const Icon = step.icon
                        return (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step.color} shrink-0`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className="text-sm text-gray-600">{step.text}</p>
                            </div>
                        )
                    })
                )}
            </div>

            {/* CTAs — branch digital vs physical */}
            <div className="w-full space-y-3 pt-2">
                {details.order_type === "PHYSICAL" ? (
                    <div className="w-full py-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                        <p className="text-sm font-semibold text-blue-700">📦 Your order is being prepared</p>
                        <p className="text-xs text-blue-500 mt-1">Track your shipment via the email we sent to {details.user_email}</p>
                    </div>
                ) : details.magic_token ? (
                    <Link href={`/access?token=${details.magic_token}`} className="block">
                        <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-violet-600/25">
                            Access My Purchase <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                ) : (
                    <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-medium text-sm text-center flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Access link will arrive in your email
                    </div>
                )}
                <Link href={`/store/${storeSlug ?? details.store_slug ?? ""}`} className="block">
                    <button className="w-full py-3 text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 hover:text-gray-600 transition-all">
                        ← Back to Store
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4"
            style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* Decorative background blobs */}
            <div className="fixed top-10 left-10 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-10 right-10 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative bg-white rounded-3xl shadow-2xl shadow-violet-500/10 max-w-md w-full px-8 py-10 border border-violet-100/50">
                <Suspense fallback={
                    <div className="flex flex-col items-center gap-4 py-16">
                        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    </div>
                }>
                    <SuccessContent />
                </Suspense>
            </div>
        </main>
    )
}
