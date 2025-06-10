import { useEffect, useState } from "react";
import { api, SecurityTip } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const TipBanner = () => {
  const [tip, setTip] = useState<SecurityTip | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const fetchTip = async () => {
      try {
        const newTip = await api.securityTips.getRandom();
        setTip(newTip);
      } catch (error) {
        console.error("Failed to fetch security tip:", error);
      }
    };
    
    fetchTip();
    
    // Refresh tip every 24 hours
    const interval = setInterval(fetchTip, 1000 * 60 * 60 * 24);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isVisible || !tip) return null;
  
  return (
    <div className="container mx-auto px-4 my-4">
      <Card className="relative bg-cybersec-yellow bg-opacity-20 border-cybersec-yellow">
        <CardContent className="p-4 flex items-center">
          <div className="bg-cybersec-yellow text-navy flex items-center justify-center rounded-full w-10 h-10 mr-4 flex-shrink-0">
            <span className="font-bold">💡</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">Daily Security Tip</h3>
            <p className="text-gray-700">{tip.content}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={() => setIsVisible(false)}
            aria-label="Close tip"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TipBanner;
