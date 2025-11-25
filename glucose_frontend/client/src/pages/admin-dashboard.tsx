import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, UserPlus, Users, Activity, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // 1. REPORT GENERATION LOGIC
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const year = Number(formData.get('year'));
    const month = formData.get('month') ? Number(formData.get('month')) : undefined;

    try {
      const data = await api.generateReport(year, month);
      if (data.success) {
        setReportData(data.report);
        toast({ title: "Report Generated", description: "Data retrieved from database." });
      } else {
        throw new Error(data.message || "Failed to generate");
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not generate report", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. CREATE USER LOGIC (Specialist/Staff)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName'),
      role: formData.get('role'),
      workingId: formData.get('workingId')
    };

    try {
      const res = await api.createUser(userData);
      if (res.success) {
        toast({ title: "Success", description: "User account created successfully." });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(res.error || "Failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System management and reporting center</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Clinical Reports</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        {/* --- REPORT TAB --- */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Form */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input name="year" type="number" defaultValue={2025} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Month (Optional)</Label>
                    <Select name="month">
                      <SelectTrigger><SelectValue placeholder="All Year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Year</SelectItem>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? "Processing..." : "Generate Statistics"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Report Results */}
            <div className="md:col-span-2 space-y-6">
              {reportData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{reportData.total_active_patients}</div>
                        <p className="text-xs text-muted-foreground">Active Patients</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{reportData.abnormal_count}</div>
                        <p className="text-xs text-muted-foreground text-red-500">Abnormal Readings</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader><CardTitle>Statistics Summary ({reportData.period})</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span>Average Blood Sugar</span>
                        <span className="font-bold">{reportData.avg_sugar_level} mg/dL</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span>Highest Reading</span>
                        <span className="font-bold text-red-500">{reportData.highest_reading} mg/dL</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span>Lowest Reading</span>
                        <span className="font-bold text-blue-500">{reportData.lowest_reading} mg/dL</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="h-full flex items-center justify-center border rounded-lg p-12 bg-muted/10 text-muted-foreground">
                  Select a date range to generate report
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* --- USER MANAGEMENT TAB --- */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Create Staff/Specialist Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="fullName" required placeholder="Dr. Smith" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" required placeholder="doctor@clinic.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" defaultValue="specialist">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="staff">Clinic Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Working ID</Label>
                  <Input name="workingId" required placeholder="EMP-001" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" className="w-full" disabled={isCreatingUser}>
                    {isCreatingUser ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}