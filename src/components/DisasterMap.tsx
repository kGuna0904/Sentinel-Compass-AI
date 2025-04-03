import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  mapboxToken?: string;
}

const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVtb3VzZXIyMDI1IiwiYSI6ImNscm1rOTgyYTBsN3YyanBsMWhmb2xuOHIifQ.sTmW8qmLWb_1ZRuR1oVK8g';

const DisasterMap = ({ disasters = [], mapboxToken }: DisasterMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiToken, setApiToken] = useState(mapboxToken || DEFAULT_MAPBOX_TOKEN);
  const [tokenInput, setTokenInput] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const colorMap = {
    flood: '#0EA5E9',
    fire: '#ea384c',
    earthquake: '#F97316',
    hurricane: '#8B5CF6',
  };

  const severityRadius = {
    low: 15,
    medium: 25,
    high: 35,
    critical: 45,
  };

  useEffect(() => {
    if (mapboxToken) {
      setApiToken(mapboxToken);
    }
  }, [mapboxToken]);

  const initializeMap = () => {
    if (!mapContainer.current || !apiToken) return;

    setMapError(null);

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      mapboxgl.accessToken = apiToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 20],
        zoom: 1.5,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Error loading map. Please check your Mapbox token.');
      });

      map.current.on('load', () => {
        addDisasterMarkers();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please try a different Mapbox token.');
    }
  };

  const addDisasterMarkers = () => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    disasters.forEach(disaster => {
      const { latitude, longitude } = disaster.location;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = colorMap[disaster.type] || '#000000';
      el.style.width = `${severityRadius[disaster.severity]}px`;
      el.style.height = `${severityRadius[disaster.severity]}px`;
      el.style.borderRadius = '50%';
      el.style.opacity = '0.7';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

      if (disaster.severity === 'critical' || disaster.severity === 'high') {
        el.style.animation = 'pulse-alert 2s infinite';
      }

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="font-weight: bold;">${disaster.name}</div>
         <div>Type: ${disaster.type}</div>
         <div>Severity: ${disaster.severity}</div>`
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [apiToken]);

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      addDisasterMarkers();
    }
  }, [disasters]);

  const handleSearch = () => {
    if (!map.current || !searchQuery) return;

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
      initializeMap();
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
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-1">
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground"
                onClick={() => setTokenInput(true)}
              >
                Change API Token
              </Button>
            </div>
            
            {mapError ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                <p className="font-medium">Map Error</p>
                <p className="text-sm">{mapError}</p>
                <Button 
                  className="mt-2" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTokenInput(true)}
                >
                  Update Mapbox Token
                </Button>
              </div>
            ) : (
              <div className="map-container" ref={mapContainer} />
            )}
            
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colorMap.fire }}></div>
                <span>Fire</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colorMap.flood }}></div>
                <span>Flood</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colorMap.earthquake }}></div>
                <span>Earthquake</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colorMap.hurricane }}></div>
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
