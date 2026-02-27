import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface CaptionCardProps {
  caption: string;
}

const CaptionCard = ({ caption }: CaptionCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [caption]);

  if (!caption) return null;

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-primary/5 overflow-hidden">
      <div
        ref={containerRef}
        className="max-h-40 overflow-y-auto p-6 scroll-smooth"
      >
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse flex-shrink-0" />
          <p className="text-base text-foreground flex-1 leading-relaxed">{caption}</p>
        </div>
      </div>
    </Card>
  );
};

export default CaptionCard;
