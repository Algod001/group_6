import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, FileText, TrendingUp, Users, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingUser(true);
    
    // Simulate API call to POST /api/admin/create-user
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'User Created',
      description: 'New user account has been created successfully.',
    });
    
    setIsCreatingUser(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGeneratingReport(true);
    
    // Simulate API call to POST /api/reports/generate
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockReportData = {
      totalPatients: 142,
      avgSugar: 128.5,
      topTriggers: [
        { trigger: 'High carb breakfast', count: 34 },
        { trigger: 'Skipped medication', count: 28 },
        { trigger: 'Stress/lack of sleep', count: 22 },
      ],
      normalReadings: 856,
      borderlineReadings: 124,
      abnormalReadings: 78,
    };
    
    setReportData(mockReportData);
    
    toast({
      title: 'Report Generated',
      description: 'Monthly report has been generated successfully.',
    });
    
    setIsGeneratingReport(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Administrator Dashboard</h1>
        <p className="text-muted-foreground">Manage users and generate system reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card data-testid="card-user-management">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@example.com"
                  data-testid="input-user-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  data-testid="input-user-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select name="role" required>
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-fullname">Full Name</Label>
                <Input
                  id="user-fullname"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  data-testid="input-user-fullname"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-dob">Date of Birth</Label>
                  <Input
                    id="user-dob"
                    name="dateOfBirth"
                    type="date"
                    data-testid="input-user-dob"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-gender">Gender</Label>
                  <Select name="gender">
                    <SelectTrigger data-testid="select-user-gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-healthcare">Healthcare Number (Optional)</Label>
                <Input
                  id="user-healthcare"
                  name="healthcareNumber"
                  placeholder="HC123456"
                  data-testid="input-user-healthcare"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isCreatingUser} data-testid="button-create-user">
                <UserPlus className="h-4 w-4 mr-2" />
                {isCreatingUser ? 'Creating...' : 'Create User Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reports Center */}
        <div className="space-y-6">
          <Card data-testid="card-reports-center">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Monthly Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-year">Year</Label>
                    <Select name="year" defaultValue="2024" required>
                      <SelectTrigger data-testid="select-report-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-month">Month</Label>
                    <Select name="month" defaultValue="11" required>
                      <SelectTrigger data-testid="select-report-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isGeneratingReport} data-testid="button-generate-report">
                  <FileText className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Report Results */}
          {reportData && (
            <Card data-testid="card-report-results">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                    </div>
                    <p className="text-3xl font-bold" data-testid="text-total-patients">{reportData.totalPatients}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Avg Sugar</p>
                    </div>
                    <p className="text-3xl font-bold font-mono" data-testid="text-avg-sugar">
                      {reportData.avgSugar}
                      <span className="text-sm text-muted-foreground ml-1">mg/dL</span>
                    </p>
                  </div>
                </div>

                {/* Reading Distribution */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Reading Distribution
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <span className="text-sm">Normal Readings</span>
                      <span className="font-semibold">{reportData.normalReadings}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                      <span className="text-sm">Borderline Readings</span>
                      <span className="font-semibold">{reportData.borderlineReadings}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <span className="text-sm">Abnormal Readings</span>
                      <span className="font-semibold">{reportData.abnormalReadings}</span>
                    </div>
                  </div>
                </div>

                {/* Top Triggers */}
                <div className="space-y-3">
                  <h4 className="font-medium">Top Abnormal Triggers</h4>
                  <div className="space-y-2">
                    {reportData.topTriggers.map((trigger: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="text-sm">{trigger.trigger}</span>
                        <span className="font-semibold text-muted-foreground">{trigger.count} cases</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
