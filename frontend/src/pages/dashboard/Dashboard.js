import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { farmApi, flockApi, dailyRecordApi } from '../../api';
import { KpiCard } from '../../components/ui/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Building2, Bird, Skull, Egg, Wheat, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../../utils';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmsRes, flocksRes, recordsRes] = await Promise.allSettled([
          farmApi.getAll(),
          flockApi.getAll(),
          dailyRecordApi.getAll({ limit: 7 }),
        ]);

        const farms = farmsRes.value?.data?.data || [];
        const flocks = flocksRes.value?.data?.data || [];
        const records = recordsRes.value?.data?.data || [];

        const activeFarms = farms.filter(f => f.status === 'ACTIVE');
        const activeFlocks = flocks.filter(f => f.status === 'ACTIVE');
        const currentBirds = flocks.reduce((sum, f) => sum + (f.currentBirdCount || 0), 0);
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(r => r.date === today);
        const todayMortality = todayRecords.reduce((sum, r) => sum + (r.mortality || 0), 0);
        const todayEggs = todayRecords.reduce((sum, r) => sum + (r.eggProduction || 0), 0);

        setStats({
          totalFarms: farms.length,
          activeFarms: activeFarms.length,
          activeFlocks: activeFlocks.length,
          currentBirds,
          todayMortality,
          todayEggs,
        });

        const last7 = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        
        setChartData(last7.map(date => {
          const recs = records.filter(r => r.date === date);
          return {
            day: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
            eggs: recs.reduce((s, r) => s + (r.eggProduction || 0), 0),
            mortality: recs.reduce((s, r) => s + (r.mortality || 0), 0),
          };
        }));

        const a = [];
        if (todayMortality > 10) a.push({ t: 'danger', m: t('messages.error') + `: ${todayMortality} birds` });
        if (activeFarms.length === 0) a.push({ t: 'warning', m: t('dashboard.totalFarms') });
        setAlerts(a);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.welcome')}</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, <span className="font-medium text-gray-900">{user?.fullName || 'User'}</span></p>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              a.t === 'danger' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              {a.m}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index={1} title={t('dashboard.totalFarms')} value={stats?.totalFarms || 0} icon={Building2} trend="up" trendValue="12%" />
        <KpiCard index={2} title={t('dashboard.totalFlocks')} value={stats?.activeFlocks || 0} icon={Bird} trend="up" trendValue="5%" />
        <KpiCard index={3} title={t('dashboard.activeUsers')} value={(stats?.currentBirds || 0).toLocaleString()} icon={Bird} subtitle={t('dashboard.overview')} />
        <KpiCard index={4} title={t('dashboard.totalRevenue')} value={formatCurrency(12450)} icon={Skull} trend="up" trendValue="23%" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index={5} title={t('dashboard.totalInventory')} value={(stats?.todayEggs || 0).toLocaleString()} icon={Egg} trend="up" trendValue="8%" />
        <KpiCard index={6} title={t('dashboard.lowStockItems')} value="3" icon={TrendingUp} trend="up" />
        <KpiCard index={7} title={t('dashboard.pendingVisits')} value={`${chartData.reduce((s, d) => s + d.mortality, 0)} kg`} icon={Wheat} subtitle={t('reports.dateRange')} />
        <KpiCard index={8} title={t('dashboard.recentActivity')} value="8" icon={TrendingUp} trend="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover className="animate-slide-up stagger-3 opacity-0">
          <CardHeader><CardTitle>Production & Mortality (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="eggs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3}/><stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/></linearGradient>
                    <linearGradient id="mort" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.3}/><stop offset="95%" stopColor={COLORS[3]} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="eggs" stroke={COLORS[0]} fill="url(#eggs)" strokeWidth={2} />
                  <Area type="monotone" dataKey="mortality" stroke={COLORS[3]} fill="url(#mort)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card hover className="animate-slide-up stagger-4 opacity-0">
          <CardHeader><CardTitle>Farm Performance Comparison</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Farm A', eggs: 4200, mortality: 12 },
                  { name: 'Farm B', eggs: 3800, mortality: 8 },
                  { name: 'Farm C', eggs: 5100, mortality: 15 },
                  { name: 'Farm D', eggs: 3400, mortality: 6 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: 8, border: '1px solid #e5e7eb'}} />
                  <Bar dataKey="eggs" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mortality" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover className="lg:col-span-2 animate-slide-up stagger-5 opacity-0">
          <CardHeader><CardTitle>Recent Farm Records</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { farm: 'Sunrise Poultry', date: 'Today', eggs: 1250, mortality: 3, status: 'normal' },
                { farm: 'Green Valley', date: 'Today', eggs: 980, mortality: 1, status: 'normal' },
                { farm: 'Highland Farms', date: 'Yesterday', eggs: 1100, mortality: 5, status: 'warning' },
                { farm: 'Valley View', date: 'Yesterday', eggs: 870, mortality: 2, status: 'normal' },
              ].map((r, i) => (
                <div key={i} className="group flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm group-hover:bg-brand-200">
                      <Building2 className="h-4 w-4 text-brand-600 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.farm}</p>
                      <p className="text-xs text-gray-500">{r.date} · {r.eggs.toLocaleString()} eggs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{r.mortality} deaths</span>
                    <Badge variant={r.status === 'warning' ? 'warning' : 'success'}>
                      {r.status === 'warning' ? 'Check' : 'OK'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card hover className="animate-slide-up stagger-6 opacity-0">
          <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Egg Production</span>
                  <span className="font-medium text-gray-900">87%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out" style={{width: '87%'}} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Feed Efficiency</span>
                  <span className="font-medium text-gray-900">92%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out delay-100" style={{width: '92%'}} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Vaccination Coverage</span>
                  <span className="font-medium text-gray-900">78%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out delay-200" style={{width: '78%'}} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Inventory Stock</span>
                  <span className="font-medium text-gray-900">65%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out delay-300" style={{width: '65%'}} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
