import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState, LoadingState } from '../../components/ui/DataTable';
import { formatDate, formatCurrency } from '../../utils';
import { Activity, BarChart3, DollarSign, Users, TrendingUp, Truck } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PharmacyPage = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('sales');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([pharmacyApi.getSales(), pharmacyApi.getCustomers()])
      .then(([salesRes, customersRes]) => {
        setSales(salesRes.data.data || []);
        setCustomers(customersRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const overview = useMemo(() => {
    const totalRevenue = sales.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalSales = sales.length;
    const activeCustomers = customers.length;
    const pendingPrescriptions = sales.filter(item => item.status === 'PENDING').length;

    return { totalRevenue, totalSales, activeCustomers, pendingPrescriptions };
  }, [sales, customers]);

  const salesTrend = useMemo(() => {
    const map = {};
    sales.forEach(item => {
      const date = item.saleDate ? new Date(item.saleDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Unknown';
      map[date] = (map[date] || 0) + (item.totalAmount || 0);
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [sales]);

  const filteredSales = useMemo(() => {
    if (!search) return sales;
    const q = search.toLowerCase();
    return sales.filter(item =>
      item.customerName?.toLowerCase().includes(q) ||
      item.receiptNumber?.toLowerCase().includes(q) ||
      item.paymentMethod?.toLowerCase().includes(q)
    );
  }, [sales, search]);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(item =>
      item.customerName?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy Operations"
        description="Monitor sales performance, customer demand, and prescription fulfillment in one premium workflow."
        actions={<Button variant="primary" onClick={() => navigate('/pharmacy/sales/new')}>New Sale</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Revenue" value={formatCurrency(overview.totalRevenue)} icon={DollarSign} trend="up" trendValue="14%" />
        <KpiCard title="Total Sales" value={overview.totalSales} icon={TrendingUp} subtitle="Last 30 days" />
        <KpiCard title="Customers" value={overview.activeCustomers} icon={Users} trend="up" trendValue="9%" />
        <KpiCard title="Pending Rx" value={overview.pendingPrescriptions} icon={BarChart3} trend="down" trendValue="5%" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <p className="text-sm text-gray-500">Sales activity over time with payment momentum.</p>
            </div>
            <Badge variant="info">Updated</Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            {salesTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#fff' }} />
                  <Area type="monotone" dataKey="amount" stroke="#16a34a" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No sales chart available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Products</CardTitle>
              <p className="text-sm text-gray-500">Most sold items based on revenue and demand.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sales.slice(0, 4).map(sale => (
              <div key={sale.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sale.customerName || 'Unknown customer'}</p>
                    <p className="text-sm text-gray-500">{formatDate(sale.saleDate)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(sale.totalAmount)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Truck className="h-4 w-4" />
                  <span>{sale.paymentMethod || 'Payment info'}</span>
                </div>
              </div>
            ))}
            {!sales.length && <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">No recent sales activity.</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Pharmacy Workbench</CardTitle>
            <p className="text-sm text-gray-500">Browse your sales ledger and customer relationships.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Input placeholder="Search sales or customer..." value={search} onChange={e => setSearch(e.target.value)} className="min-w-[220px]" />
            <Select
              value={view}
              onChange={e => setView(e.target.value)}
              options={[
                { value: 'sales', label: 'Sales' },
                { value: 'customers', label: 'Customers' },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <DataTable>
              <TableHead>
                {view === 'sales' ? (
                  <>
                    <TableHeader>Receipt</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Total</TableHeader>
                    <TableHeader>Payment</TableHeader>
                    <TableHeader className="text-right">Action</TableHeader>
                  </>
                ) : (
                  <>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader className="text-right">Sales</TableHeader>
                  </>
                )}
              </TableHead>
              {loading ? (
                <LoadingState cols={view === 'sales' ? 6 : 5} />
              ) : (view === 'sales' ? (
                filteredSales.length === 0 ? (
                  <TableBody><tr><td colSpan="6"><EmptyState title="No sales found" description="Adjust your filters or add a new sale." /></td></tr></TableBody>
                ) : (
                  <TableBody>
                    {filteredSales.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.receiptNumber}</TableCell>
                        <TableCell>{item.customerName || 'Walk-in'}</TableCell>
                        <TableCell>{formatDate(item.saleDate)}</TableCell>
                        <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                        <TableCell>{item.paymentMethod || 'Cash'}</TableCell>
                        <TableCell className="text-right"><Button variant="secondary" size="sm" onClick={() => navigate(`/pharmacy/sales/${item.id}/receipt`)}>Receipt</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )
              ) : (
                filteredCustomers.length === 0 ? (
                  <TableBody><tr><td colSpan="5"><EmptyState title="No customers found" description="Search or add a new customer." /></td></tr></TableBody>
                ) : (
                  <TableBody>
                    {filteredCustomers.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>{item.phone || '—'}</TableCell>
                        <TableCell>{item.location || '—'}</TableCell>
                        <TableCell>{item.customerType || '—'}</TableCell>
                        <TableCell className="text-right">{sales.filter(s => s.customerName === item.customerName).length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )
              ))}
            </DataTable>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
            <span>{view === 'sales' ? filteredSales.length : filteredCustomers.length} records displayed</span>
            <span>{view === 'sales' ? `${overview.totalSales} total sales` : `${overview.activeCustomers} active customers`}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PharmacyPage;
