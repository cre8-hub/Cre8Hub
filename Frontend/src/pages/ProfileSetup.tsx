
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Pen, Users, Image, ChartBar, MessageSquare } from "lucide-react";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { 
    loading, 
    updateUserRole,
    createContentCreatorProfile,
    createEntrepreneurProfile,
    createSocialMediaManagerProfile 
  } = useProfile();
  
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Content creator fields
    contentGenre: "",
    // Entrepreneur fields
    businessCategory: "",
    businessDescription: "",
    // Social media manager fields
    clientType: "",
    businessSize: "",
    socialMediaNiche: ""
  });

  const handleRoleSelect = (role: string) => {
    setUserRole(role);
  };

  const handleNext = async () => {
    if (step === 1 && !userRole) {
      toast({
        title: "Please select a role",
        description: "You need to select a role to continue",
        variant: "destructive",
      });
      return;
    }

    if (step === 1) {
      // Update user role in database
      const { error } = await updateUserRole(userRole as any);
      if (error) return;
      
      setStep(2);
      return;
    }

    if (step === 2) {
      // Create role-specific profile
      let result;
      
      if (userRole === "content-creator") {
        if (!formData.contentGenre) {
          toast({
            title: "Please select a genre",
            description: "You need to select a content genre to continue",
            variant: "destructive",
          });
          return;
        }
        result = await createContentCreatorProfile(formData.contentGenre as any);
      } else if (userRole === "entrepreneur") {
        if (!formData.businessCategory || !formData.businessDescription) {
          toast({
            title: "Please complete all fields",
            description: "All fields are required to continue",
            variant: "destructive",
          });
          return;
        }
        result = await createEntrepreneurProfile(
          formData.businessCategory as any,
          formData.businessDescription
        );
      } else if (userRole === "social-media-manager") {
        if (!formData.clientType || !formData.businessSize || !formData.socialMediaNiche) {
          toast({
            title: "Please complete all fields",
            description: "All fields are required to continue",
            variant: "destructive",
          });
          return;
        }
        result = await createSocialMediaManagerProfile(
          formData.clientType as any,
          formData.businessSize as any,
          formData.socialMediaNiche as any
        );
      }

      if (result && !result.error) {
        toast({
          title: "Profile setup complete!",
          description: "Your profile has been successfully set up.",
        });
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cre8-dark to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/43c4d891-861d-4066-b61a-2dc42b49a39b.png" 
            alt="CRE8HUB Logo" 
            className="h-24 mx-auto mb-2"
          />
          <h2 className="mt-2 text-3xl font-bold text-white">Set Up Your Profile</h2>
          <p className="mt-2 text-sm text-gray-400">
            Tell us more about yourself so we can personalize your experience
          </p>
        </div>
        
        <Card className="bg-cre8-dark/50 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              {step === 1 ? "What best describes you?" : userRole === "content-creator" ? 
                "What type of content do you create?" : userRole === "entrepreneur" ? 
                "Tell us about your business" : "Tell us about your social media management"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {step === 1 ? "Choose the option that best fits your role" : "This helps us tailor our features to your needs"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <RadioGroup 
                  className="grid grid-cols-1 gap-4 md:grid-cols-3"
                  onValueChange={handleRoleSelect}
                  value={userRole || ""}
                >
                  <div className={`flex flex-col items-center justify-between rounded-md border-2 p-4 ${userRole === "content-creator" ? "border-cre8-blue bg-cre8-blue/10" : "border-white/10 hover:bg-white/5"}`}>
                    <RadioGroupItem value="content-creator" id="content-creator" className="sr-only" />
                    <Pen className="mb-3 h-6 w-6 text-cre8-blue" />
                    <Label htmlFor="content-creator" className="text-center text-white font-medium">
                      Content Creator
                    </Label>
                  </div>
                  
                  <div className={`flex flex-col items-center justify-between rounded-md border-2 p-4 ${userRole === "entrepreneur" ? "border-cre8-blue bg-cre8-blue/10" : "border-white/10 hover:bg-white/5"}`}>
                    <RadioGroupItem value="entrepreneur" id="entrepreneur" className="sr-only" />
                    <Briefcase className="mb-3 h-6 w-6 text-cre8-blue" />
                    <Label htmlFor="entrepreneur" className="text-center text-white font-medium">
                      Entrepreneur
                    </Label>
                  </div>
                  
                  <div className={`flex flex-col items-center justify-between rounded-md border-2 p-4 ${userRole === "social-media-manager" ? "border-cre8-blue bg-cre8-blue/10" : "border-white/10 hover:bg-white/5"}`}>
                    <RadioGroupItem value="social-media-manager" id="social-media-manager" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-cre8-blue" />
                    <Label htmlFor="social-media-manager" className="text-center text-white font-medium">
                      Social Media Manager
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {step === 2 && userRole === "content-creator" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contentGenre" className="text-white">Content Genre</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, contentGenre: value})}
                    value={formData.contentGenre}
                  >
                    <SelectTrigger className="bg-cre8-dark/70 border-white/20 text-white">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-cre8-dark border-white/20">
                      <SelectItem value="educational"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Educational</div></SelectItem>
                      <SelectItem value="entertainment"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Entertainment</div></SelectItem>
                      <SelectItem value="gaming"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Gaming</div></SelectItem>
                      <SelectItem value="lifestyle"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Lifestyle</div></SelectItem>
                      <SelectItem value="music"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Music</div></SelectItem>
                      <SelectItem value="tech"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Tech</div></SelectItem>
                      <SelectItem value="travel"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Travel</div></SelectItem>
                      <SelectItem value="other"><div className="flex items-center"><Image className="mr-2 h-4 w-4" />Other</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {step === 2 && userRole === "entrepreneur" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessCategory" className="text-white">Business Category</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, businessCategory: value})}
                    value={formData.businessCategory}
                  >
                    <SelectTrigger className="bg-cre8-dark/70 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-cre8-dark border-white/20">
                      <SelectItem value="ecommerce"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />E-commerce</div></SelectItem>
                      <SelectItem value="saas"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />SaaS</div></SelectItem>
                      <SelectItem value="consulting"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />Consulting</div></SelectItem>
                      <SelectItem value="agency"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />Agency</div></SelectItem>
                      <SelectItem value="retail"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />Retail</div></SelectItem>
                      <SelectItem value="manufacturing"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />Manufacturing</div></SelectItem>
                      <SelectItem value="other"><div className="flex items-center"><ChartBar className="mr-2 h-4 w-4" />Other</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-white">Business Description</Label>
                  <Textarea 
                    id="businessDescription"
                    placeholder="Tell us more about your business..."
                    className="bg-cre8-dark/70 border-white/20 text-white min-h-[100px]"
                    value={formData.businessDescription}
                    onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            {step === 2 && userRole === "social-media-manager" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientType" className="text-white">Type of Clients</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, clientType: value})}
                    value={formData.clientType}
                  >
                    <SelectTrigger className="bg-cre8-dark/70 border-white/20 text-white">
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent className="bg-cre8-dark border-white/20">
                      <SelectItem value="influencers">Influencers</SelectItem>
                      <SelectItem value="small-businesses">Small Businesses</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="individuals">Individuals</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessSize" className="text-white">Business Size</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, businessSize: value})}
                    value={formData.businessSize}
                  >
                    <SelectTrigger className="bg-cre8-dark/70 border-white/20 text-white">
                      <SelectValue placeholder="Select business size" />
                    </SelectTrigger>
                    <SelectContent className="bg-cre8-dark border-white/20">
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="small-team">Small Team (2-5)</SelectItem>
                      <SelectItem value="medium">Medium (6-20)</SelectItem>
                      <SelectItem value="large">Large (20+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="socialMediaNiche" className="text-white">Social Media Niche</Label>
                  <Select 
                    onValueChange={(value) => setFormData({...formData, socialMediaNiche: value})}
                    value={formData.socialMediaNiche}
                  >
                    <SelectTrigger className="bg-cre8-dark/70 border-white/20 text-white">
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent className="bg-cre8-dark border-white/20">
                      <SelectItem value="content-creation"><div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Content Creation</div></SelectItem>
                      <SelectItem value="community-management"><div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Community Management</div></SelectItem>
                      <SelectItem value="marketing-campaigns"><div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Marketing Campaigns</div></SelectItem>
                      <SelectItem value="analytics"><div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Analytics & Reporting</div></SelectItem>
                      <SelectItem value="full-service"><div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Full Service</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-cre8-blue to-cre8-purple hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Saving..." : step === 2 ? "Complete Setup" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
