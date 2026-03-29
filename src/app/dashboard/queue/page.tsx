'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useCallback, useState, useTransition } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getPatientQueue, updateQueueStatus, callNextPatient,
} from '@/app/dashboard/actions';
import { AlertTriangle, ShieldCheck, Siren, Stethoscope, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type QueueItem = {
  id: string;
  patientName: string;
  date: string;
  status: 'waiting' | 'in-progress' | 'completed';
  summaryId: number | null;
  triageCode: 'red' | 'yellow' | 'green' | null;
  isMyPatient: boolean;
};

const TriageIcon = ({ code }: { code: string | null }) => {
  switch (code) {
    case 'red':    return <Siren className="h-4 w-4 text-red-500" />;
    case 'yellow': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'green':  return <ShieldCheck className="h-4 w-4 text-green-500" />;
    default:       return null;
  }
};

const TriageBadge = ({ code }: { code: string | null }) => {
  const variants = { red: 'destructive', yellow: 'secondary', green: 'default' } as const;
  const labels  = { red: 'Emergency', yellow: 'Urgent', green: 'Non-Urgent' };
  return (
    <Badge variant={variants[code as keyof typeof variants] ?? 'outline'}>
      {labels[code as keyof typeof labels] ?? 'Unknown'}
    </Badge>
  );
};

export default function PatientQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isCalling, startCallTransition] = useTransition();

  const loadQueue = useCallback(async () => {
    if (queue.length === 0) setLoading(true);
    try {
      setQueue(await getPatientQueue());
    } catch {
      // silently fail on poll
    } finally {
      setLoading(false);
    }
  }, [queue.length]);

  useEffect(() => {
    loadQueue();
    const id = setInterval(loadQueue, 5000);
    return () => clearInterval(id);
  }, [loadQueue]);

  const handleCallNext = () => {
    startCallTransition(async () => {
      const result = await callNextPatient();
      toast({
        title: result.success ? 'Calling Patient' : 'Action Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) loadQueue();
    });
  };

  const handleComplete = async (queueId: number) => {
    const result = await updateQueueStatus({ queueId, status: 'completed' });
    toast({
      title: result.success ? 'Patient Completed' : 'Action Failed',
      description: result.success ? 'Patient moved to history.' : result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) loadQueue();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live queue — priority ordered by triage level.
          </p>
        </div>
        <Button
          onClick={handleCallNext}
          disabled={isCalling}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          {isCalling
            ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            : <Play className="h-4 w-4 fill-current" />}
          Call Next Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Queue</CardTitle>
          <CardDescription>Patients currently waiting or being seen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Triage</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden md:table-cell">Check-in</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32 rounded-md" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : queue.length > 0 ? (
                queue.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      'transition-colors',
                      item.isMyPatient && item.status === 'in-progress'
                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500'
                        : item.triageCode === 'red'
                          ? 'bg-red-500/5 hover:bg-red-500/10'
                          : '',
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TriageIcon code={item.triageCode} />
                        <TriageBadge code={item.triageCode} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.patientName}</span>
                        {item.isMyPatient && (
                          <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" /> Being seen by you
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {item.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'in-progress' ? 'default' : 'secondary'}
                        className={cn(item.status === 'in-progress' ? 'bg-blue-500 hover:bg-blue-600' : '')}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {item.isMyPatient && item.status === 'in-progress' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8"
                            onClick={() => handleComplete(Number(item.id))}
                          >
                            Complete
                          </Button>
                        )}
                        {item.summaryId && (
                          <Button variant="ghost" size="sm" asChild className="h-8">
                            <Link href={`/dashboard/summary/${item.summaryId}`}>Details</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No patients in the queue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
