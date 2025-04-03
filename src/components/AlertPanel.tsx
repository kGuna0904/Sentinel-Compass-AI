
import { useState } from 'react';
import { Bell, BellRing, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'emergency' | 'warning' | 'info';
  message: string;
  location: string;
  timestamp: string;
  read: boolean;
}

interface AlertPanelProps {
  initialAlerts?: Alert[];
}

const AlertPanel = ({ initialAlerts = [] }: AlertPanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const { toast } = useToast();

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
    toast({
      title: "All alerts marked as read",
      description: "You can still view them in your alert history.",
    });
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertCircle className="h-5 w-5 text-emergency" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-info" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Badge className="bg-emergency hover:bg-emergency">Emergency</Badge>;
      case 'warning':
        return <Badge className="bg-warning hover:bg-warning">Warning</Badge>;
      case 'info':
        return <Badge className="bg-info hover:bg-info">Info</Badge>;
      default:
        return <Badge className="bg-info hover:bg-info">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-primary animate-pulse-alert" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            Alerts
            {unreadCount > 0 && (
              <Badge className="bg-primary hover:bg-primary ml-2">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Bell className="h-10 w-10 mb-2" />
              <p>No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    !alert.read 
                      ? 'bg-accent/30 border-primary' 
                      : 'bg-card border-border'
                  }`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="font-medium">{alert.location}</span>
                    </div>
                    {getAlertBadge(alert.type)}
                  </div>
                  <p className="text-sm mb-1">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp}
                    </span>
                    {!alert.read && (
                      <Badge variant="outline" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertPanel;
