
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EmergencyActions = () => {
  const { toast } = useToast();

  const handleEmergencyAction = (action: string) => {
    // In a real app, this would trigger API calls, notifications, etc.
    toast({
      title: `${action} initiated`,
      description: "Emergency responders have been notified.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Emergency Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            className="w-full emergency-button"
            onClick={() => handleEmergencyAction('Evacuation')}
          >
            Initiate Evacuation
          </Button>
          
          <Button 
            className="w-full warning-button"
            onClick={() => handleEmergencyAction('Alert')}
          >
            Send Alert to Region
          </Button>
          
          <Button 
            className="w-full info-button"
            onClick={() => handleEmergencyAction('Resources Request')}
          >
            Request Emergency Resources
          </Button>
          
          <Button 
            className="w-full success-button"
            onClick={() => handleEmergencyAction('All Clear')}
          >
            Signal All Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyActions;
