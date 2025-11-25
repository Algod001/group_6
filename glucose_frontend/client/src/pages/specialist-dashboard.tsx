import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SpecialistDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All Patients');
  const [patients, setPatients] = useState<any[]>([]);
  
  // New State for "View Details"
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientReadings, setPatientReadings] = useState<any[]>([]);

  // 1. Fetch Patients
  useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient'); // [cite: 118]
      if (data) setPatients(data);
    };
    fetchPatients();
  }, []);

  // 2. Fetch Details when a patient is clicked [cite: 109]
  const handleViewDetails = async (patient: any) => {
    setSelectedPatient(patient);
    const { data } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patient.id)
      .order('timestamp', { ascending: false });
    
    if (data) setPatientReadings(data);
  };

  // 3. Filter Logic (Search by Name)
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Specialist Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your assigned patients</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader><CardTitle>Patient List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.full_name || 'Unnamed'}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(patient)} // Connect the button
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPatients.length === 0 && (
                <TableRow>
                   <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                     No patients found.
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Patient History: {selectedPatient?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Readings</h3>
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Value (mg/dL)</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Food</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientReadings.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No readings found.</TableCell></TableRow>
                  ) : (
                    patientReadings.map((reading) => (
                      <TableRow key={reading.reading_id}>
                        <TableCell>{new Date(reading.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-bold">{reading.value}</TableCell>
                        <TableCell>
                           <Badge variant={reading.category === 'Abnormal' ? 'destructive' : 'outline'}>
                             {reading.category}
                           </Badge>
                        </TableCell>
                        <TableCell>{reading.food_intake || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}