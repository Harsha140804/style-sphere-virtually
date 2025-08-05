import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GenderSelectionProps {
  onGenderSelect: (gender: 'male' | 'female') => void;
}

export const GenderSelection = ({ onGenderSelect }: GenderSelectionProps) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Select Your Gender</h3>
        <p className="text-muted-foreground">
          This helps us show you the most relevant clothing options
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 hover:bg-accent transition-colors cursor-pointer" 
              onClick={() => onGenderSelect('female')}>
          <div className="text-center">
            <div className="text-4xl mb-3">👩</div>
            <Button variant="outline" className="w-full">
              Female
            </Button>
          </div>
        </Card>
        
        <Card className="p-6 hover:bg-accent transition-colors cursor-pointer" 
              onClick={() => onGenderSelect('male')}>
          <div className="text-center">
            <div className="text-4xl mb-3">👨</div>
            <Button variant="outline" className="w-full">
              Male
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};