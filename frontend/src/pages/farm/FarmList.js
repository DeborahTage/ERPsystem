import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmApi } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, TableHead, TableHeader, TableBody, TableRow, TableCell, LoadingState } from '../../components/ui/DataTable';
import { Search, Plus, Filter, MoreHorizontal, Building2, MapPin, Users } from 'lucide-react';

const FarmList = () => {
  const [farms, setFarms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    farmApi.getAll()
      .then(r => {
        const data = r.data.data || [];
        setFarms(data);
        setFiltered(data);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load farms'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = farms;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f => 
        f.farmName?.toLowerCase().includes(q) ||
        f.location?.toLowerCase().includes(q) ||
        f.farmType?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(f => f.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, farms]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="success">Active</Badge>;
      case 'INACTIVE': return <Badge variant="default">Inactive</Badge>;
      case 'MAINTENANCE': return <Badge variant="warning">Maintenance</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Farm Management"
        description="Manage all poultry farms, track capacity, and monitor performance."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Farms' }]}
        actions={
          <Button onClick={() => navigate('/farms/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Farm
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-600 hover:text-red-800 font-medium">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="small">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Farms</p>
              <p className="text-xl font-semibold text-gray-900">{farms.length}</p>
            </div>
          </div>
        </Card>
        <Card padding="small">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-semibold text-gray-900">{farms.filter(f => f.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </Card>
        <Card padding="small">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Capacity</p>
              <p className="text-xl font-semibold text-gray-900">{farms.reduce((s, f) => s + (f.capacity || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search farms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <DataTable>
          <TableHead>
            <TableHeader>Farm Name</TableHeader>
            <TableHeader>Location</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Capacity</TableHeader>
            <TableHeader>Manager</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableHead>
          {loading ? (
            <LoadingState cols={7} />
          ) : (
            <TableBody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-8 w-8 text-gray-300" />
                    <p className="font-medium text-gray-900">No farms found</p>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map(farm => (
                  <TableRow key={farm.id} onClick={() => navigate(`/farms/${farm.id}/edit`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{farm.farmName}</p>
                          <p className="text-xs text-gray-500">ID: {farm.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{farm.location || '-'}</TableCell>
                    <TableCell>{farm.farmType || '-'}</TableCell>
                    <TableCell>{farm.capacity?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{farm.assignedFarmManagerName || 'Unassigned'}</TableCell>
                    <TableCell>{getStatusBadge(farm.status)}</TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={e => { e.stopPropagation(); navigate(`/farms/${farm.id}/edit`); }}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          )}
        </DataTable>
        
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filtered.length} of {farms.length} farms</span>
        </div>
      </Card>
    </div>
  );
};

export default FarmList;
