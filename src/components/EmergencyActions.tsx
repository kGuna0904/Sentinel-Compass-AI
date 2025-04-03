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
import { Badge } from '@/components/ui/badge';
import { Ambulance, HeartPulse, Truck, Activity, Warehouse, Utensils, Droplets, AlertOctagon, Bell, HelpingHand, CheckCircle, Loader2 } from 'lucide-react';
import { 
  initiateEvacuation, 
  sendRegionAlert, 
  requestEmergencyResources, 
  signalAllClear 
} from '@/services/emergencyCommunicationService';
import NotificationSummary from './NotificationSummary';

const resourcePredictionSchema = z.object({
  disasterType: z.enum(['flood', 'fire', 'earthquake', 'hurricane']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  populationAffected: z.coerce.number().min(1).max(10000000),
  areaSize: z.coerce.number().min(1).max(100000),
  magnitude: z.coerce.number().min(1).max(10).optional(),
});

type ResourcePredictionFormValues = z.infer<typeof resourcePredictionSchema>;

interface NotificationRecord {
  id: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  recipients: {
    type: string;
    count: number;
  }[];
  timestamp: string;
}

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
    rescueType: string[];
    medicalEquipment: string[];
    vehicleTypes: string[];
    magnitude?: number;
    disasterType: 'flood' | 'fire' | 'earthquake' | 'hurricane';
  }>(null);
  
  const [notificationHistory, setNotificationHistory] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [regionName, setRegionName] = useState("Downtown Metro Area");

  const form = useForm<ResourcePredictionFormValues>({
    resolver: zodResolver(resourcePredictionSchema),
    defaultValues: {
      disasterType: 'flood',
      severity: 'medium',
      populationAffected: 1000,
      areaSize: 100,
    },
  });

  const watchDisasterType = form.watch("disasterType");

  const handleEmergencyAction = async (action: string) => {
    setIsLoading(action);
    
    const notificationId = Date.now().toString();
    const newNotification: NotificationRecord = {
      id: notificationId,
      action,
      status: 'pending',
      recipients: [],
      timestamp: new Date().toLocaleString()
    };
    
    switch (action) {
      case 'Evacuation': {
        newNotification.recipients = [
          { type: 'Team Leaders', count: 1 },
          { type: 'Team Members', count: 2 },
        ];
        setNotificationHistory(prev => [newNotification, ...prev]);
        
        try {
          const result = await initiateEvacuation(regionName);
          if (result) {
            toast({
              title: `${action} initiated`,
              description: "Emergency responders have been notified. Messages sent to team members.",
              variant: "destructive",
            });
            setNotificationHistory(prev => 
              prev.map(n => n.id === notificationId ? { ...n, status: 'success' } : n)
            );
          } else {
            throw new Error("Failed to send all notifications");
          }
        } catch (error) {
          console.error(`Failed to initiate ${action}:`, error);
          toast({
            title: `${action} notification error`,
            description: "Some notifications failed to send. Please try again.",
            variant: "destructive",
          });
          setNotificationHistory(prev => 
            prev.map(n => n.id === notificationId ? { ...n, status: 'error' } : n)
          );
        }
        break;
      }
      
      case 'Alert': {
        newNotification.recipients = [
          { type: 'Team Leaders', count: 1 },
          { type: 'Team Members', count: 2 },
          { type: 'Regional Devices', count: 3 }
        ];
        setNotificationHistory(prev => [newNotification, ...prev]);
        
        try {
          const result = await sendRegionAlert(regionName, "Emergency situation in progress");
          if (result) {
            toast({
              title: `${action} sent to region`,
              description: "Alert has been sent to all devices in the affected area.",
              variant: "destructive",
            });
            setNotificationHistory(prev => 
              prev.map(n => n.id === notificationId ? { ...n, status: 'success' } : n)
            );
          } else {
            throw new Error("Failed to send all alerts");
          }
        } catch (error) {
          console.error(`Failed to send ${action}:`, error);
          toast({
            title: `${action} notification error`,
            description: "Some alerts failed to send. Please try again.",
            variant: "destructive",
          });
          setNotificationHistory(prev => 
            prev.map(n => n.id === notificationId ? { ...n, status: 'error' } : n)
          );
        }
        break;
      }
      
      case 'Resources Request': {
        newNotification.recipients = [
          { type: 'Resource Team Lead', count: 1 },
          { type: 'Resource Coordinators', count: 2 },
        ];
        setNotificationHistory(prev => [newNotification, ...prev]);
        
        const resourcesList = ["Emergency Medical Supplies", "Water Purification Units", "Temporary Shelters"];
        
        try {
          const result = await requestEmergencyResources(regionName, resourcesList);
          if (result) {
            toast({
              title: `${action} initiated`,
              description: "Resource request has been sent to the emergency response team.",
              variant: "destructive",
            });
            setNotificationHistory(prev => 
              prev.map(n => n.id === notificationId ? { ...n, status: 'success' } : n)
            );
          } else {
            throw new Error("Failed to send resource requests");
          }
        } catch (error) {
          console.error(`Failed to request ${action}:`, error);
          toast({
            title: `${action} notification error`,
            description: "Failed to send resource request. Please try again.",
            variant: "destructive",
          });
          setNotificationHistory(prev => 
            prev.map(n => n.id === notificationId ? { ...n, status: 'error' } : n)
          );
        }
        break;
      }
      
      case 'All Clear': {
        newNotification.recipients = [
          { type: 'All Clear Team Lead', count: 1 },
          { type: 'All Clear Team', count: 2 },
          { type: 'Regional Devices', count: 3 }
        ];
        setNotificationHistory(prev => [newNotification, ...prev]);
        
        try {
          const result = await signalAllClear(regionName);
          if (result) {
            toast({
              title: `${action} signal sent`,
              description: "All clear notification has been sent to all affected personnel and devices.",
              variant: "success",
            });
            setNotificationHistory(prev => 
              prev.map(n => n.id === notificationId ? { ...n, status: 'success' } : n)
            );
          } else {
            throw new Error("Failed to send all clear signal");
          }
        } catch (error) {
          console.error(`Failed to signal ${action}:`, error);
          toast({
            title: `${action} notification error`,
            description: "Failed to send all clear signal. Please try again.",
            variant: "destructive",
          });
          setNotificationHistory(prev => 
            prev.map(n => n.id === notificationId ? { ...n, status: 'error' } : n)
          );
        }
        break;
      }
    }
    
    setIsLoading(null);
  };

  const generateResourcePrediction = (values: ResourcePredictionFormValues) => {
    const baseResources = {
      food: 3000,
      water: 5000,
      rescuers: 20,
      medicalStaff: 15,
      shelters: 3,
      capacity: 400,
      vehicles: 10,
    };

    const severityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
      critical: 2.5,
    };

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
        capacity: 0.8,
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

    const populationScale = values.populationAffected / 1000;

    const result = {
      food: Math.round(baseResources.food * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].food * populationScale),
      water: Math.round(baseResources.water * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].water * populationScale),
      rescuers: Math.round(baseResources.rescuers * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].rescuers * populationScale),
      medicalStaff: Math.round(baseResources.medicalStaff * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].medicalStaff * populationScale),
      shelters: Math.round(baseResources.shelters * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].shelters * populationScale * (values.areaSize / 100)),
      capacity: Math.round(baseResources.capacity * disasterAdjustments[values.disasterType].capacity),
      vehicles: Math.round(baseResources.vehicles * severityMultiplier[values.severity] * disasterAdjustments[values.disasterType].vehicles * populationScale),
      magnitude: values.magnitude,
      disasterType: values.disasterType,
      rescueType: [],
      medicalEquipment: [],
      vehicleTypes: [],
    };

    const rescueTypes = {
      flood: ['Boat Rescue Teams', 'Swift Water Technicians', 'Helicopter Rescue Units'],
      fire: ['Wildland Firefighters', 'High-Rise Rescue Teams', 'Hazmat Specialists'],
      earthquake: ['Urban Search & Rescue', 'Heavy Extraction Teams', 'Structural Engineers', 'Canine Units'],
      hurricane: ['Water Rescue Teams', 'Airlift Units', 'Debris Removal Specialists']
    };

    const medicalEquipment = {
      flood: ['Water Purification Systems', 'Antibiotics', 'Tetanus Vaccines', 'Hypothermia Treatment Kits'],
      fire: ['Burn Treatment Units', 'Respiratory Support', 'Eye Wash Stations', 'Smoke Inhalation Kits'],
      earthquake: ['Trauma Surgery Kits', 'Crush Syndrome Treatment', 'Blood Supplies', 'Orthopedic Equipment', 'Portable X-ray Machines'],
      hurricane: ['Field Hospital Units', 'Wound Care Supplies', 'Tetanus Vaccines', 'IV Fluids']
    };

    const vehicleTypes = {
      flood: ['Amphibious Vehicles', 'High-Clearance Trucks', 'Rescue Boats', 'Helicopters'],
      fire: ['Fire Engines', 'Water Tankers', 'Aerial Ladder Trucks', 'Command Vehicles'],
      earthquake: ['Heavy Excavators', 'Search & Rescue Trucks', 'Medical Transport Vehicles', 'Debris Removal Equipment'],
      hurricane: ['High-Water Vehicles', 'Debris Clearance Trucks', 'Evacuation Buses', 'Supply Transport']
    };

    const severityIndexMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const severityIndex = severityIndexMap[values.severity];
    
    result.rescueType = rescueTypes[values.disasterType].slice(0, severityIndex);
    result.medicalEquipment = medicalEquipment[values.disasterType].slice(0, severityIndex);
    result.vehicleTypes = vehicleTypes[values.disasterType].slice(0, severityIndex);
    
    setPredictionResults(result);
    
    toast({
      title: "Resource prediction generated",
      description: "AI has calculated needed resources based on scenario parameters.",
    });
  };

  const onSubmit = (values: ResourcePredictionFormValues) => {
    generateResourcePrediction(values);
  };

  const getDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Emergency Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <FormLabel>Current Region</FormLabel>
          <div className="flex gap-2">
            <Input 
              value={regionName} 
              onChange={(e) => setRegionName(e.target.value)}
              placeholder="Enter region name"
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            className="w-full emergency-button bg-red-600 hover:bg-red-700 text-white"
            onClick={() => handleEmergencyAction('Evacuation')}
            disabled={isLoading === 'Evacuation'}
          >
            {isLoading === 'Evacuation' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initiating Evacuation...</>
            ) : (
              <><AlertOctagon className="mr-2 h-4 w-4" /> Initiate Evacuation</>
            )}
          </Button>
          
          <Button 
            className="w-full warning-button bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => handleEmergencyAction('Alert')}
            disabled={isLoading === 'Alert'}
          >
            {isLoading === 'Alert' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Alert...</>
            ) : (
              <><Bell className="mr-2 h-4 w-4" /> Send Alert to Region</>
            )}
          </Button>
          
          <Button 
            className="w-full info-button bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleEmergencyAction('Resources Request')}
            disabled={isLoading === 'Resources Request'}
          >
            {isLoading === 'Resources Request' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting Resources...</>
            ) : (
              <><HelpingHand className="mr-2 h-4 w-4" /> Request Emergency Resources</>
            )}
          </Button>
          
          <Button 
            className="w-full success-button bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleEmergencyAction('All Clear')}
            disabled={isLoading === 'All Clear'}
          >
            {isLoading === 'All Clear' ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signaling All Clear...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Signal All Clear</>
            )}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4"
              >
                Predict Resource Needs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Resource Management Prediction</DialogTitle>
                <DialogDescription>
                  Enter disaster parameters to predict necessary resources for effective response.
                  <div className="text-xs mt-1">Last updated: {getDateTime()}</div>
                </DialogDescription>
              </DialogHeader>
              
              {predictionResults ? (
                <div className="space-y-6 py-4">
                  <h3 className="font-medium text-lg">Recommended Resources</h3>
                  
                  {predictionResults.magnitude && predictionResults.disasterType === 'earthquake' && (
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-300 dark:border-red-700 animate-pulse">
                      <p className="text-lg font-bold text-red-800 dark:text-red-300">Earthquake Magnitude: {predictionResults.magnitude.toFixed(1)}</p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {predictionResults.magnitude >= 7 ? 'CRITICAL: Major structural damage expected' : 
                         predictionResults.magnitude >= 6 ? 'SEVERE: Significant damage to structures expected' : 
                         predictionResults.magnitude >= 5 ? 'MODERATE: Some structural damage expected' : 
                         'MINOR: Limited structural damage expected'}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        <p className="text-sm font-medium">Food Supply</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.food.toLocaleString()} meals/day</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        <p className="text-sm font-medium">Water Supply</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.water.toLocaleString()} liters/day</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <p className="text-sm font-medium">Rescue Personnel</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.rescuers.toLocaleString()} staff</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4" />
                        <p className="text-sm font-medium">Medical Personnel</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.medicalStaff.toLocaleString()} staff</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        <p className="text-sm font-medium">Evacuation Centers</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.shelters.toLocaleString()} centers</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        <p className="text-sm font-medium">Center Capacity</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.capacity.toLocaleString()} people/center</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <p className="text-sm font-medium">Emergency Vehicles</p>
                      </div>
                      <p className="text-2xl font-bold">{predictionResults.vehicles.toLocaleString()} vehicles</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        <p className="text-sm font-medium">Total Shelter Capacity</p>
                      </div>
                      <p className="text-2xl font-bold">{(predictionResults.shelters * predictionResults.capacity).toLocaleString()} people</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium text-md">Specialized Requirements</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Ambulance className="h-4 w-4" /> 
                          Required Rescue Teams
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {predictionResults.rescueType.map((type, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{type}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <HeartPulse className="h-4 w-4" /> 
                          Medical Equipment Needed
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {predictionResults.medicalEquipment.map((equipment, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{equipment}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Truck className="h-4 w-4" /> 
                          Vehicle Types Required
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {predictionResults.vehicleTypes.map((vehicle, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{vehicle}</Badge>
                          ))}
                        </div>
                      </div>
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
                            Approximate size of affected area in square kilometers
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    {watchDisasterType === "earthquake" && (
                      <FormField
                        control={form.control}
                        name="magnitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Earthquake Magnitude (Richter scale)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                placeholder="e.g. 6.5" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Magnitude on the Richter scale (1.0 to 10.0)
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter>
                      <Button type="submit">Generate Prediction</Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        {notificationHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recent Notifications</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notificationHistory.slice(0, 5).map((notification) => (
                <NotificationSummary
                  key={notification.id}
                  action={notification.action}
                  status={notification.status}
                  recipients={notification.recipients}
                  timestamp={notification.timestamp}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyActions;
