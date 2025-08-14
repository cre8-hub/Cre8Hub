import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlatformCard } from "./PlatformCard";
import { Youtube, Instagram, Twitter, Linkedin, Send, Paperclip } from "lucide-react";

// In your platforms array:
const platforms = [
    {
      id: "youtube",
      title: "YouTube",
      description: "Long-form video content",
      icon: <Youtube className="w-10 h-10" /> // changed
    },
    {
      id: "instagram",
      title: "Instagram",
      description: "Visual storytelling with engaging captions",
      icon: <Instagram className="w-full h-full" /> // changed
    },
    {
      id: "twitter",
      title: "Twitter",
      description: "Concise, viral-worthy posts and threads",
      icon: <Twitter className="w-full h-full" /> // changed
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      description: "Professional insights and thought leadership",
      icon: <Linkedin className="w-full h-full text-cre8-purple" /> // changed
    }
  ];

export function ContentGenerator() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [personifyEnabled, setPersonifyEnabled] = useState(false);
  const [prompt, setPrompt] = useState("");

  const isYouTubeSelected = selectedPlatform === "youtube";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
          Hey! Content Creator
        </h1>
        <p className="text-xl text-muted-foreground">
          What platform can I help you create content for?
        </p>
      </div>

      {/* Platform Selection */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform.id as any}
              title={platform.title}
              description={platform.description}
              onSelect={() => setSelectedPlatform(platform.id)}
            />
          ))}
        </div>

      {/* Content Input */}
      {selectedPlatform && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <Textarea
              placeholder="Describe the content you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-white/20 backdrop-blur-md  rounded-2xl resize-none text-gray-100 placeholder:text-white/40  transition-all duration-300"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="bg-gray-800 rounded-full hover:bg-white hover:text-black"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach file
              </Button>
              <Button 
                className="bg-gray-800 rounded-full hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
                disabled={!prompt.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}