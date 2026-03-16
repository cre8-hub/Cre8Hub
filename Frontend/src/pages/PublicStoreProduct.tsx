"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Link from "@/components/compat/RouterLink"
import {
    ArrowLeft, ShoppingCart, Zap, Truck, Shield, Download,
    Star, Check, AlertCircle, Loader2, Mail, X, BadgeCheck,
    RefreshCw, Clock, ChevronRight
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
    id: string
    title: string
    price: number
    description?: string
    image_url?: string
    category?: string
    product_type?: "DIGITAL" | "PHYSICAL"
    inventory?: number | null
    ships_in_days?: number | null
    is_featured?: boolean
}

interface Store {
    id: string
    store_name: string
    store_slug: string
    description?: string
    logo_url?: string
    products: Product[]
}

// ─── Checkout Modal (inline, same as store page) ──────────────────────────────

function CheckoutModal({ product, slug, onClose }: {
    product: Product; slug: string; onClose: () => void
}) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(null)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Checkout failed")
            sessionStorage.setItem("last_store_slug", slug)
            window.location.href = data.url
        } catch (err: any) {
            setError(err.message); setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 z-10 animate-in slide-in-from-bottom-4 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                {product.image_url && (
                    <img src={product.image_url} alt={product.title} className="w-full h-36 object-cover rounded-2xl mb-5" />
                )}
                <div className="mb-5">
                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-1">Complete Purchase</p>
                    <h2 className="text-xl font-bold text-gray-900">{product.title}</h2>
                    <p className="text-3xl font-extrabold text-violet-600 mt-1">${Number(product.price).toFixed(2)}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-violet-500" /> Your Email
                        </label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
                        <p className="text-xs text-gray-400 mt-1">Your download link will be sent here instantly.</p>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2.5 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                        </div>
                    )}
                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-violet-600/25 active:scale-[0.98]">
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe…</>
                            : <><ShoppingCart className="w-4 h-4" /> Pay with Stripe</>}
                    </button>
                    <div className="flex items-center justify-center gap-4">
                        {["SSL Secured", "Instant Access", "30-day link"].map(t => (
                            <span key={t} className="flex items-center gap-1 text-xs text-gray-400">
                                <Check className="w-3 h-3 text-green-500" />{t}
                            </span>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
    const params = useParams()
    const navigate = useNavigate()
    const slug = params.slug as string
    const productId = params.productId as string

    const [store, setStore] = useState<Store | null>(null)
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)

    // Prefill checkout modal if user came from a "buy redirect"
    useEffect(() => {
        const autoOpen = sessionStorage.getItem("open_checkout")
        if (autoOpen === productId) {
            sessionStorage.removeItem("open_checkout")
            setShowCheckout(true)
        }
    }, [productId])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/stores/public/${slug}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) { setNotFound(true); return }
                setStore(data)
                const found = data.products?.find((p: Product) => p.id === productId)
                if (!found) setNotFound(true)
                else setProduct(found)
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [slug, productId])

    const isOutOfStock = product?.product_type === "PHYSICAL" &&
        product.inventory !== null && product.inventory !== undefined && product.inventory === 0

    const handleBuy = () => {
        const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("authToken")) : null
        if (!token) {
            // Save intent and redirect to login
            sessionStorage.setItem("after_login_redirect", `/store/${slug}/product/${productId}`)
            sessionStorage.setItem("open_checkout", productId)
            navigate(`/login?redirect=/store/${slug}/product/${productId}`)
            return
        }
        setShowCheckout(true)
    }

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading product…</p>
            </div>
        </div>
    )

    if (notFound || !product || !store) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
            <AlertCircle className="w-12 h-12 text-gray-200" />
            <h1 className="text-2xl font-bold text-gray-700">Product not found</h1>
            <Link href={`/store/${slug}`}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all">
                ← Back to Store
            </Link>
        </div>
    )

    const otherProducts = store.products.filter(p => p.id !== productId).slice(0, 3)

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

            {showCheckout && <CheckoutModal product={product} slug={slug} onClose={() => setShowCheckout(false)} />}

            {/* ── Navbar ─────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
                    <Link href={`/store/${slug}`}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to {store.store_name}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-sm text-gray-900 font-semibold truncate max-w-xs">{product.title}</span>
                </div>
            </nav>

            {/* ── Product Section ─────────────────────────────────── */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

                    {/* LEFT: Image */}
                    <div className="sticky top-20">
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 shadow-xl">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingCart className="w-24 h-24 text-violet-200" />
                                </div>
                            )}
                            {/* Type badge on image */}
                            <div className="absolute top-4 left-4">
                                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${product.product_type === "PHYSICAL"
                                    ? "bg-blue-600 text-white"
                                    : "bg-violet-600 text-white"}`}>
                                    {product.product_type === "PHYSICAL"
                                        ? <><Truck className="w-3 h-3" /> Ships in {product.ships_in_days ?? 3} days</>
                                        : <><Zap className="w-3 h-3" /> Instant Download</>}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col gap-6">

                        {/* Breadcrumb + category */}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Link href={`/store/${slug}`} className="hover:text-violet-600 transition-colors">{store.store_name}</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span>{product.category || "Digital Product"}</span>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                                {product.title}
                            </h1>

                            {/* Star rating (decorative) */}
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">5.0 · Verified purchases</span>
                                <BadgeCheck className="w-4 h-4 text-green-500" />
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="prose prose-sm text-gray-600 max-w-none">
                                <p className="leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* What you get */}
                        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
                            <p className="text-sm font-semibold text-violet-700 mb-3">What you get:</p>
                            <ul className="space-y-2">
                                {product.product_type === "PHYSICAL" ? (
                                    <>
                                        <li className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" /> Physical product shipped to your address</li>
                                        <li className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" /> Tracking number via email</li>
                                        <li className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" /> Delivered in {product.ships_in_days ?? 3} business days</li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" /> Instant download link via email</li>
                                        <li className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" /> Lifetime access to your files</li>
                                        <li className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" /> No account required to download</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Price + Buy */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-end justify-between mb-1">
                                <span className="text-4xl font-extrabold text-gray-900">${Number(product.price).toFixed(2)}</span>
                                <span className="text-sm text-gray-400">One-time payment</span>
                            </div>
                            {product.product_type === "PHYSICAL" && product.inventory !== null && product.inventory !== undefined && (
                                <p className={`text-sm font-semibold mb-4 ${product.inventory === 0 ? "text-red-500" : product.inventory <= 5 ? "text-amber-500" : "text-green-600"}`}>
                                    {product.inventory === 0 ? "Out of stock" : product.inventory <= 5 ? `Only ${product.inventory} left!` : "In stock"}
                                </p>
                            )}
                            <button
                                onClick={handleBuy}
                                disabled={isOutOfStock}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                {isOutOfStock
                                    ? "Out of Stock"
                                    : product.product_type === "PHYSICAL"
                                        ? <><ShoppingCart className="w-5 h-5" /> Buy Now</>
                                        : <><Download className="w-5 h-5" /> Get Instant Access — ${Number(product.price).toFixed(2)}</>}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-3">
                                Secured by Stripe · 256-bit SSL encryption
                            </p>
                        </div>

                        {/* Refund policy */}
                        <div className="flex flex-col gap-3 text-sm text-gray-500">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Shield className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">Secure Checkout</p>
                                    <p>Payments processed by Stripe. Your card details are never stored.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">Refund Policy</p>
                                    <p>Digital products are non-refundable once downloaded. Physical products can be returned within 14 days.</p>
                                </div>
                            </div>
                            {product.product_type === "DIGITAL" && (
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <Clock className="w-3.5 h-3.5 text-violet-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700">Download Link Validity</p>
                                        <p>Your magic link is valid for 30 days. Access it anytime from your email inbox.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── More Products ──────────────────────────────────── */}
                {otherProducts.length > 0 && (
                    <section className="mt-20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-extrabold text-gray-900">More from {store.store_name}</h2>
                            <Link href={`/store/${slug}`}
                                className="text-sm text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {otherProducts.map(p => (
                                <Link key={p.id} href={`/store/${slug}/product/${p.id}`}
                                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                                    <div className="h-40 bg-gradient-to-br from-violet-50 to-indigo-50 overflow-hidden">
                                        {p.image_url
                                            ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            : <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="w-10 h-10 text-violet-200" /></div>}
                                    </div>
                                    <div className="p-4">
                                        <p className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-violet-600 transition-colors">{p.title}</p>
                                        <p className="text-violet-600 font-extrabold mt-1">${Number(p.price).toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
