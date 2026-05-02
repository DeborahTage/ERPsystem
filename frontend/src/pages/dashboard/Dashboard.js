import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, ROLES } from '../../utils';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        let res;
        if (hasRole(ROLES.ADMIN, ROLES.GENERAL_MANAGER)) res = await dashboardApi.admin();
        else if (hasRole(ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER)) res = await dashboardApi.farmManager();
        else if (hasRole(ROLES.STORE_KEEPER)) res = await dashboardApi.store();
        else if (hasRole(ROLES.VETERINARY_OFFICER)) res = await dashboardApi.vet();
        else if (hasRole(ROLES.PHARMACY_SALES)) res = await dashboardApi.pharmacy();
        else if (hasRole(ROLES.FINANCE_OFFICER)) res = await dashboardApi.finance();
        if (res) setData(res.data.data);
      } catch (e) {}
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const adminCards = [
    { title: 'Active Farms', value: data.totalFarms ?? '-', icon: '🏡', color: 'success' },
    { title: 'Active Flocks', value: data.totalActiveFlocks ?? '-', icon: '🐔', color: 'primary' },
    { title: "Today's Mortality", value: data.todayMortality ?? 0, icon: '⚠️', color: 'danger' },
    { title: "Today's Sales", value: formatCurrency(data.todayPharmacySales), icon: '💊', color: 'info' },
    { title: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: '💰', color: 'success' },
    { title: 'Total Expenses', value: formatCurrency(data.totalExpenses), icon: '📉', color: 'warning' },
    { title: 'Net Profit/Loss', value: formatCurrency(data.netProfitLoss), icon: '📊', color: data.netProfitLoss >= 0 ? 'success' : 'danger' },
    { title: 'Pending Alerts', value: data.pendingAlerts ?? 0, icon: '🔔', color: 'warning' },
  ];

  const farmCards = [
    { title: 'Active Farms', value: data.totalFarms ?? '-', icon: '🏡', color: 'success' },
    { title: 'Active Flocks', value: data.activeFlocks ?? '-', icon: '🐔', color: 'primary' },
    { title: "Today's Mortality", value: data.todayMortality ?? 0, icon: '⚠️', color: 'danger' },
    { title: 'Upcoming Vaccinations', value: data.upcomingVaccinations ?? 0, icon: '💉', color: 'info' },
  ];

  const storeCards = [
    { title: 'Total Items', value: data.totalItems ?? '-', icon: '📦', color: 'primary' },
    { title: 'Expiring Items', value: data.expiringItems ?? 0, icon: '⏰', color: 'warning' },
  ];

  const vetCards = [
    { title: 'Upcoming Vaccinations', value: data.upcomingVaccinations ?? 0, icon: '💉', color: 'primary' },
    { title: 'Missed Vaccinations', value: data.missedVaccinations ?? 0, icon: '❌', color: 'danger' },
    { title: 'Active Disease Cases', value: data.activeDiseaseCases ?? 0, icon: '🦠', color: 'warning' },
  ];

  const pharmacyCards = [
    { title: "Today's Sales", value: formatCurrency(data.todaySales), icon: '💊', color: 'success' },
    { title: 'Total Sales', value: data.totalSalesCount ?? 0, icon: '🧾', color: 'primary' },
  ];

  const financeCards = [
    { title: 'Total Income', value: formatCurrency(data.totalIncome), icon: '💰', color: 'success' },
    { title: 'Total Expenses', value: formatCurrency(data.totalExpenses), icon: '📉', color: 'danger' },
    { title: 'Net Profit/Loss', value: formatCurrency(data.netProfitLoss), icon: '📊', color: 'primary' },
  ];

  let cards = [];
  if (hasRole(ROLES.ADMIN, ROLES.GENERAL_MANAGER)) cards = adminCards;
  else if (hasRole(ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER)) cards = farmCards;
  else if (hasRole(ROLES.STORE_KEEPER)) cards = storeCards;
  else if (hasRole(ROLES.VETERINARY_OFFICER)) cards = vetCards;
  else if (hasRole(ROLES.PHARMACY_SALES)) cards = pharmacyCards;
  else if (hasRole(ROLES.FINANCE_OFFICER)) cards = financeCards;

  return (
    <div>
      <h5 className="fw-bold mb-1">Dashboard</h5>
      <p className="text-muted small mb-4">Welcome back, {user?.fullName}</p>
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <Row className="g-3">
          {cards.map((card, i) => (
            <Col key={i} xs={12} sm={6} lg={3}>
              <StatCard {...card} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
