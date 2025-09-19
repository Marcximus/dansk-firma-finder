import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, DollarSign, Scale, Search, Filter, Eye, Mail, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface Lead {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service_type: 'legal' | 'accounting';
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  source: string;
  lead_value_dkk: number | null;
  conversion_date: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadMetrics {
  totalLeads: number;
  newLeads: number;
  conversionRate: number;
  totalValue: number;
  legalLeads: number;
  accountingLeads: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadMetrics>({
    totalLeads: 0,
    newLeads: 0,
    conversionRate: 0,
    totalValue: 0,
    legalLeads: 0,
    accountingLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('30');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadNotes, setLeadNotes] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, [periodFilter]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, serviceFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on period filter
      const daysAgo = parseInt(periodFilter);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as Lead[];
      setLeads(typedData);
      calculateMetrics(typedData);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (leadsData: Lead[]) => {
    const total = leadsData.length;
    const newLeads = leadsData.filter(lead => lead.status === 'new').length;
    const convertedLeads = leadsData.filter(lead => lead.status === 'converted').length;
    const conversionRate = total > 0 ? (convertedLeads / total) * 100 : 0;
    const totalValue = leadsData
      .filter(lead => lead.lead_value_dkk)
      .reduce((sum, lead) => sum + (lead.lead_value_dkk || 0), 0);
    const legalLeads = leadsData.filter(lead => lead.service_type === 'legal').length;
    const accountingLeads = leadsData.filter(lead => lead.service_type === 'accounting').length;

    setMetrics({
      totalLeads: total,
      newLeads,
      conversionRate,
      totalValue: totalValue / 100, // Convert from øre to DKK
      legalLeads,
      accountingLeads,
    });
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.service_type === serviceFilter);
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string, notes?: string, value?: number) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'converted') {
        updateData.conversion_date = new Date().toISOString();
        if (value) {
          updateData.lead_value_dkk = value * 100; // Convert DKK to øre
        }
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead status updated successfully',
      });

      fetchLeads();
      setSelectedLead(null);
      setLeadNotes('');
      setLeadValue('');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'default',
      contacted: 'secondary',
      converted: 'default',
      closed: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const serviceDistributionData = [
    { name: 'Legal Services', value: metrics.legalLeads, color: COLORS[0] },
    { name: 'Accounting Services', value: metrics.accountingLeads, color: COLORS[1] },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage leads for legal and accounting services
          </p>
        </div>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Today</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.newLeads} new leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Converting leads to sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lead Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalValue.toLocaleString()} DKK</div>
            <p className="text-xs text-muted-foreground">
              From converted leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Requested</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.legalLeads >= metrics.accountingLeads ? 'Legal' : 'Accounting'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.max(metrics.legalLeads, metrics.accountingLeads)} requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Breakdown by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Current status of all leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { status: 'New', count: leads.filter(l => l.status === 'new').length },
                { status: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
                { status: 'Converted', count: leads.filter(l => l.status === 'converted').length },
                { status: 'Closed', count: leads.filter(l => l.status === 'closed').length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Leads List</CardTitle>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="accounting">Accounting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{lead.name}</div>
                        {lead.company && (
                          <div className="text-sm text-muted-foreground">{lead.company}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell className="capitalize">{lead.service_type}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{format(new Date(lead.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Lead Details</DialogTitle>
                            </DialogHeader>
                            {selectedLead && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Name</Label>
                                    <p className="text-sm">{selectedLead.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="text-sm">{selectedLead.email}</p>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="text-sm">{selectedLead.phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>Company</Label>
                                    <p className="text-sm">{selectedLead.company || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>Service Type</Label>
                                    <p className="text-sm capitalize">{selectedLead.service_type}</p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <p className="text-sm">{getStatusBadge(selectedLead.status)}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Message</Label>
                                  <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedLead.message}</p>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="status-update">Update Status</Label>
                                    <Select onValueChange={(value) => {
                                      if (value === 'converted') {
                                        // Show value input for converted leads
                                      } else {
                                        updateLeadStatus(selectedLead.id, value);
                                      }
                                    }}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="converted">Converted</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="lead-value">Lead Value (DKK)</Label>
                                    <Input
                                      id="lead-value"
                                      type="number"
                                      placeholder="Enter value in DKK"
                                      value={leadValue}
                                      onChange={(e) => setLeadValue(e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => updateLeadStatus(
                                      selectedLead.id,
                                      'converted',
                                      leadNotes,
                                      leadValue ? parseFloat(leadValue) : undefined
                                    )}
                                    className="w-full"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Converted
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};