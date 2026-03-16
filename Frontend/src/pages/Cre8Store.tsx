"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Store, AlertCircle, CheckCircle2, ExternalLink,
    ImagePlus, Loader2, Globe, Copy
} from "lucide-react"

interface StoreData {
    id: string
    store_name: string
    store_slug: string
    description?: string
    banner_url?: string
    is_published: boolean
    created_at: string
}

export default function StoreSettingsPage() {
    const [store, setStore] = useState<StoreData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [storeName, setStoreName] = useState("")
    const [description, setDescription] = useState("")
    const [bannerUrl, setBannerUrl] = useState("")
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [uploadingBanner, setUploadingBanner] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        api.get("/stores/mine")
            .then(res => {
                const s = res.data
                setStore(s)
                setStoreName(s.store_name || "")
                setDescription(s.description || "")
                setBannerUrl(s.banner_url || "")
                if (s.banner_url) setBannerPreview(s.banner_url)
            })
            .catch(() => setError("Failed to load store. Have you created one yet?"))
            .finally(() => setLoading(false))
    }, [])

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const localUrl = URL.createObjectURL(file)
        setBannerPreview(localUrl)
        setUploadingBanner(true)
        const formData = new FormData()
        formData.append("file", file)
        api.post("/stores/upload-banner", formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(res => setBannerUrl(res.data.url))
            .catch(() => setBannerUrl(localUrl))
            .finally(() => setUploadingBanner(false))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)
        try {
            const res = await api.patch("/stores/mine", {
                store_name: storeName,
                description,
                banner_url: bannerUrl,
            })
            setStore(res.data)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to save settings.")
        } finally {
            setSaving(false)
        }
    }

    const handlePublish = async () => {
        if (!store) return
        try {
            await api.post(`/stores/${store.id}/publish`)
            setStore(prev => prev ? { ...prev, is_published: true } : prev)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to publish store.")
        }
    }

    const publicUrl = store ? `${window.location.origin}/store/${store.store_slug}` : ""

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
    )

    if (!store && error) return (
        <div className="max-w-xl space-y-4">
            <h1 className="text-3xl font-bold">Store Settings</h1>
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-4 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
            </div>
            <Button onClick={() => navigate("/dashboard/store")}>Create a Store</Button>
        </div>
    )

    return (
        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
                    <p className="text-muted-foreground mt-1">Customize and manage your public store.</p>
                </div>
                {store?.is_published ? (
                    <a href={`/store/${store.store_slug}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Live
                        </Button>
                    </a>
                ) : (
                    <Button variant="outline" className="gap-2 text-yellow-500 border-yellow-500/40 hover:bg-yellow-500/10" onClick={handlePublish}>
                        <Globe className="w-4 h-4" />
                        Publish Store
                    </Button>
                )}
            </div>

            {/* Status bar */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${store?.is_published ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
                {store?.is_published
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <Globe className="w-4 h-4 text-yellow-500 shrink-0" />
                }
                <div className="flex-1 text-sm">
                    <span className={`font-semibold ${store?.is_published ? "text-green-500" : "text-yellow-500"}`}>
                        {store?.is_published ? "Store is Live" : "Store is Draft"}
                    </span>
                    {store?.is_published && (
                        <span className="text-muted-foreground ml-2 font-mono text-xs">{publicUrl}</span>
                    )}
                </div>
                {store?.is_published && (
                    <button
                        onClick={() => navigator.clipboard.writeText(publicUrl)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Copy link"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Settings form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Store Profile
                    </CardTitle>
                    <CardDescription>This info is shown on your public store page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Banner */}
                        <div className="space-y-2">
                            <Label>Store Banner</Label>
                            <div className="relative w-full h-36 rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center">
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                                        <ImagePlus className="w-8 h-8" />
                                        <p className="text-xs">Banner image</p>
                                    </div>
                                )}
                                <label htmlFor="banner-upload" className="absolute bottom-2 right-2 cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors">
                                    {uploadingBanner ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                                    {uploadingBanner ? "Uploading..." : "Upload"}
                                </label>
                                <input id="banner-upload" type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                            </div>
                            <Input
                                placeholder="Or paste a banner image URL..."
                                value={bannerUrl}
                                onChange={e => { setBannerUrl(e.target.value); setBannerPreview(e.target.value || null) }}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="storeName"
                                value={storeName}
                                onChange={e => setStoreName(e.target.value)}
                                required
                                minLength={3}
                                maxLength={50}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Store Description</Label>
                            <textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Tell buyers about your store..."
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">Store URL (Slug)</Label>
                            <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md text-muted-foreground">
                                /store/{store?.store_slug}
                            </p>
                            <p className="text-xs text-muted-foreground">Slug is set when you first create your store and can&apos;t be changed.</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-md">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                Store settings saved!
                            </div>
                        )}

                        <Button type="submit" disabled={saving} className="gap-2">
                            {saving ? "Saving..." : "Save Settings"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
