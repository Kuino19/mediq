import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

export default function DoctorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and view all doctors at your hospital.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Directory</CardTitle>
          <CardDescription>All registered doctors for this hospital.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="rounded-full bg-primary/10 p-5">
              <Stethoscope className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Doctor management features are being built. Check back soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
