"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react"
import Link from "@/components/compat/RouterLink"
import {
    Search, ShoppingCart, Heart, Star, X, AlertCircle,
    Loader2, Mail, Check, ChevronDown, ArrowRight, Sparkles,
    Shield, Zap, Globe, Download, Truck, LogOut, User,
    LayoutDashboard, Package, Twitter, Instagram, Youtube,
    ChevronRight, BadgeCheck, Lock, RefreshCw, Headphones,
    Menu, Plus, Minus
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
    id: string
    title: string
    price: number
    description?: string
    image_url?: string
    is_published: boolean
    category?: string
    product_type?: "DIGITAL" | "PHYSICAL"
    inventory?: number | null
    ships_in_days?: number | null
    sku?: string
    is_featured?: boolean
}

interface Store {
    id: string
    store_name: string
    store_slug: string
    description?: string
    banner_url?: string
    logo_url?: string
    bio?: string
    twitter?: string
    instagram?: string
    youtube?: string
    products: Product[]
}

interface AuthUser {
    id: string
    name: string
    email: string
    role: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
    { name: "Alex R.", avatar: "A", rating: 5, text: "Absolutely love the quality! Exceeded my expectations and delivered instantly.", product: "Digital Product", verified: true },
    { name: "Priya S.", avatar: "P", rating: 5, text: "Clean, professional, and worth every penny. The template saved me hours. Will buy again.", product: "Template Pack", verified: true },
    { name: "James W.", avatar: "J", rating: 5, text: "The best purchase I've made this year. Instant download, no fuss. Highly recommend.", product: "Course Outline", verified: true },
]

const FAQS = [
    {
        q: "How do I receive digital products?",
        a: "After purchase, a magic download link is sent to your email immediately. Click the link to access your files — no account required. Links are valid for 30 days."
    },
    {
        q: "Can I get a refund?",
        a: "Digital products are non-refundable once downloaded. If you experience a technical issue with your file, contact the creator and we'll help resolve it within 48 hours."
    },
    {
        q: "How long does shipping take for physical products?",
        a: "Shipping times vary by product and are displayed on each product card. You'll receive a tracking number by email once your order has shipped."
    },
    {
        q: "Is my payment secure?",
        a: "Absolutely. All payments are processed by Stripe, the world's leading payment infrastructure. Your card details are never stored on our servers."
    },
    {
        q: "Can I use the digital products commercially?",
        a: "Licensing varies per product. Check the product description for usage rights, or message the creator directly through our platform."
    },
]

const CATEGORIES = ["All", "Digital", "Courses", "Templates", "Art", "Music", "Software", "eBooks", "Other"]

// ─── Reusable sub-components ──────────────────────────────────────────────────

function StarRating({ count = 5 }: { count?: number }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
        </div>
    )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ store, authUser, onBrowse }: { store: Store; authUser: AuthUser | null; onBrowse: () => void }) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const initial = authUser?.name?.[0]?.toUpperCase() ?? "U"

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo + Store name */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/30">
                                C
                            </div>
                            <span className="text-sm font-semibold text-gray-400 hidden sm:block">Cre8Hub</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            {store.logo_url ? (
                                <img src={store.logo_url} alt={store.store_name} className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-100" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                                    {store.store_name[0]?.toUpperCase()}
                                </div>
                            )}
                            <span className="font-bold text-gray-900 text-base hidden sm:block">{store.store_name}</span>
                        </div>
                    </div>

                    {/* Desktop nav actions */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button onClick={onBrowse}
                            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                            Browse Products
                        </button>

                        {authUser ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(v => !v)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                                >
                                    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
                                        {initial}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{authUser.name}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <div className="px-4 py-2.5 border-b border-gray-50">
                                                <p className="text-xs text-gray-400">Signed in as</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">{authUser.email}</p>
                                            </div>
                                            <Link href="/dashboard"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setDropdownOpen(false)}>
                                                <LayoutDashboard className="w-4 h-4 text-violet-500" /> Dashboard
                                            </Link>
                                            <Link href="/dashboard/orders"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setDropdownOpen(false)}>
                                                <Package className="w-4 h-4 text-violet-500" /> My Orders
                                            </Link>
                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                <button
                                                    onClick={() => {
                                                        localStorage.removeItem("token")
                                                        window.location.reload()
                                                    }}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                                                    <LogOut className="w-4 h-4" /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login"
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all">
                                    Sign In
                                </Link>
                                <Link href="/register"
                                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-md shadow-violet-500/25 transition-all">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(v => !v)} className="sm:hidden p-2 rounded-lg hover:bg-gray-100">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { onBrowse(); setMobileOpen(false) }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                        Browse Products
                    </button>
                    {authUser ? (
                        <>
                            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link href="/dashboard/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                <Package className="w-4 h-4" /> My Orders
                            </Link>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login" className="flex-1 py-2 text-center text-sm font-semibold border border-gray-200 rounded-xl text-gray-700">Sign In</Link>
                            <Link href="/register" className="flex-1 py-2 text-center text-sm font-bold bg-violet-600 text-white rounded-xl">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function StoreHero({ store, onShop, onBuy, featuredProduct }: {
    store: Store
    onShop: () => void
    onBuy: (p: Product) => void
    featuredProduct: Product | null
}) {
    return (
        <section className="relative min-h-[620px] flex flex-col overflow-hidden pt-16">
            {/* Banner */}
            {store.banner_url ? (
                <img src={store.banner_url} alt="Store banner" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700" />
            )}
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/75" />
            {/* Decorative blobs */}
            <div className="absolute top-16 right-24 w-80 h-80 bg-violet-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-24 left-16 w-56 h-56 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Hero content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
                {/* Store logo */}
                {store.logo_url ? (
                    <img src={store.logo_url} alt={store.store_name}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl mb-6" />
                ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-2xl">
                        {store.store_name[0]?.toUpperCase()}
                    </div>
                )}

                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 font-medium mb-5">
                    <BadgeCheck className="w-4 h-4 text-green-300" />
                    Verified Creator · {store.products.length} Product{store.products.length !== 1 ? "s" : ""}
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none max-w-4xl mb-5">
                    {store.store_name}
                </h1>

                <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                    {store.description || "Premium digital content crafted for creators and professionals who demand the best."}
                </p>

                {/* Social links */}
                <div className="flex items-center gap-3 mb-10">
                    {store.twitter && (
                        <a href={`https://twitter.com/${store.twitter}`} target="_blank" rel="noreferrer"
                            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <Twitter className="w-4 h-4" />
                        </a>
                    )}
                    {store.instagram && (
                        <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer"
                            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <Instagram className="w-4 h-4" />
                        </a>
                    )}
                    {store.youtube && (
                        <a href={`https://youtube.com/@${store.youtube}`} target="_blank" rel="noreferrer"
                            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <Youtube className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={onShop}
                        className="px-8 py-4 bg-white text-violet-700 rounded-2xl font-bold text-base hover:bg-violet-50 active:scale-[0.98] transition-all shadow-2xl flex items-center gap-2">
                        Browse Products <ArrowRight className="w-4 h-4" />
                    </button>
                    {featuredProduct && (
                        <button onClick={() => onBuy(featuredProduct)}
                            className="px-8 py-4 bg-violet-600/60 hover:bg-violet-600/80 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-base active:scale-[0.98] transition-all flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Quick Buy — ${Number(featuredProduct.price).toFixed(2)}
                        </button>
                    )}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="relative z-10 flex justify-center pb-8">
                <button onClick={onShop} className="text-white/30 hover:text-white/70 transition-colors animate-bounce">
                    <ChevronDown className="w-6 h-6" />
                </button>
            </div>
        </section>
    )
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar() {
    const items = [
        { icon: Lock, label: "Secure Payments", sub: "256-bit SSL encryption" },
        { icon: Zap, label: "Instant Delivery", sub: "Magic link in seconds" },
        { icon: Globe, label: "Worldwide Access", sub: "Download from anywhere" },
        { icon: Headphones, label: "Creator Support", sub: "Fast response guarantee" },
    ]
    return (
        <div className="bg-white border-y border-gray-100">
            <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map(item => {
                    const Icon = item.icon
                    return (
                        <div key={item.label} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-400 leading-tight">{item.sub}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Featured Product Banner ──────────────────────────────────────────────────

function FeaturedBanner({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-violet-500/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

                {product.image_url && (
                    <img src={product.image_url} alt={product.title}
                        className="relative w-32 h-32 md:w-44 md:h-44 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl shrink-0" />
                )}
                <div className="relative flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs text-white font-semibold mb-3">
                        <Sparkles className="w-3 h-3 text-yellow-300" /> Featured Product
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{product.title}</h3>
                    {product.description && (
                        <p className="text-white/70 text-sm max-w-lg mb-4 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                        <span className="text-3xl font-extrabold text-white">${Number(product.price).toFixed(2)}</span>
                        <button onClick={() => onBuy(product)}
                            className="px-6 py-2.5 bg-white text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 active:scale-[0.98] transition-all shadow-xl flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Buy Now
                        </button>
                        <span className="flex items-center gap-1 text-xs text-white/60">
                            {product.product_type === "PHYSICAL"
                                ? <><Truck className="w-3.5 h-3.5" /> Ships in {product.ships_in_days ?? 3} days</>
                                : <><Download className="w-3.5 h-3.5" /> Instant Download</>}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, slug, isFav, onToggleFav, onBuy }: {
    product: Product
    slug: string
    isFav: boolean
    onToggleFav: () => void
    onBuy: () => void
}) {
    const isOutOfStock = product.product_type === "PHYSICAL" &&
        product.inventory !== null && product.inventory !== undefined && product.inventory === 0

    return (
        <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">

            {/* Wishlist */}
            <button onClick={onToggleFav}
                className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isFav ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-400"}`}>
                <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>

            {/* Product type badge */}
            <div className="absolute top-3 left-3 z-10">
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${product.product_type === "PHYSICAL"
                    ? "bg-blue-500 text-white"
                    : "bg-violet-600 text-white"}`}>
                    {product.product_type === "PHYSICAL"
                        ? <><Truck className="w-2.5 h-2.5" /> Ships in {product.ships_in_days ?? 3}d</>
                        : <><Zap className="w-2.5 h-2.5" /> Instant Download</>}
                </span>
            </div>

            {/* Image — links to detail page */}
            <Link href={`/store/${slug}/product/${product.id}`} className="block">
                <div className="relative w-full h-52 bg-gradient-to-br from-violet-50 to-indigo-50 overflow-hidden">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-violet-200" />
                        </div>
                    )}
                    {product.category && product.category !== "Other" && (
                        <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                            {product.category}
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
                <Link href={`/store/${slug}/product/${product.id}`}>
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-violet-600 transition-colors line-clamp-2">
                        {product.title}
                    </h3>
                </Link>
                {product.description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{product.description}</p>
                )}

                {/* Stars */}
                <div className="flex items-center gap-1.5 mb-4">
                    <StarRating count={5} />
                    <span className="text-xs text-gray-400">5.0</span>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-extrabold text-gray-900">${Number(product.price).toFixed(2)}</p>
                        {product.product_type === "PHYSICAL" && product.inventory !== null && product.inventory !== undefined ? (
                            <p className={`text-xs font-semibold mt-0.5 ${product.inventory === 0 ? "text-red-500" : product.inventory <= 5 ? "text-amber-500" : "text-gray-400"}`}>
                                {product.inventory === 0 ? "Out of stock" : `${product.inventory} left`}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-0.5">{product.product_type === "PHYSICAL" ? "In stock" : "One-time purchase"}</p>
                        )}
                    </div>
                    <button onClick={onBuy} disabled={isOutOfStock}
                        className="px-4 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 active:scale-[0.97] transition-all shadow-md shadow-violet-500/25 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {isOutOfStock ? "Sold Out" : "Buy Now"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Product Grid Section ─────────────────────────────────────────────────────

function ProductGrid({ products, slug, allProducts, onBuy }: {
    products: Product[]
    slug: string
    allProducts: Product[]
    onBuy: (p: Product) => void
}) {
        const [favourites, setFavourites] = useState<Set<string>>(new Set())
        const toggleFav = (id: string) => setFavourites(prev => {
            const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
        })

        if (products.length === 0) return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <ShoppingCart className="w-12 h-12 opacity-20" />
                <p className="text-sm">No products match your filters.</p>
            </div>
        )

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        slug={slug}
                        isFav={favourites.has(product.id)}
                        onToggleFav={() => toggleFav(product.id)}
                        onBuy={() => onBuy(product)}
                    />
                ))}
            </div>
        )
    }

    // ─── Creator Bio Section ──────────────────────────────────────────────────────

    function CreatorBio({ store }: { store: Store }) {
        if (!store.bio && !store.description) return null
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start gap-8">
                    {/* Avatar */}
                    <div className="shrink-0">
                        {store.logo_url ? (
                            <img src={store.logo_url} alt={store.store_name}
                                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-violet-200 shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-violet-200 flex items-center justify-center text-violet-700 font-extrabold text-3xl shadow-lg">
                                {store.store_name[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">About the Creator</p>
                            <BadgeCheck className="w-4 h-4 text-violet-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">{store.store_name}</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            {store.bio || store.description || "A passionate creator building premium digital content for professionals worldwide."}
                        </p>

                        {/* Social links */}
                        <div className="flex items-center gap-3">
                            {store.twitter && (
                                <a href={`https://twitter.com/${store.twitter}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-600 hover:text-violet-600 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <Twitter className="w-4 h-4" /> Twitter
                                </a>
                            )}
                            {store.instagram && (
                                <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-600 hover:text-violet-600 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <Instagram className="w-4 h-4" /> Instagram
                                </a>
                            )}
                            {store.youtube && (
                                <a href={`https://youtube.com/@${store.youtube}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-violet-300 text-gray-600 hover:text-violet-600 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <Youtube className="w-4 h-4" /> YouTube
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // ─── Testimonials ─────────────────────────────────────────────────────────────

    function Testimonials() {
        return (
            <section className="bg-gray-50 border-t border-gray-100 py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2">Social Proof</p>
                        <h2 className="text-3xl font-extrabold text-gray-900">Loved by Buyers</h2>
                        <p className="text-gray-500 mt-2 text-sm">Real reviews from verified customers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <StarRating count={t.rating} />
                                <p className="text-gray-700 text-sm leading-relaxed my-4">&ldquo;{t.text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                                            {t.name}
                                            {t.verified && <BadgeCheck className="w-3.5 h-3.5 text-green-500" />}
                                        </p>
                                        <p className="text-xs text-gray-400">Verified buyer · {t.product}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // ─── Trust / Benefits Section ─────────────────────────────────────────────────

    function TrustSection() {
        const benefits = [
            { icon: Shield, title: "Safe & Secure", body: "All payments are encrypted and processed by Stripe. Your card data is never stored.", color: "bg-green-50 text-green-600" },
            { icon: Zap, title: "Instant Delivery", body: "Digital products are delivered to your inbox the moment your payment clears. No waiting.", color: "bg-violet-50 text-violet-600" },
            { icon: RefreshCw, title: "Satisfaction Guaranteed", body: "Encountered an issue? Contact the creator and our team will make it right within 48 hours.", color: "bg-blue-50 text-blue-600" },
            { icon: Globe, title: "Trusted Platform", body: "Cre8Hub powers thousands of creators worldwide. Your purchase is protected every step.", color: "bg-amber-50 text-amber-600" },
        ]
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2">Buy With Confidence</p>
                    <h2 className="text-3xl font-extrabold text-gray-900">Why shop here?</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {benefits.map(b => {
                        const Icon = b.icon
                        return (
                            <div key={b.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className={`w-12 h-12 rounded-2xl ${b.color} flex items-center justify-center mx-auto mb-4`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{b.body}</p>
                            </div>
                        )
                    })}
                </div>
            </section>
        )
    }

    // ─── FAQ Section ──────────────────────────────────────────────────────────────

    function FAQSection() {
        const [openIndex, setOpenIndex] = useState<number | null>(null)
        return (
            <section className="bg-gray-50 border-t border-gray-100 py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2">Support</p>
                        <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                                    <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                                        {openIndex === i
                                            ? <Minus className="w-3 h-3 text-violet-600" />
                                            : <Plus className="w-3 h-3 text-violet-600" />}
                                    </div>
                                </button>
                                {openIndex === i && (
                                    <div className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // ─── Bottom CTA ─────────────────────────────────────────────────────────────── 

    function BottomCTA({ store, onShop }: { store: Store; onShop: () => void }) {
        return (
            <section className="relative overflow-hidden py-24 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white/80 font-medium mb-6">
                        <Zap className="w-3.5 h-3.5 text-yellow-300" /> Instant digital delivery
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">Ready to level up?</h2>
                    <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
                        Join hundreds of customers who&apos;ve already purchased from {store.store_name}. Instant access, no subscriptions.
                    </p>
                    <button onClick={onShop}
                        className="px-8 py-4 bg-white text-violet-700 rounded-2xl font-extrabold text-lg hover:bg-violet-50 active:scale-[0.98] transition-all shadow-2xl flex items-center gap-2 mx-auto">
                        Browse All Products <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-center gap-10 mt-12 pt-8 border-t border-white/10">
                        {[
                            { label: "Products", value: store.products.length.toString() },
                            { label: "Avg Rating", value: "5.0 ★" },
                            { label: "Delivery", value: "Instant" },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // ─── Footer ───────────────────────────────────────────────────────────────────

    function Footer({ store }: { store: Store }) {
        return (
            <footer className="bg-gray-900 text-gray-400 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">C</div>
                        <span className="text-white font-semibold text-sm">Cre8Hub</span>
                        <span className="text-gray-600 text-sm">· Powering {store.store_name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        <span className="text-gray-600">© {new Date().getFullYear()} Cre8Hub. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        )
    }

    // ─── Checkout Modal ───────────────────────────────────────────────────────────

    function CheckoutModal({ product, slug, onClose }: {
        product: Product
        slug: string
        onClose: () => void
    }) {
        const [buyEmail, setBuyEmail] = useState("")
        const [buyLoading, setBuyLoading] = useState(false)
        const [buyError, setBuyError] = useState<string | null>(null)

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            if (!buyEmail) return
            setBuyLoading(true); setBuyError(null)
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/checkout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: product.id, email: buyEmail }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.message || "Checkout failed")
                sessionStorage.setItem("last_store_slug", slug)
                window.location.href = data.url
            } catch (err: any) {
                setBuyError(err.message); setBuyLoading(false)
            }
        }

        return (
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 z-10 animate-in slide-in-from-bottom-4 duration-300">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    {product.image_url && (
                        <img src={product.image_url} alt={product.title} className="w-full h-36 object-cover rounded-2xl mb-5" />
                    )}

                    <div className="mb-5">
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-1">Complete Purchase</p>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.title}</h2>
                        <p className="text-3xl font-extrabold text-violet-600 mt-1">${Number(product.price).toFixed(2)}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-violet-500" /> Your Email
                            </label>
                            <input type="email" required value={buyEmail}
                                onChange={e => setBuyEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
                            <p className="text-xs text-gray-400 mt-1">Your download link will be sent here instantly.</p>
                        </div>
                        {buyError && (
                            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2.5 rounded-lg">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{buyError}
                            </div>
                        )}
                        <button type="submit" disabled={buyLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-violet-600/30 active:scale-[0.98]">
                            {buyLoading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                                : <><ShoppingCart className="w-4 h-4" /> Pay with Stripe</>}
                        </button>
                        <div className="flex items-center justify-center gap-4 pt-1">
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

    export default function StoreFront() {
        const params = useParams()
        const slug = params.slug as string
        const productsRef = useRef<HTMLDivElement>(null)

        const [store, setStore] = useState<Store | null>(null)
        const [loading, setLoading] = useState(true)
        const [notFound, setNotFound] = useState(false)

        const [search, setSearch] = useState("")
        const [activeCategory, setActiveCategory] = useState("All")
        const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default")

        const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)
        const [authUser, setAuthUser] = useState<AuthUser | null>(null)

        // Try to get logged-in user from token
        useEffect(() => {
            const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("authToken")) : null
            if (!token) return
            fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : null)
                .then(data => { if (data?.id) setAuthUser(data) })
                .catch(() => { })
        }, [])

        useEffect(() => {
            fetch(`${import.meta.env.VITE_API_URL}/stores/public/${slug}`)
                .then(res => { if (!res.ok) { setNotFound(true); return null } return res.json() })
                .then(data => { if (data) setStore(data) })
                .catch(() => setNotFound(true))
                .finally(() => setLoading(false))
        }, [slug])

        const filteredProducts = useMemo(() => {
            if (!store) return []
            let products = store.products.filter(p =>
                p.title.toLowerCase().includes(search.toLowerCase()) &&
                (activeCategory === "All" || (p.category || "Other") === activeCategory)
            )
            if (sortBy === "price_asc") products = [...products].sort((a, b) => Number(a.price) - Number(b.price))
            if (sortBy === "price_desc") products = [...products].sort((a, b) => Number(b.price) - Number(a.price))
            return products
        }, [store, search, sortBy, activeCategory])

        const navigate = useNavigate()
        const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: "smooth" })

        /** Open checkout, but redirect unauthenticated buyers to login first */
        const openCheckout = (product: Product) => {
            const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("authToken")) : null
            if (!token) {
                sessionStorage.setItem("after_login_redirect", `/store/${slug}/product/${product.id}`)
                sessionStorage.setItem("open_checkout", product.id)
                navigate(`/login?redirect=/store/${slug}/product/${product.id}`)
                return
            }
            setCheckoutProduct(product)
        }

        if (loading) return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading store…</p>
                </div>
            </div>
        )

        if (notFound || !store) return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4 text-gray-400">
                <AlertCircle className="w-12 h-12 opacity-30" />
                <h1 className="text-2xl font-bold text-gray-700">Store not found</h1>
                <p className="text-sm">This store may not exist or hasn&apos;t been published yet.</p>
                <Link href="/" className="mt-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all">
                    Go Home
                </Link>
            </div>
        )

        const featuredProduct = store.products.find(p => p.is_featured) ?? store.products[0] ?? null

        return (
            <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

                {/* Checkout Modal */}
                {checkoutProduct && (
                    <CheckoutModal product={checkoutProduct} slug={slug} onClose={() => setCheckoutProduct(null)} />
                )}

                {/* Fixed Navbar */}
                <Navbar store={store} authUser={authUser} onBrowse={scrollToProducts} />

                {/* Hero */}
                <StoreHero store={store} onShop={scrollToProducts} onBuy={openCheckout} featuredProduct={featuredProduct} />

                {/* Trust Bar */}
                <TrustBar />

                {/* Featured Product Banner */}
                {featuredProduct && (
                    <FeaturedBanner product={featuredProduct} onBuy={openCheckout} />
                )}

                {/* ── Products Section ─────────────────────────────────────── */}
                <section ref={productsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-1">Shop</p>
                            <h2 className="text-2xl font-extrabold text-gray-900">All Products</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{filteredProducts.length} of {store.products.length} products</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search…" value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 bg-gray-50 w-44" />
                            </div>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                                className="py-2 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 bg-gray-50 text-gray-600">
                                <option value="default">Sort: Default</option>
                                <option value="price_asc">Price ↑</option>
                                <option value="price_desc">Price ↓</option>
                            </select>
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <ProductGrid products={filteredProducts} slug={slug} allProducts={store.products} onBuy={openCheckout} />
                </section>

                {/* Creator Bio */}
                <CreatorBio store={store} />

                {/* Trust Section */}
                <TrustSection />

                {/* Testimonials */}
                <Testimonials />

                {/* FAQ */}
                <FAQSection />

                {/* Bottom CTA */}
                <BottomCTA store={store} onShop={scrollToProducts} />

                {/* Footer */}
                <Footer store={store} />

                {/* Sticky bottom buy bar */}
                {featuredProduct && !checkoutProduct && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-2xl">
                        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {featuredProduct.image_url && (
                                    <img src={featuredProduct.image_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{featuredProduct.title}</p>
                                    <p className="text-violet-600 font-bold text-sm">${Number(featuredProduct.price).toFixed(2)}</p>
                                </div>
                            </div>
                            <button onClick={() => openCheckout(featuredProduct)}
                                className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" /> Buy Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
