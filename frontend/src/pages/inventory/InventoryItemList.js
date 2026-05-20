import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, EmptyState, LoadingState } from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';
import { PackageSearch, AlertTriangle, Clock3, Layers, TrendingUp } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const InventoryItemList = () => {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([inventoryApi.getItems(), inventoryApi.getLowStock(), inventoryApi.getExpiryAlerts()])
      .then(([itemsRes, lowRes, expiryRes]) => {
        setItems(itemsRes.data.data || []);
        setLowStock(lowRes.data.data || []);
        setExpiry(expiryRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const source = view === 'low' ? lowStock : view === 'expiry' ? expiry.map(item => item.item || {}) : items;
    if (!search) return source;
    const query = search.toLowerCase();
    return source.filter(item =>
      item.itemName?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.supplier?.toLowerCase().includes(query) ||
      item.batchNumber?.toLowerCase().includes(query)
    );
  }, [items, lowStock, expiry, view, search]);

  const stockChartData = useMemo(() => {
    const categoryMap = items.reduce((acc, item) => {
      if (!item.category) return acc;
      acc[item.category] = (acc[item.category] || 0) + (item.currentStock || 0);
      return acc;
    }, {});
    return Object.entries(categoryMap).map(([category, stock]) => ({ category, stock }));
  }, [items]);

  const summary = useMemo(() => ({
    totalItems: items.length,
    lowStockItems: lowStock.length,
    expiringSoon: expiry.length,
    averageStock: items.length ? Math.round(items.reduce((sum, item) => sum + (item.currentStock || 0), 0) / items.length) : 0,
  }), [items, lowStock, expiry]);

  const activeData = view === 'expiry' ? expiry : view === 'low' ? lowStock : items;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Track stock levels, expiry alerts, and supply chain health across inventory categories."
        actions={
          <Button variant="primary" onClick={() => navigate('/inventory/items/new')}>
            Add Inventory Item
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Items" value={summary.totalItems} icon={PackageSearch} trend="up" trendValue="6%" />
        <KpiCard title="Low Stock" value={summary.lowStockItems} icon={AlertTriangle} trend="down" trendValue="12%" />
        <KpiCard title="Expiring Soon" value={summary.expiringSoon} icon={Clock3} trend="up" trendValue="18%" />
        <KpiCard title="Average Stock" value={summary.averageStock} icon={TrendingUp} subtitle="per item" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Inventory Overview</CardTitle>
              <p className="text-sm text-gray-500">Stock distribution by category.</p>
            </div>
            <Badge variant="info">Refresh in 5m</Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            {stockChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 8px 20px rgba(15,23,42,0.08)' }} />
                  <Bar dataKey="stock" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">No inventory chart available.</div>
            )}
          </CardContent>
          <CardFooter>
            <span className="text-sm text-gray-500">Stock levels compare current quantity for each category.</span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Low Stock Alerts</CardTitle>
              <p className="text-sm text-gray-500">Items that need restocking soon.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.slice(0, 4).map(item => (
              <div key={item.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.itemName}</p>
                    <p className="text-sm text-gray-500">{item.category || 'General'}</p>
                  </div>
                  <Badge variant="warning">Low</Badge>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, ((item.currentStock || 0) / (item.minimumStockLevel || 1)) * 100)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{item.currentStock || 0} in stock</span>
                  <span>Min {item.minimumStockLevel || 0}</span>
                </div>
              </div>
            ))}
            {!lowStock.length && <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">All stock levels are healthy.</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Inventory Catalog</CardTitle>
            <p className="text-sm text-gray-500">Search, filter and review inventory items.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] w-full max-w-2xl">
            <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="min-w-0" />
            <Select value={view} onChange={e => setView(e.target.value)} options={[
              { value: 'all', label: 'All Items' },
              { value: 'low', label: 'Low Stock' },
              { value: 'expiry', label: 'Expiring' },
            ]} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <DataTable>
              <TableHead>
                <TableHeader>Item</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Min Level</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableHead>
              {loading ? (
                <LoadingState cols={6} />
              ) : filteredItems.length === 0 ? (
                <TableBody>
                  <tr><td colSpan="6"><EmptyState title="No inventory found" description="Try a different search or filter." /></td></tr>
                </TableBody>
              ) : (
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.category || '—'}</TableCell>
                      <TableCell>{item.currentStock || 0}</TableCell>
                      <TableCell>{item.minimumStockLevel || 0}</TableCell>
                      <TableCell><StatusBadge status={item.status || (item.currentStock <= item.minimumStockLevel ? 'LOW' : 'ACTIVE')} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/inventory/items/${item.id}/edit`)}>Edit</Button>
                          <Button variant="primary" size="sm" onClick={() => navigate('/inventory/stock-in', { state: { itemId: item.id } })}>Stock In</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </DataTable>
          </div>
        </CardContent>
        <CardFooter>
          <span className="text-sm text-gray-500">Showing {filteredItems.length} items in {view === 'all' ? 'inventory' : view === 'low' ? 'low stock' : 'expiry'} view.</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InventoryItemList;
