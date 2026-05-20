import React, { useEffect, useMemo, useState } from 'react';
import { dailyRecordApi, inventoryApi, financeApi, pharmacyApi } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState, LoadingState } from '../../components/ui/DataTable';
import { formatDate, formatCurrency } from '../../utils';
import { FileText, Download, BarChart3, CalendarDays, Layers } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const reportTypes = [
  { key: 'daily', label: 'Daily Farm Records', category: 'Operations' },
  { key: 'mortality', label: 'Mortality Summary', category: 'Operations' },
  { key: 'stock', label: 'Current Stock', category: 'Inventory' },
  { key: 'lowstock', label: 'Low Stock', category: 'Inventory' },
  { key: 'expiry', label: 'Expiry Report', category: 'Inventory' },
  { key: 'sales', label: 'Pharmacy Sales', category: 'Pharmacy' },
  { key: 'income', label: 'Income Report', category: 'Finance' },
  { key: 'expenses', label: 'Expense Report', category: 'Finance' },
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState('mortality');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const loadReport = async (reportKey) => {
    setLoading(true);
    try {
      let res;
      if (reportKey === 'mortality' || reportKey === 'daily') res = await dailyRecordApi.getAll();
      else if (reportKey === 'stock') res = await inventoryApi.getCurrentStock();
      else if (reportKey === 'lowstock') res = await inventoryApi.getLowStock();
      else if (reportKey === 'expiry') res = await inventoryApi.getExpiryAlerts();
      else if (reportKey === 'sales') res = await pharmacyApi.getSales();
      else if (reportKey === 'income') res = await financeApi.getIncome();
      else if (reportKey === 'expenses') res = await financeApi.getExpenses();
      setData(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(activeReport); }, [activeReport]);

  const summary = useMemo(() => ({
    total: data.length,
    revenue: data.reduce((sum, item) => sum + (item.totalAmount || 0) + (item.amount || 0), 0),
    peak: data[0] ? data[0].amount || data[0].totalAmount || 0 : 0,
  }), [data]);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const query = search.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(value =>
        value && String(value).toLowerCase().includes(query)
      )
    );
  }, [data, search]);

  const chartData = useMemo(() => {
    const dates = filteredData.slice(0, 7).map(item => ({
      name: item.date ? formatDate(item.date) : item.saleDate ? formatDate(item.saleDate) : 'Report',
      value: item.totalAmount || item.amount || 0,
    }));
    return dates.length ? dates : [{ name: 'No data', value: 0 }];
  }, [filteredData]);

  const columns = useMemo(() => {
    if (['daily', 'mortality'].includes(activeReport)) return [
      { key: 'date', label: 'Date', render: item => formatDate(item.date) },
      { key: 'farmName', label: 'Farm' },
      { key: 'batchCode', label: 'Batch' },
      { key: 'openingBirdCount', label: 'Opening' },
      { key: 'mortality', label: 'Mortality' },
      { key: 'mortalityRate', label: 'Rate', render: item => item.mortalityRate ? `${item.mortalityRate.toFixed(2)}%` : '—' },
      { key: 'eggProduction', label: 'Eggs' },
    ];
    if (['stock', 'lowstock'].includes(activeReport)) return [
      { key: 'itemName', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'unit', label: 'Unit' },
      { key: 'currentStock', label: 'Current Stock' },
      { key: 'minimumStockLevel', label: 'Min Level' },
    ];
    if (activeReport === 'expiry') return [
      { key: 'itemName', label: 'Item', render: item => item.item?.itemName || '—' },
      { key: 'batchNumber', label: 'Batch' },
      { key: 'quantityRemaining', label: 'Qty' },
      { key: 'expiryDate', label: 'Expiry', render: item => formatDate(item.expiryDate) },
    ];
    if (activeReport === 'sales') return [
      { key: 'receiptNumber', label: 'Receipt #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'saleDate', label: 'Date', render: item => formatDate(item.saleDate) },
      { key: 'totalAmount', label: 'Total', render: item => formatCurrency(item.totalAmount) },
      { key: 'paymentMethod', label: 'Payment' },
    ];
    return [
      { key: 'transactionDate', label: 'Date', render: item => formatDate(item.transactionDate) },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', render: item => formatCurrency(item.amount) },
      { key: 'description', label: 'Description' },
    ];
  }, [activeReport]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Center"
        description="Generate business-grade reports, export insights, and analyze operational data across your ERP modules."
        actions={
          <Button variant="primary" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Report Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportTypes.map(report => (
              <button
                key={report.key}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${report.key === activeReport ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setActiveReport(report.key)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{report.label}</p>
                    <p className="text-xs text-gray-500">{report.category}</p>
                  </div>
                  <Badge variant="primary" size="sm">{report.key === activeReport ? 'Active' : 'View'}</Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="xl:col-span-3 grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Snapshot</CardTitle>
                <p className="text-sm text-gray-500">High-level report metrics.</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">Records</p>
                  <p className="mt-3 text-2xl font-semibold text-gray-900">{filteredData.length}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">Estimated Value</p>
                  <p className="mt-3 text-2xl font-semibold text-gray-900">{formatCurrency(summary.revenue)}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">Peak Entry</p>
                  <p className="mt-3 text-2xl font-semibold text-gray-900">{formatCurrency(summary.peak)}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">Date Range</p>
                  <p className="mt-3 text-2xl font-semibold text-gray-900">{dateFrom || 'Start'} - {dateTo || 'End'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Trend Preview</CardTitle>
                <p className="text-sm text-gray-500">Report value trend over recent entries.</p>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#fff' }} />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#reportGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{reportTypes.find(r => r.key === activeReport)?.label}</CardTitle>
              <p className="text-sm text-gray-500">Review filtered report entries.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="min-w-[150px]" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="min-w-[150px]" />
              <Input placeholder="Search report entries..." value={search} onChange={e => setSearch(e.target.value)} className="min-w-[200px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <DataTable>
                <TableHead>
                  {columns.map(col => <TableHeader key={col.label}>{col.label}</TableHeader>)}
                </TableHead>
                {loading ? (
                  <LoadingState cols={columns.length} />
                ) : filteredData.length === 0 ? (
                  <TableBody>
                    <tr><td colSpan={columns.length}><EmptyState title="No report results" description="Try another report or adjust filters." /></td></tr>
                  </TableBody>
                ) : (
                  <TableBody>
                    {filteredData.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        {columns.map(col => (
                          <TableCell key={`${index}-${col.key}`}>
                            {typeof col.render === 'function' ? col.render(item) : item[col.key] ?? '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </DataTable>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
              <span>{filteredData.length} entries</span>
              <Button variant="secondary" size="sm" onClick={() => setSearch('')}>Clear Filters</Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Insights</CardTitle>
              <p className="text-sm text-gray-500">Downloadable analytics and report summaries.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Generated Reports</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{reportTypes.length}</p>
                </div>
                <FileText className="h-6 w-6 text-brand-600" />
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Last exported</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">Today</p>
                </div>
                <Download className="h-6 w-6 text-brand-600" />
              </div>
            </div>
            <Button variant="secondary" size="md" onClick={() => window.print()}>
              Export current report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
