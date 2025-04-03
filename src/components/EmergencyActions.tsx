
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const resourcePredictionSchema = z.object({
  disasterType: z.enum(['flood', 'fire', 'earthquake', 'hurricane']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  populationAffected: z.coerce.number().min(1).max(10000000),
  areaSize: z.coerce.number().min(1).max(100000),
});

type ResourcePredictionFormValues = z.infer<typeof resourcePredictionSchema>;

const EmergencyActions = () => {
  const { toast } = useToast();
  const [predictionResults, setPredictionResults] = useState<null | {
    food: number;
    water: number;
    rescuers: number;
    medicalStaff: number;
    shelters: number;
    capacity: number;
    vehicles: number;
  }>(null);

  const form = useForm<ResourcePredictionFormValues>({
    resolver: zodResolver(resourcePredictionSchema),
    defaultValues: {
      disasterType: 'flood',
      severity: 'medium',
      populationAffected: 1000,
      areaSize: 100,
    },
  });

  const handleEmergencyAction = (action: string) => {
    // In a real app, this would trigger API calls, notifications, etc.
    toast({
      title: `${action} initiated`,
      description: "Emergency responders have been notified.",
      variant: "destructive",
    });
  };

  const generateResourcePrediction = (values: ResourcePredictionFormValues) => {
    // In a real app, this would use an AI model to predict resources
    // For demo purposes, we'll use a simple calculation
    
    // Base resource values per 1000 people
    const baseResources = {
      food: 3000, // meals per day
      water: 5000, // liters per day
      rescuers: 20, // personnel
      medicalStaff: 15, // personnel
      shelters: 3, // evacuation centers
      capacity: 400, // people per shelter
      vehicles: 10, // emergency vehicles
    };
    
    // Severity multipliers
    const severityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
      critical: 2.5,
    };
    
    // Disaster type adjustments (relative to base)
    const disasterAdjustments: Record<string, Record<string, number>> = {
      flood: {
        food: 1.2,
        water: 1.5,
        rescuers: 1.3,
        medicalStaff: 1.0,
        shelters: 1.2,
        capacity: 1.0,
        vehicles: 1.5,
      },
      fire: {
        food: 1.0,
        water: 1.3,
        rescuers: 1.5,
        medicalStaff: 1.2,
        shelters: 1.0,
        capacity: 1.0,
        vehicles: 1.2,
      },
      earthquake: {
        food: 1.3,
        water: 1.4,
        rescuers: 2.0,
        medicalStaff: 1.8,
        shelters: 1.5,
        capacity: 0.8, // reduced capacity due to safety concerns
        vehicles: 1.3,
      },
      hurricane: {
        food: 1.4,
        water: 1.3,
        rescuers: 1.4,
        medicalStaff: 1.3,
        shelters: 1.5,
        capacity: 0.9,
        vehicles: 1.1,
      },
    };
    
    // Scale by population
    const populationScale = values.populationAffected / 1000;
    
    // Calculate resources based on disaster type, severity, and population
    const result = {
      food: Math.round(baseResources.food * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].food * populationScale),
      water: Math.round(baseResources.water * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].water * populationScale),
      rescuers: Math.round(baseResources.rescuers * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].rescuers * populationScale),
      medicalStaff: Math.round(baseResources.medicalStaff * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].medicalStaff * populationScale),
      shelters: Math.round(baseResources.shelters * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].shelters * populationScale * (values.areaSize / 100)),
      capacity: Math.round(baseResources.capacity * disasterAdjustments[values.disasterType].capacity),
      vehicles: Math.round(baseResources.vehicles * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].vehicles * populationScale),
    };
    
    setPredictionResults(result);
    
    toast({
      title: "Resource prediction generated",
      description: "AI has calculated needed resources based on scenario parameters.",
    });
  };

  const onSubmit = (values: ResourcePredictionFormValues) => {
    generateResourcePrediction(values);
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4"
              >
                Predict Resource Needs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>AI Resource Management Prediction</DialogTitle>
                <DialogDescription>
                  Enter disaster parameters to predict necessary resources for effective response.
                </DialogDescription>
              </DialogHeader>
              
              {predictionResults ? (
                <div className="space-y-4 py-4">
                  <h3 className="font-medium text-lg">Recommended Resources</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Food Supply</p>
                      <p className="text-2xl font-bold">{predictionResults.food.toLocaleString()} meals/day</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Water Supply</p>
                      <p className="text-2xl font-bold">{predictionResults.water.toLocaleString()} liters/day</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Rescue Personnel</p>
                      <p className="text-2xl font-bold">{predictionResults.rescuers.toLocaleString()} staff</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Medical Personnel</p>
                      <p className="text-2xl font-bold">{predictionResults.medicalStaff.toLocaleString()} staff</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Evacuation Centers</p>
                      <p className="text-2xl font-bold">{predictionResults.shelters.toLocaleString()} centers</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Center Capacity</p>
                      <p className="text-2xl font-bold">{predictionResults.capacity.toLocaleString()} people/center</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Emergency Vehicles</p>
                      <p className="text-2xl font-bold">{predictionResults.vehicles.toLocaleString()} vehicles</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total Shelter Capacity</p>
                      <p className="text-2xl font-bold">{(predictionResults.shelters * predictionResults.capacity).toLocaleString()} people</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setPredictionResults(null)}
                  >
                    Recalculate
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="disasterType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disaster Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select disaster type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flood">Flood</SelectItem>
                              <SelectItem value="fire">Fire</SelectItem>
                              <SelectItem value="earthquake">Earthquake</SelectItem>
                              <SelectItem value="hurricane">Hurricane</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="populationAffected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Population Affected</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 1000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated number of people in affected area
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="areaSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area Size (km²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 100" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Approximate size of affected area
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Generate Prediction</Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyActions;
