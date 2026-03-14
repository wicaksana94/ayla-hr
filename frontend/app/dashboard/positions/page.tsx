'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PositionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Positions</h1>
          <p className="text-muted-foreground">Manage positions</p>
        </div>
        <Button>Add Position</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Position List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Position management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
