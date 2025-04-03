
import { useState } from 'react';
import DisasterMap from '@/components/DisasterMap';
import AlertPanel from '@/components/AlertPanel';
import WeatherPanel from '@/components/WeatherPanel';
import EmergencyActions from '@/components/EmergencyActions';
import DisasterStats from '@/components/DisasterStats';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [mapboxToken, setMapboxToken] = useState<string>('pk.eyJ1IjoiZGVtb3VzZXIyMDI1IiwiYSI6ImNscm1rOTgyYTBsN3YyanBsMWhmb2xuOHIifQ.sTmW8qmLWb_1ZRuR1oVK8g');
  
  // Sample disaster data
  const [disasters, setDisasters] = useState([
    {
      id: '1',
      type: 'flood' as const,
      severity: 'high' as const,
      location: {
        latitude: 29.7604,
        longitude: -95.3698
      },
      name: 'Houston Flooding'
    },
    {
      id: '2',
      type: 'fire' as const,
      severity: 'critical' as const,
      location: {
        latitude: 34.0522,
        longitude: -118.2437
      },
      name: 'Los Angeles Wildfire'
    },
    {
      id: '3',
      type: 'hurricane' as const,
      severity: 'high' as const,
      location: {
        latitude: 25.7617,
        longitude: -80.1918
      },
      name: 'Miami Hurricane'
    },
    {
      id: '4',
      type: 'earthquake' as const,
      severity: 'medium' as const,
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      name: 'San Francisco Earthquake'
    }
  ]);

  // Sample alert data
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'emergency' as const,
      message: 'Multiple structure fires reported. Evacuation orders issued for zones A, B, and C.',
      location: 'Los Angeles, CA',
      timestamp: '10 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'warning' as const,
      message: 'Flash flood watch upgraded to warning. Expect rapid water rise in low-lying areas.',
      location: 'Houston, TX',
      timestamp: '25 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'info' as const,
      message: 'Hurricane tracking 150 miles offshore. Prepare for potential landfall in 48 hours.',
      location: 'Miami, FL',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: '4',
      type: 'warning' as const,
      message: 'Aftershocks likely in the next 24-48 hours. Maintain earthquake safety protocols.',
      location: 'San Francisco, CA',
      timestamp: '3 hours ago',
      read: true
    }
  ]);

  const refreshData = () => {
    // In a real app, this would fetch fresh data from APIs
    toast({
      title: "Data refreshed",
      description: "All disaster information has been updated",
    });
    
    // Real-time data simulation - update timestamp
    const timestamp = new Date().toLocaleString();
    document.getElementById('last-updated')?.setAttribute('data-timestamp', timestamp);
  };

  const updateMapboxToken = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mapbox token updated",
      description: "The map will now reload with your API token",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sentinel Compass AI</h1>
          <p className="text-muted-foreground max-w-3xl">
            AI-powered disaster management platform for real-time situational awareness, 
            predictive analytics, and emergency response coordination.
          </p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={refreshData}>
                Refresh Data
              </Button>
            </div>
            <div className="text-sm text-muted-foreground" id="last-updated">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </header>

        {/* Mapbox Token Input */}
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <form onSubmit={updateMapboxToken} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <Input 
                type="text" 
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                placeholder="Enter your Mapbox API token" 
                className="w-full"
              />
            </div>
            <Button type="submit" size="sm">
              <MapPin className="mr-2 h-4 w-4" />
              Update Map
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            To display the map, you need a Mapbox API token. Get one at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Map takes 2/3 of the screen on large displays */}
          <div className="lg:col-span-2 space-y-6">
            <DisasterMap disasters={disasters} mapboxToken={mapboxToken} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisasterStats />
              <EmergencyActions />
            </div>
          </div>

          {/* Sidebar - 1/3 of the screen on large displays */}
          <div className="space-y-6">
            <AlertPanel initialAlerts={alerts} />
            <WeatherPanel />
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Sentinel Compass AI - Disaster Management Platform</p>
          <p className="mt-1">© 2025 - Version 1.0.0</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
