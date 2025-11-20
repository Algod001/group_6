import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react';
import { BloodSugarChart } from '@/components/blood-sugar-chart';
import { useToast } from '@/hooks/use-toast';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name: string;
  email: string;
  lastReading: number;
  lastReadingDate: string;
  status: 'normal' | 'borderline' | 'abnormal';
  abnormalCount: number;
}

export default function SpecialistDashboard() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      lastReading: 145,
      lastReadingDate: '2024-11-20T08:30:00Z',
      status: 'borderline',
      abnormalCount: 2,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      lastReading: 185,
      lastReadingDate: '2024-11-20T07:15:00Z',
      status: 'abnormal',
      abnormalCount: 5,
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'mbrown@example.com',
      lastReading: 110,
      lastReadingDate: '2024-11-19T22:00:00Z',
      status: 'normal',
      abnormalCount: 0,
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      lastReading: 155,
      lastReadingDate: '2024-11-20T06:45:00Z',
      status: 'borderline',
      abnormalCount: 3,
    },
  ];

  const filteredPatients = mockPatients.filter(p => {
    if (filter === 'abnormal') return p.status === 'abnormal';
    if (filter === 'borderline') return p.status === 'borderline';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" data-testid="badge-status-normal">Normal</Badge>;
      case 'borderline':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" data-testid="badge-status-borderline">Borderline</Badge>;
      case 'abnormal':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" data-testid="badge-status-abnormal">Abnormal</Badge>;
      default:
        return null;
    }
  };
  
  // ... inside your component ...
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    const fetchPatients = async () => {
      // Fetch patients from the 'profiles' table where role is 'patient'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient');
        
      if (data) setPatients(data);
    };
    fetchPatients();
  }, []);

  const aiAlerts = [
    'Elevated readings detected after evening meals - pattern observed over 5 days',
    'Morning fasting glucose trending upward - 15% increase from baseline',
    'Recommended medication adherence check - irregular pattern detected',
  ];

  const handleSendFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: 'Feedback Sent',
      description: 'Your recommendation has been sent to the patient.',
    });
    
    setIsSubmitting(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Specialist Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your assigned patients</p>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Label className="text-sm font-medium">Filter Patients:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="abnormal">Abnormal Readings Only</SelectItem>
                <SelectItem value="borderline">Borderline Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              <span>{filteredPatients.length} patients</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List Table */}
      <Card data-testid="card-patient-list">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Reading</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abnormal Count</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover-elevate" data-testid={`row-patient-${patient.id}`}>
                  <TableCell className="font-medium" data-testid={`text-patient-name-${patient.id}`}>{patient.name}</TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-patient-email-${patient.id}`}>{patient.email}</TableCell>
                  <TableCell data-testid={`text-patient-reading-${patient.id}`}>
                    <span className="font-mono text-lg">{patient.lastReading}</span>
                    <span className="text-sm text-muted-foreground ml-1">mg/dL</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                  <TableCell data-testid={`text-patient-abnormal-count-${patient.id}`}>
                    <div className="flex items-center gap-2">
                      {patient.abnormalCount > 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{patient.abnormalCount}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">0</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(patient.lastReadingDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => setSelectedPatient(patient)}
                      data-testid={`button-view-patient-${patient.id}`}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Detail Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-patient-detail">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPatient?.name}</DialogTitle>
            <p className="text-muted-foreground">{selectedPatient?.email}</p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Patient Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                {selectedPatient && getStatusBadge(selectedPatient.status)}
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Last Reading</p>
                <p className="text-2xl font-bold font-mono">{selectedPatient?.lastReading} <span className="text-sm text-muted-foreground">mg/dL</span></p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Abnormalities</p>
                <p className="text-2xl font-bold">{selectedPatient?.abnormalCount}</p>
              </div>
            </div>

            {/* Chart */}
            <BloodSugarChart data={patientChartData} />

            {/* AI Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  AI-Detected Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiAlerts.map((alert, index) => (
                    <li key={index} className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{alert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Feedback Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Send Specialist Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your Recommendation</Label>
                    <Textarea
                      id="feedback"
                      name="feedback"
                      placeholder="Provide personalized guidance for this patient..."
                      rows={4}
                      required
                      data-testid="input-feedback"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} data-testid="button-send-feedback">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Recommendation'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
