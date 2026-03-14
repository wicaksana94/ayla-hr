'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">HR analytics and reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Reports interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
