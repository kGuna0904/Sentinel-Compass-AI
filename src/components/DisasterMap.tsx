
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

interface DisasterMapProps {
  disasters?: {
    id: string;
    type: 'flood' | 'fire' | 'earthquake' | 'hurricane';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: {
      latitude: number;
      longitude: number;
    };
    name: string;
  }[];
}

// This would normally come from an API call or environment variable
// For demo purposes, we're using a public token, but in a real app,
// this should be handled securely via backend services
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHEwZDJoaWcwejViMmpsc2wzY2Q1aHhlIn0.z1GNjQ73-_-3GUoWMmPl2A';

const DisasterMap = ({ disasters = [] }: DisasterMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiToken, setApiToken] = useState(MAPBOX_TOKEN);
  const [tokenInput, setTokenInput] = useState(false);

  // Color mapping for disaster types
  const colorMap = {
    flood: '#0EA5E9', // blue
    fire: '#ea384c', // red
    earthquake: '#F97316', // orange
    hurricane: '#8B5CF6', // purple
  };

  // Severity radius mapping (in pixels)
  const severityRadius = {
    low: 15,
    medium: 25,
    high: 35,
    critical: 45,
  };

  useEffect(() => {
    if (!mapContainer.current || !apiToken) return;

    // Initialize map
    mapboxgl.accessToken = apiToken;
    
    if (map.current) return; // Initialize only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20], // Default center
      zoom: 1.5,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Clean up on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [apiToken]);

  // Add disaster markers whenever disasters prop changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each disaster
    disasters.forEach(disaster => {
      const { latitude, longitude } = disaster.location;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = colorMap[disaster.type] || '#000000';
      el.style.width = `${severityRadius[disaster.severity]}px`;
      el.style.height = `${severityRadius[disaster.severity]}px`;
      el.style.borderRadius = '50%';
      el.style.opacity = '0.7';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
      
      // Animation for critical and high severity
      if (disaster.severity === 'critical' || disaster.severity === 'high') {
        el.style.animation = 'pulse-alert 2s infinite';
      }
      
      // Add tooltip with disaster info
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="font-weight: bold;">${disaster.name}</div>
         <div>Type: ${disaster.type}</div>
         <div>Severity: ${disaster.severity}</div>`
      );
      
      // Create and store marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
  }, [disasters]);

  const handleSearch = () => {
    if (!map.current || !searchQuery) return;

    // In a real implementation, this would call a geocoding API
    // For demo, we'll simulate with some fixed locations
    const locations: Record<string, [number, number]> = {
      'tokyo': [139.6917, 35.6895],
      'new york': [-74.0060, 40.7128],
      'london': [-0.1278, 51.5074],
      'paris': [2.3522, 48.8566],
      'sydney': [151.2093, -33.8688],
      'rio': [-43.1729, -22.9068],
      'cairo': [31.2357, 30.0444],
      'beijing': [116.4074, 39.9042],
      'moscow': [37.6173, 55.7558],
    };

    const searchLower = searchQuery.toLowerCase();
    
    // Find matching location
    for (const [city, coords] of Object.entries(locations)) {
      if (city.includes(searchLower)) {
        map.current.flyTo({
          center: coords,
          zoom: 9,
          essential: true
        });
        return;
      }
    }
    
    console.log('Location not found in demo data');
  };

  const handleApiTokenSubmit = () => {
    if (apiToken && apiToken.length > 0) {
      setTokenInput(false);
    }
  };

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        {tokenInput ? (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Enter Mapbox API Token</h3>
            <Input
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your Mapbox API token"
              className="mb-2"
            />
            <Button onClick={handleApiTokenSubmit}>Submit</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="map-container" ref={mapContainer} />
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-emergency"></div>
                <span>Fire</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-info"></div>
                <span>Flood</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-warning"></div>
                <span>Earthquake</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
                <span>Hurricane</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisasterMap;
