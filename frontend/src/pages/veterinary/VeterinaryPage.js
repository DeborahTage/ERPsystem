import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vetApi } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState, LoadingState } from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';
import { AlertTriangle, CalendarDays, HeartPulse, Pill, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const VeterinaryPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [diseaseCases, setDiseaseCases] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('vaccinations');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([vetApi.getVaccinations(), vetApi.getDiseaseCases(), vetApi.getTreatments(), vetApi.getPrescriptions()])
      .then(([v, d, t, p]) => {
        setVaccinations(v.data.data || []);
        setDiseaseCases(d.data.data || []);
        setTreatments(t.data.data || []);
        setPrescriptions(p.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    return {
      totalVaccinations: vaccinations.length,
      scheduledVaccinations: vaccinations.filter(item => item.status === 'SCHEDULED').length,
      activeCases: diseaseCases.filter(item => item.status === 'ACTIVE').length,
      activeTreatments: treatments.filter(item => item.outcome === 'ONGOING').length,
      pendingPrescriptions: prescriptions.filter(item => item.status === 'PENDING').length,
    };
  }, [vaccinations, diseaseCases, treatments, prescriptions]);

  const chartData = useMemo(() => {
    const dates = [...Array(7)].map((_, idx) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - idx));
      return day.toISOString().split('T')[0];
    });
    return dates.map(date => {
      const daily = vaccinations.filter(item => item.scheduledDate?.startsWith(date) || item.actualDate?.startsWith(date));
      return {
        day: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        vaccines: daily.length,
        cases: diseaseCases.filter(item => item.dateDetected?.startsWith(date)).length,
      };
    });
  }, [vaccinations, diseaseCases]);

  const alertItems = diseaseCases
    .filter(caseItem => ['HIGH', 'CRITICAL'].includes(caseItem.severity))
    .slice(0, 3);

  const upcomingVaccinations = vaccinations
    .filter(item => item.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
    .slice(0, 5);

  const panels = [
    { key: 'vaccinations', label: 'Vaccinations' },
    { key: 'disease', label: 'Disease Cases' },
    { key: 'treatments', label: 'Treatments' },
    { key: 'prescriptions', label: 'Prescriptions' },
  ];

  const activeData = useMemo(() => {
    if (activePanel === 'vaccinations') return vaccinations;
    if (activePanel === 'disease') return diseaseCases;
    if (activePanel === 'treatments') return treatments;
    if (activePanel === 'prescriptions') return prescriptions;
    return [];
  }, [activePanel, vaccinations, diseaseCases, treatments, prescriptions]);

  const renderTableHeader = () => {
    switch (activePanel) {
      case 'vaccinations':
        return (
          <TableHead>
            <TableHeader>Farm</TableHeader>
            <TableHeader>Vaccine</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Scheduled</TableHeader>
            <TableHeader>Actual</TableHeader>
          </TableHead>
        );
      case 'disease':
        return (
          <TableHead>
            <TableHeader>Farm</TableHeader>
            <TableHeader>Disease</TableHeader>
            <TableHeader>Severity</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Detected</TableHeader>
          </TableHead>
        );
      case 'treatments':
        return (
          <TableHead>
            <TableHeader>Farm</TableHeader>
            <TableHeader>Drug</TableHeader>
            <TableHeader>Dosage</TableHeader>
            <TableHeader>Schedule</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableHead>
        );
      default:
        return (
          <TableHead>
            <TableHeader>Rx No.</TableHeader>
            <TableHeader>Drug</TableHeader>
            <TableHeader>Qty</TableHeader>
            <TableHeader>Vet</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableHead>
        );
    }
  };

  const renderTableRow = (item) => {
    switch (activePanel) {
      case 'vaccinations':
        return (
          <TableRow key={item.id}>
            <TableCell>{item.farmName || '—'}</TableCell>
            <TableCell>{item.vaccineName || item.batchCode || '—'}</TableCell>
            <TableCell><StatusBadge status={item.status} /></TableCell>
            <TableCell>{formatDate(item.scheduledDate)}</TableCell>
            <TableCell>{formatDate(item.actualDate)}</TableCell>
          </TableRow>
        );
      case 'disease':
        return (
          <TableRow key={item.id}>
            <TableCell>{item.farmName || '—'}</TableCell>
            <TableCell>{item.suspectedDisease || '—'}</TableCell>
            <TableCell><StatusBadge status={item.severity} /></TableCell>
            <TableCell><StatusBadge status={item.status} /></TableCell>
            <TableCell>{formatDate(item.dateDetected)}</TableCell>
          </TableRow>
        );
      case 'treatments':
        return (
          <TableRow key={item.id}>
            <TableCell>{item.farmName || '—'}</TableCell>
            <TableCell>{item.drugName || '—'}</TableCell>
            <TableCell>{item.dosage || '—'}</TableCell>
            <TableCell>{`${formatDate(item.startDate)} → ${formatDate(item.endDate)}`}</TableCell>
            <TableCell><StatusBadge status={item.outcome || 'ONGOING'} /></TableCell>
          </TableRow>
        );
      default:
        return (
          <TableRow key={item.id}>
            <TableCell>{item.prescriptionNumber || '—'}</TableCell>
            <TableCell>{item.drugName || '—'}</TableCell>
            <TableCell>{item.quantity || '—'}</TableCell>
            <TableCell>{item.createdByVet || '—'}</TableCell>
            <TableCell><StatusBadge status={item.status} /></TableCell>
          </TableRow>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-xl bg-gray-200 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-80 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veterinary Operations"
        description="Monitor vaccinations, disease response, treatment execution, and prescription flow across your farms."
        actions={
          <Button variant="primary" onClick={() => navigate('/veterinary/vaccinations/new')}>
            Schedule Vaccination
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Scheduled Vaccinations" value={summary.scheduledVaccinations} icon={CalendarDays} trend="up" trendValue="12%" />
        <KpiCard title="Active Disease Cases" value={summary.activeCases} icon={AlertTriangle} trend="down" trendValue="8%" />
        <KpiCard title="Ongoing Treatments" value={summary.activeTreatments} icon={HeartPulse} trend="up" trendValue="5%" />
        <KpiCard title="Pending Prescriptions" value={summary.pendingPrescriptions} icon={Pill} trend="up" trendValue="18%" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Health Trends</CardTitle>
              <p className="text-sm text-gray-500">Weekly vaccination and disease case activity.</p>
            </div>
            <Badge variant="info">Live</Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="vaccineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="caseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 8px 20px rgba(15,23,42,0.08)', backgroundColor: '#fff' }} />
                <Area type="monotone" dataKey="vaccines" stroke="#3b82f6" fill="url(#vaccineGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="cases" stroke="#f97316" fill="url(#caseGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <div className="space-x-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />Vaccinations</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500" />Disease Cases</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Priority Alerts</CardTitle>
              <p className="text-sm text-gray-500">Critical disease outbreaks requiring attention.</p>
            </div>
            <Badge variant="danger">Urgent</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertItems.length ? alertItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.suspectedDisease || 'Unknown disease'}</p>
                    <p className="text-sm text-gray-500">{item.farmName || 'N/A'} · {formatDate(item.dateDetected)}</p>
                  </div>
                  <StatusBadge status={item.severity} />
                </div>
                <p className="mt-3 text-sm text-gray-600">Affected birds: {item.numberAffected || '—'}</p>
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                No critical alerts at the moment.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Veterinary Command Center</CardTitle>
            <p className="text-sm text-gray-500">Switch between ready-to-operate veterinary records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {panels.map(panel => (
              <Button
                key={panel.key}
                variant={activePanel === panel.key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActivePanel(panel.key)}
              >
                {panel.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <DataTable>
              {renderTableHeader()}
              {activeData.length === 0 ? (
                <TableBody>
                  <tr><td colSpan="5"><EmptyState title="No records yet" description="Start by creating a new veterinary record or refreshing this view." /></td></tr>
                </TableBody>
              ) : (
                <TableBody>
                  {activeData.map(renderTableRow)}
                </TableBody>
              )}
            </DataTable>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Vaccination Timeline</CardTitle>
              <p className="text-sm text-gray-500">Planning for the next five vaccination events.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingVaccinations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                No scheduled vaccinations in the next period.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingVaccinations.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.vaccineName || item.batchCode}</p>
                        <p className="text-sm text-gray-500">{item.farmName}</p>
                      </div>
                      <Badge variant="primary" size="sm">{formatDate(item.scheduledDate)}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>Scheduled Date</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Action Board</CardTitle>
              <p className="text-sm text-gray-500">Quick operations for veterinary coordination.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" size="md" onClick={() => navigate('/veterinary/disease-cases/new')}>
              Report New Disease Case
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/veterinary/treatments/new')}>
              Record Treatment
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/veterinary/prescriptions/new')}>
              New Prescription
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VeterinaryPage;
