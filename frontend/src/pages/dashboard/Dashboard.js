import React, { useEffect, useState } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { farmApi, flockApi, dailyRecordApi } from '../../api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, ROLES } from '../../utils';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeFarms: 0,
    totalFlocks: 0,
    activeFlocks: 0,
    totalBirds: 0,
    currentBirds: 0,
    todayMortality: 0,
    totalFeedUsed: 0,
    totalEggProduction: 0,
    avgMortalityRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [farmsRes, flocksRes, recordsRes] = await Promise.all([
          farmApi.getAll(),
          flockApi.getAll(),
          dailyRecordApi.getAll(),
        ]);

        const farms = farmsRes.data?.data || [];
        const flocks = flocksRes.data?.data || [];
        const records = recordsRes.data?.data || [];

        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(r => r.date === today);

        const activeFarms = farms.filter(f => f.status === 'ACTIVE');
        const activeFlocks = flocks.filter(f => f.status === 'ACTIVE');

        const totalBirds = flocks.reduce((sum, f) => sum + (f.initialBirdCount || 0), 0);
        const currentBirds = flocks.reduce((sum, f) => sum + (f.currentBirdCount || 0), 0);
        const todayMortality = todayRecords.reduce((sum, r) => sum + (r.mortality || 0), 0);
        const totalFeedUsed = records.reduce((sum, r) => sum + (r.feedConsumed || 0), 0);
        const totalEggProduction = records.reduce((sum, r) => sum + (r.eggProduction || 0), 0);

        const totalMortality = records.reduce((sum, r) => sum + (r.mortality || 0), 0);
        const avgMortalityRate = totalBirds > 0 ? ((totalMortality / totalBirds) * 100).toFixed(2) : 0;

        setStats({
          totalFarms: farms.length,
          activeFarms: activeFarms.length,
          totalFlocks: flocks.length,
          activeFlocks: activeFlocks.length,
          totalBirds,
          currentBirds,
          todayMortality,
          totalFeedUsed: totalFeedUsed.toFixed(2),
          totalEggProduction,
          avgMortalityRate,
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const adminCards = [
    { title: 'Total Farms', value: stats.totalFarms, icon: '🏡', color: 'success' },
    { title: 'Active Farms', value: stats.activeFarms, icon: '🏠', color: 'primary' },
    { title: 'Total Flocks', value: stats.totalFlocks, icon: '🐔', color: 'info' },
    { title: 'Active Flocks', value: stats.activeFlocks, icon: '�', color: 'warning' },
    { title: 'Total Birds', value: stats.totalBirds.toLocaleString(), icon: '�', color: 'success' },
    { title: 'Current Birds', value: stats.currentBirds.toLocaleString(), icon: '✅', color: 'primary' },
    { title: "Today's Mortality", value: stats.todayMortality, icon: '⚠️', color: 'danger' },
    { title: 'Avg Mortality Rate', value: `${stats.avgMortalityRate}%`, icon: '�', color: stats.avgMortalityRate > 5 ? 'danger' : 'success' },
    { title: 'Total Feed Used', value: `${stats.totalFeedUsed} kg`, icon: '🌾', color: 'info' },
    { title: 'Total Eggs', value: stats.totalEggProduction.toLocaleString(), icon: '🥚', color: 'warning' },
  ];

  const farmManagerCards = [
    { title: 'My Farms', value: stats.activeFarms, icon: '🏡', color: 'success' },
    { title: 'Active Flocks', value: stats.activeFlocks, icon: '🐔', color: 'primary' },
    { title: 'Current Birds', value: stats.currentBirds.toLocaleString(), icon: '✅', color: 'info' },
    { title: "Today's Mortality", value: stats.todayMortality, icon: '⚠️', color: 'danger' },
    { title: 'Feed Used (Total)', value: `${stats.totalFeedUsed} kg`, icon: '🌾', color: 'warning' },
    { title: 'Egg Production', value: stats.totalEggProduction.toLocaleString(), icon: '🥚', color: 'success' },
    { title: 'Mortality Rate', value: `${stats.avgMortalityRate}%`, icon: '📉', color: stats.avgMortalityRate > 5 ? 'danger' : 'success' },
    { title: 'Birds Lost', value: (stats.totalBirds - stats.currentBirds).toLocaleString(), icon: '�', color: 'secondary' },
  ];

  const vetCards = [
    { title: 'Active Flocks', value: stats.activeFlocks, icon: '🐔', color: 'primary' },
    { title: 'Current Birds', value: stats.currentBirds.toLocaleString(), icon: '✅', color: 'success' },
    { title: "Today's Mortality", value: stats.todayMortality, icon: '⚠️', color: 'danger' },
    { title: 'Mortality Rate', value: `${stats.avgMortalityRate}%`, icon: '📉', color: stats.avgMortalityRate > 5 ? 'danger' : 'warning' },
  ];

  const storeCards = [
    { title: 'Total Farms', value: stats.totalFarms, icon: '🏡', color: 'success' },
    { title: 'Active Flocks', value: stats.activeFlocks, icon: '�', color: 'primary' },
    { title: 'Feed Used', value: `${stats.totalFeedUsed} kg`, icon: '🌾', color: 'info' },
  ];

  let cards = adminCards;
  if (hasRole(ROLES.FARM_MANAGER)) cards = farmManagerCards;
  else if (hasRole(ROLES.VETERINARY_OFFICER, ROLES.VET)) cards = vetCards;
  else if (hasRole(ROLES.STORE_KEEPER, ROLES.STORE)) cards = storeCards;

  if (loading) {
    return (
      <div>
        <h5 className="fw-bold mb-1">Dashboard</h5>
        <p className="text-muted small mb-4">Welcome back, {user?.fullName}</p>
        <LoadingSpinner text="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div>
      <h5 className="fw-bold mb-1">Dashboard</h5>
      <p className="text-muted small mb-4">Welcome back, {user?.fullName}</p>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-danger" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </Alert>
      )}
      
      <Row className="g-3">
        {cards.map((card, i) => (
          <Col key={i} xs={12} sm={6} lg={3}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
