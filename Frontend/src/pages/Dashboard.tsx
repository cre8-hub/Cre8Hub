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
    { name: "Cre8Echo", icon: Sparkles, route: "/cre8echo", status: "active" },
    { name: "Cre8Canvas", icon: Palette, route: "/cre8canvas", status: "active" },
    { name: "Cre8Motion", icon: Video, route: "", status: "soon" },
    { name: "Cre8Sight", icon: TrendingUp, route: "/cre8sight", status: "active" },
    { name: "Cre8Reach", icon: Target, route: "", status: "soon" },
    { name: "Cre8Flow", icon: Zap, route: "", status: "soon" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ================= HEADER ================= */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} className="h-10 w-10 cursor-pointer" onClick={() => navigate('/')} />
            <h1 className="text-xl font-bold">Creator Dashboard</h1>
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
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
