
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudRain, CloudSnow, CloudLightning, AlertTriangle } from 'lucide-react';

interface WeatherData {
  location: string;
  currentConditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow';
  };
  forecast: {
    day: string;
    condition: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow';
    highTemp: number;
    lowTemp: number;
    precipChance: number;
  }[];
  alerts: {
    type: string;
    severity: 'warning' | 'watch' | 'advisory';
    message: string;
  }[];
}

interface WeatherPanelProps {
  data?: WeatherData;
}

const WeatherPanel = ({ data }: WeatherPanelProps) => {
  // Sample data for demonstration
  const sampleData: WeatherData = {
    location: 'New York City, NY',
    currentConditions: {
      temperature: 72,
      humidity: 65,
      windSpeed: 8,
      condition: 'rain',
    },
    forecast: [
      { day: 'Today', condition: 'rain', highTemp: 75, lowTemp: 65, precipChance: 70 },
      { day: 'Tomorrow', condition: 'cloudy', highTemp: 78, lowTemp: 67, precipChance: 20 },
      { day: 'Wednesday', condition: 'clear', highTemp: 82, lowTemp: 70, precipChance: 10 },
      { day: 'Thursday', condition: 'storm', highTemp: 79, lowTemp: 68, precipChance: 80 },
      { day: 'Friday', condition: 'rain', highTemp: 76, lowTemp: 65, precipChance: 60 },
    ],
    alerts: [
      { 
        type: 'Flood', 
        severity: 'warning', 
        message: 'Flash flood warning in effect until 8:00 PM local time.'
      },
      { 
        type: 'Wind', 
        severity: 'advisory', 
        message: 'Wind advisory in effect, gusts up to 45 mph possible.'
      }
    ]
  };

  const weatherData = data || sampleData;
  
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'rain':
        return <CloudRain className="w-6 h-6 text-info" />;
      case 'storm':
        return <CloudLightning className="w-6 h-6 text-warning" />;
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-info" />;
      default:
        return null;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-emergency-muted border-emergency text-emergency';
      case 'watch':
        return 'bg-warning-muted border-warning text-warning';
      case 'advisory':
        return 'bg-info-muted border-info text-info';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="text-2xl font-semibold">{weatherData.location}</div>
            <div className="flex justify-between items-center">
              <div className="text-4xl font-bold">{weatherData.currentConditions.temperature}°F</div>
              {getWeatherIcon(weatherData.currentConditions.condition)}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="stat-card">
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="text-lg font-medium">{weatherData.currentConditions.humidity}%</div>
              </div>
              <div className="stat-card">
                <div className="text-sm text-muted-foreground">Wind</div>
                <div className="text-lg font-medium">{weatherData.currentConditions.windSpeed} mph</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="forecast">
            <div className="space-y-3">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{day.day}</div>
                    <div className="text-sm text-muted-foreground">
                      Precipitation: {day.precipChance}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(day.condition)}
                    <div>
                      <span className="font-medium">{day.highTemp}°</span> / {day.lowTemp}°
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="alerts">
            {weatherData.alerts.length > 0 ? (
              <div className="space-y-3">
                {weatherData.alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded-lg flex items-start gap-2 ${getSeverityClass(alert.severity)}`}
                  >
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-medium">{alert.type} {alert.severity}</div>
                      <div className="text-sm">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mb-2" />
                <p>No active weather alerts</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeatherPanel;
