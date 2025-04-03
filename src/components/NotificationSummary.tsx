
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface NotificationSummaryProps {
  action: string;
  status: 'success' | 'error' | 'pending';
  recipients: {
    type: string;
    count: number;
  }[];
  timestamp: string;
}

const NotificationSummary = ({ action, status, recipients, timestamp }: NotificationSummaryProps) => {
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{action}</CardTitle>
          {status === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" /> Sent
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <XCircle className="mr-1 h-3 w-3" /> Failed
            </Badge>
          )}
          {status === 'pending' && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="mr-1 h-3 w-3" /> Sending...
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">{timestamp}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium">Recipients:</p>
          <div className="flex flex-wrap gap-2">
            {recipients.map((recipient, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {recipient.type}: {recipient.count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSummary;
