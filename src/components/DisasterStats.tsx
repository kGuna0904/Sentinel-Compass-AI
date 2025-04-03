
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatItem {
  label: string;
  value: number;
  max: number;
  type: 'success' | 'warning' | 'emergency' | 'info';
}

interface DisasterStatsProps {
  stats?: StatItem[];
}

const DisasterStats = ({ stats }: DisasterStatsProps) => {
  // Sample data for demonstration
  const sampleStats: StatItem[] = [
    { label: 'Affected Areas', value: 7, max: 12, type: 'warning' },
    { label: 'Resource Deployment', value: 65, max: 100, type: 'success' },
    { label: 'Alert Coverage', value: 82, max: 100, type: 'info' },
    { label: 'Risk Level', value: 45, max: 100, type: 'emergency' },
  ];

  const displayStats = stats || sampleStats;

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success bg-success';
      case 'warning':
        return 'text-warning bg-warning';
      case 'emergency':
        return 'text-emergency bg-emergency';
      case 'info':
        return 'text-info bg-info';
      default:
        return 'text-primary bg-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Disaster Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayStats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>{stat.label}</span>
                <span>
                  {typeof stat.value === 'number' && typeof stat.max === 'number'
                    ? `${stat.value}/${stat.max}`
                    : stat.value}
                </span>
              </div>
              <Progress 
                value={(stat.value / stat.max) * 100} 
                className={`h-2 ${getColorClass(stat.type)}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterStats;
