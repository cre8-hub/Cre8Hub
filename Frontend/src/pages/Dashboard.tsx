import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut, Settings, Plus, Palette, Video, Sparkles, Clock,
  TrendingUp, Target, Zap, Eye, Heart, ArrowUp,
  Users, Calendar, BarChart3, Lightbulb, Play
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, Plus, Palette, Video, Sparkles, Clock, TrendingUp, Zap, Eye, Heart, MessageCircle, Share2, ArrowUp, ArrowDown, Users, Calendar, ThumbsUp, BarChart3, Lightbulb, Play, TrendingDown, Rocket, Store } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import logo from '../../public/lovable-uploads/logomain.png';
import { useBackendAuth } from '@/hooks/useBackendAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useBackendAuth();

  /* ================= Cre8Sight (REAL DATA) ================= */
  const [keyword, setKeyword] = useState("AI");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/cre8sight?keyword=${keyword}`
        );
        const data = await res.json();

        if (!data.success) throw new Error("Failed to load trends");

        setTrendData(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [keyword]);

  const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  /* ================= ORIGINAL DATA (UNCHANGED) ================= */

  const overallStats = [
    { date: 'Jan', views: 12000, engagement: 850 },
    { date: 'Feb', views: 15000, engagement: 1100 },
    { date: 'Mar', views: 18000, engagement: 1400 },
    { date: 'Apr', views: 22000, engagement: 1800 },
    { date: 'May', views: 28000, engagement: 2300 },
    { date: 'Jun', views: 35000, engagement: 2900 },
  ];

  const lastVideoPerformance = [
    { hour: '0h', views: 120 },
    { hour: '6h', views: 580 },
    { hour: '12h', views: 1240 },
    { hour: '18h', views: 2100 },
    { hour: '24h', views: 3500 },
    { hour: '48h', views: 5200 },
    { hour: '72h', views: 6800 },
  ];

  const aiSuggestions = [
    {
      title: "Top 5 AI tools for students",
      reason: "Trending search volume",
      thumbnail: "🤖",
      potentialViews: "15K–25K",
      confidence: 92
    },
    {
      title: "How AI will change careers",
      reason: "High CTR keywords",
      thumbnail: "⚡",
      potentialViews: "20K–40K",
      confidence: 88
    }
  ];

  const features = [
    {
      name: "Cre8Echo",
      description: "Extract your creator persona and generate personalized scripts, captions, and ideas",
      icon: Sparkles,
      status: "active",
      gradient: "from-blue-600/20 via-purple-600/10 to-slate-800",
      accentColor: "blue"
    },
    {
      name: "Cre8Canvas",
      description: "Create eye-catching, high-converting thumbnails with AI-powered image generation",
      icon: Palette,
      status: "active",
      gradient: "from-purple-600/20 via-pink-600/10 to-slate-800",
      accentColor: "purple"
    },
    {
      name: "Cre8Motion",
      description: "Transform scripts into engaging short-form videos with automated editing",
      icon: Video,
      status: "coming-soon",
      gradient: "from-slate-700/50 to-slate-800",
      accentColor: "indigo"
    },
    {
      name: "Cre8Sight",
      description: "Track engagement, identify trends, and understand what drives growth",
      icon: TrendingUp,
      status: "coming-soon",
      gradient: "from-slate-700/50 to-slate-800",
      accentColor: "violet"
    },
    {
      name: "Cre8Boost",
      description: "Mark projects launch-ready. Get promo assets, multi-platform copy, and distribute to social and Cre8Hub showcase",
      icon: Rocket,
      status: "active",
      gradient: "from-cyan-600/20 via-blue-600/10 to-slate-800",
      accentColor: "cyan"
    },
    {
      name: "Cre8Store",
      description: "Launch your own storefront, list products, and manage customer orders from one dashboard",
      icon: Store,
      status: "active",
      gradient: "from-emerald-600/20 via-cyan-600/10 to-slate-800",
      accentColor: "emerald"
    },
    {
      name: "Cre8Flow",
      description: "Automate repetitive tasks from ideation to publishing",
      icon: Zap,
      status: "coming-soon",
      gradient: "from-slate-700/50 to-slate-800",
      accentColor: "emerald"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
                <img src={logo} alt="Cre8Hub" className="h-16 w-16" onClick={() => navigate('/')}/>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Creator Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg shadow-blue-500/30 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 ring-offset-2 ring-offset-slate-900" onClick={() => navigate('/profile-setup')}>
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
            <Avatar>
              <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ================= Cre8Sight (UPDATED ONLY HERE) ================= */}
        <Card className="bg-white/5 border border-violet-500/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex gap-2">
                <TrendingUp className="text-violet-400" />
                Cre8Sight – Trending Ideas
              </CardTitle>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-slate-800 border border-white/10 px-3 py-1 rounded-md text-sm"
              />
            </div>
            <CardDescription>
              Live trend intelligence from your backend
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading && <p className="text-gray-400">Analyzing trends…</p>}
            {error && <p className="text-red-400">{error}</p>}

            <div className="grid md:grid-cols-2 gap-4">
              {trendData.map((item, i) => (
                <Card key={i} className="bg-violet-500/10 border border-violet-500/20">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>{item.platform}</span>
                      <span className="text-emerald-400 font-bold">
                        🔥 {item.trendScore}
                      </span>
                    </div>
                    <p className="text-sm">Views: {item.potentialViews}</p>
                    <p className="text-xs text-violet-300">{item.reason}</p>
                    <Button size="sm" className="rounded-full bg-violet-600">
                      Use Idea
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ================= FEATURE CARDS (UNCHANGED) ================= */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <Card key={f.name} className="bg-white/5 border border-white/10">
              <CardHeader>
                <f.icon className="text-indigo-400" />
                <CardTitle>{f.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  disabled={f.status !== "active"}
                  onClick={() => f.route && navigate(f.route)}
                  className="w-full rounded-full"
                >
                  {f.status === "active" ? "Launch" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ================= ANALYTICS (UNCHANGED) ================= */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Play className="text-green-400" /> Last Video Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={lastVideoPerformance}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="views" stroke="#6366f1" fill="#6366f1" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Calendar className="text-blue-400" /> Growth Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={overallStats}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="views" stroke="#3b82f6" />
                  <Line dataKey="engagement" stroke="#a855f7" />
                </LineChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg justify-start transition-all"
                  onClick={() => navigate('/cre8echo')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Open Cre8Echo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-full justify-start transition-all"
                  onClick={() => navigate('/cre8store')}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Open Cre8Store
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-full justify-start transition-all"
                  onClick={() => navigate('/profile-setup')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
