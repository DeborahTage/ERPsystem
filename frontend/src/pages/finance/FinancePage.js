import React, { useEffect, useState } from 'react';
import { Button, Card, Nav, Tab, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { financeApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import { formatDate, formatCurrency } from '../../utils';

const FinancePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([financeApi.getAll(), financeApi.getProfitLoss({})])
      .then(([t, pl]) => { setTransactions(t.data.data || []); setProfitLoss(pl.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const cols = [
    { key: 'transactionDate', label: 'Date', render: r => formatDate(r.transactionDate) },
    { key: 'transactionType', label: 'Type', render: r => <span className={`badge bg-${r.transactionType === 'INCOME' ? 'success' : 'danger'}`}>{r.transactionType}</span> },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', render: r => formatCurrency(r.amount) },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'description', label: 'Description' },
    { key: 'recordedBy', label: 'Recorded By' },
  ];

  const income = transactions.filter(t => t.transactionType === 'INCOME');
  const expenses = transactions.filter(t => t.transactionType === 'EXPENSE');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Finance</h5>
        <Button variant="success" size="sm" onClick={() => navigate('/finance/new')}>+ Record Transaction</Button>
      </div>
      {profitLoss && (
        <Row className="g-3 mb-4">
          <Col xs={12} sm={4}><StatCard title="Total Income" value={formatCurrency(profitLoss.totalIncome)} icon="💰" color="success" /></Col>
          <Col xs={12} sm={4}><StatCard title="Total Expenses" value={formatCurrency(profitLoss.totalExpenses)} icon="📉" color="danger" /></Col>
          <Col xs={12} sm={4}><StatCard title="Net Profit/Loss" value={formatCurrency(profitLoss.netProfitLoss)} icon="📊" color={profitLoss.netProfitLoss >= 0 ? 'success' : 'danger'} /></Col>
        </Row>
      )}
      <Tab.Container defaultActiveKey="all">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item><Nav.Link eventKey="all">All ({transactions.length})</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="income">Income ({income.length})</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="expenses">Expenses ({expenses.length})</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="all"><Card className="border-0 shadow-sm"><Card.Body><DataTable columns={cols} data={transactions} loading={loading} /></Card.Body></Card></Tab.Pane>
          <Tab.Pane eventKey="income"><Card className="border-0 shadow-sm"><Card.Body><DataTable columns={cols} data={income} loading={loading} /></Card.Body></Card></Tab.Pane>
          <Tab.Pane eventKey="expenses"><Card className="border-0 shadow-sm"><Card.Body><DataTable columns={cols} data={expenses} loading={loading} /></Card.Body></Card></Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default FinancePage;
