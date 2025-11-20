import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Settings2, Users, Save } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function StaffDashboard() {
  const { toast } = useToast();
  const [normalRange, setNormalRange] = useState([70, 130]);
  const [borderlineRange, setBorderlineRange] = useState([130, 180]);
  const [isSaving, setIsSaving] = useState(false);

  const mockPatients = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      healthcareNumber: 'HC001234',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 234-5678',
      healthcareNumber: 'HC002345',
      dateOfBirth: '1992-07-22',
      gender: 'Female',
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'mbrown@example.com',
      phone: '(555) 345-6789',
      healthcareNumber: 'HC003456',
      dateOfBirth: '1978-11-08',
      gender: 'Male',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '(555) 456-7890',
      healthcareNumber: 'HC004567',
      dateOfBirth: '1988-05-30',
      gender: 'Female',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'dwilson@example.com',
      phone: '(555) 567-8901',
      healthcareNumber: 'HC005678',
      dateOfBirth: '1995-09-12',
      gender: 'Male',
    },
  ];

  const handleSaveThresholds = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: 'Thresholds Updated',
      description: 'Blood sugar thresholds have been saved successfully.',
    });
    
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Staff Dashboard</h1>
        <p className="text-muted-foreground">Manage system settings and patient records</p>
      </div>

      {/* Threshold Configuration */}
      <Card data-testid="card-threshold-config">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Blood Sugar Threshold Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Normal Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Normal Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={normalRange[0]}
                  onChange={(e) => setNormalRange([parseInt(e.target.value), normalRange[1]])}
                  className="w-20 text-center"
                  data-testid="input-normal-min"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  value={normalRange[1]}
                  onChange={(e) => setNormalRange([normalRange[0], parseInt(e.target.value)])}
                  className="w-20 text-center"
                  data-testid="input-normal-max"
                />
                <span className="text-sm text-muted-foreground">mg/dL</span>
              </div>
            </div>
            <Slider
              min={50}
              max={200}
              step={5}
              value={normalRange}
              onValueChange={setNormalRange}
              className="w-full"
              data-testid="slider-normal-range"
            />
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <p className="text-sm">
                Values between <span className="font-semibold">{normalRange[0]}</span> and <span className="font-semibold">{normalRange[1]}</span> mg/dL will be marked as Normal
              </p>
            </div>
          </div>

          {/* Borderline Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Borderline Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={borderlineRange[0]}
                  onChange={(e) => setBorderlineRange([parseInt(e.target.value), borderlineRange[1]])}
                  className="w-20 text-center"
                  data-testid="input-borderline-min"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  value={borderlineRange[1]}
                  onChange={(e) => setBorderlineRange([borderlineRange[0], parseInt(e.target.value)])}
                  className="w-20 text-center"
                  data-testid="input-borderline-max"
                />
                <span className="text-sm text-muted-foreground">mg/dL</span>
              </div>
            </div>
            <Slider
              min={100}
              max={250}
              step={5}
              value={borderlineRange}
              onValueChange={setBorderlineRange}
              className="w-full"
              data-testid="slider-borderline-range"
            />
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <p className="text-sm">
                Values between <span className="font-semibold">{borderlineRange[0]}</span> and <span className="font-semibold">{borderlineRange[1]}</span> mg/dL will be marked as Borderline
              </p>
            </div>
          </div>

          {/* Abnormal Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <p className="text-sm">
              Values above <span className="font-semibold">{borderlineRange[1]}</span> mg/dL will be marked as Abnormal
            </p>
          </div>

          <Button onClick={handleSaveThresholds} disabled={isSaving} className="w-full" data-testid="button-save-thresholds">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Threshold Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Patient Records Table */}
      <Card data-testid="card-patient-records">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient Records (Read-Only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Healthcare Number</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPatients.map((patient) => (
                  <TableRow key={patient.id} data-testid={`row-staff-patient-${patient.id}`}>
                    <TableCell className="font-medium" data-testid={`text-staff-patient-name-${patient.id}`}>{patient.name}</TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`text-staff-patient-email-${patient.id}`}>{patient.email}</TableCell>
                    <TableCell className="font-mono text-sm" data-testid={`text-staff-patient-phone-${patient.id}`}>{patient.phone}</TableCell>
                    <TableCell className="font-mono" data-testid={`text-staff-patient-healthcare-${patient.id}`}>{patient.healthcareNumber}</TableCell>
                    <TableCell data-testid={`text-staff-patient-dob-${patient.id}`}>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                    <TableCell data-testid={`text-staff-patient-gender-${patient.id}`}>{patient.gender}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
