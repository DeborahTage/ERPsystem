import React, { useEffect, useState } from 'react';
import { Button, Card, Nav, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import { formatDate, formatCurrency } from '../../utils';

const PharmacyPage = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([pharmacyApi.getSales(), pharmacyApi.getCustomers()])
      .then(([s, c]) => { setSales(s.data.data || []); setCustomers(c.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const salesCols = [
    { key: 'receiptNumber', label: 'Receipt #' },
    { key: 'customerName', label: 'Customer' },
    { key: 'saleDate', label: 'Date', render: r => formatDate(r.saleDate) },
    { key: 'totalAmount', label: 'Total', render: r => formatCurrency(r.totalAmount) },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'soldBy', label: 'Sold By' },
    { key: 'actions', label: '', render: r => <Button size="sm" variant="outline-primary" onClick={() => navigate(`/pharmacy/sales/${r.id}/receipt`)}>Receipt</Button> },
  ];

  const customerCols = [
    { key: 'customerName', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'customerType', label: 'Type' },
  ];

  return (
    <div>
      <h5 className="fw-bold mb-3">Pharmacy</h5>
      <Tab.Container defaultActiveKey="sales">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item><Nav.Link eventKey="sales">Sales</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="customers">Customers</Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="sales">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/pharmacy/sales/new')}>+ New Sale</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={salesCols} data={sales} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="customers">
            <div className="d-flex justify-content-end mb-2">
              <Button size="sm" variant="success" onClick={() => navigate('/pharmacy/customers/new')}>+ Add Customer</Button>
            </div>
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={customerCols} data={customers} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default PharmacyPage;
