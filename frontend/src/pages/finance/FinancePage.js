import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeApi } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState, LoadingState } from '../../components/ui/DataTable';
import { formatDate, formatCurrency } from '../../utils';
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FinancePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([financeApi.getAll(), financeApi.getProfitLoss({})])
      .then(([tRes, plRes]) => {
        setTransactions(tRes.data.data || []);
        setProfitLoss(plRes.data.data || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.transactionType === 'INCOME').reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.transactionType === 'EXPENSE').reduce((sum, item) => sum + (item.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    const cashFlow = transactions.reduce((sum, item) => sum + ((item.transactionType === 'INCOME' ? 1 : -1) * (item.amount || 0)), 0);
    return { totalIncome, totalExpenses, netProfit, cashFlow };
  }, [transactions]);

  const chartData = useMemo(() => {
    const group = {};
    transactions.forEach(item => {
      const date = item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Unknown';
      group[date] = group[date] || { date, income: 0, expenses: 0 };
      if (item.transactionType === 'INCOME') group[date].income += item.amount || 0;
      if (item.transactionType === 'EXPENSE') group[date].expenses += item.amount || 0;
    });
    return Object.values(group).slice(-8);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!search) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(item =>
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.paymentMethod?.toLowerCase().includes(q) ||
      item.recordedBy?.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const activeTransactions = useMemo(() => {
    if (view === 'income') return filteredTransactions.filter(t => t.transactionType === 'INCOME');
    if (view === 'expenses') return filteredTransactions.filter(t => t.transactionType === 'EXPENSE');
    return filteredTransactions;
  }, [filteredTransactions, view]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Dashboard"
        description="Review cash flow, profit and loss, and transaction history in a polished financial operations hub."
        actions={<Button variant="primary" onClick={() => navigate('/finance/new')}>Record Transaction</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Revenue" value={formatCurrency(summary.totalIncome)} icon={DollarSign} trend="up" trendValue="14%" />
        <KpiCard title="Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} trend="down" trendValue="9%" />
        <KpiCard title="Net Profit" value={formatCurrency(summary.netProfit)} icon={Wallet} subtitle="Last 30 days" />
        <KpiCard title="Cash Flow" value={formatCurrency(summary.cashFlow)} icon={PieChart} trend={summary.cashFlow >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(summary.cashFlow / 1000).toFixed(1)}k`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <p className="text-sm text-gray-500">Trend insight for recent financial performance.</p>
            </div>
            <Badge variant="info">Updated hourly</Badge>
          </CardHeader>
          <CardContent className="h-[340px]">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#fff' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No financial trend data available.</div>
            )}
          </CardContent>
          <CardFooter>
            <div className="space-x-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Income</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />Expenses</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cash Position</CardTitle>
              <p className="text-sm text-gray-500">Latest balance and workflow health.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(summary.cashFlow)}</p>
                </div>
                <ShieldCheck className="h-6 w-6 text-brand-600" />
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between gap-2">
                <span>Total Income</span>
                <span className="font-semibold text-gray-900">{formatCurrency(summary.totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Total Expenses</span>
                <span className="font-semibold text-gray-900">{formatCurrency(summary.totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Net Profit</span>
                <span className="font-semibold text-gray-900">{formatCurrency(summary.netProfit)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <p className="text-sm text-gray-500">Browse all financial records with filters and search.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="min-w-[240px]" />
            <Select
              value={view}
              onChange={e => setView(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'expenses', label: 'Expenses' },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <DataTable>
              <TableHead>
                <TableHeader>Date</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Payment</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Recorded By</TableHeader>
              </TableHead>
              {loading ? (
                <LoadingState cols={7} />
              ) : activeTransactions.length === 0 ? (
                <TableBody>
                  <tr><td colSpan="7"><EmptyState title="No transactions available" description="Update filters or record a new transaction." /></td></tr>
                </TableBody>
              ) : (
                <TableBody>
                  {activeTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell><Badge variant={transaction.transactionType === 'INCOME' ? 'success' : 'danger'} size="sm">{transaction.transactionType}</Badge></TableCell>
                      <TableCell>{transaction.category || '—'}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.paymentMethod || '—'}</TableCell>
                      <TableCell>{transaction.description || '—'}</TableCell>
                      <TableCell>{transaction.recordedBy || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </DataTable>
          </div>
        </CardContent>
        <CardFooter>
          <span className="text-sm text-gray-500">Showing {activeTransactions.length} transactions.</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FinancePage;
