import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { dailyRecordApi, inventoryApi, financeApi, pharmacyApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import { formatDate, formatCurrency } from '../../utils';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('mortality');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      if (activeReport === 'mortality' || activeReport === 'daily') res = await dailyRecordApi.getAll();
      else if (activeReport === 'stock') res = await inventoryApi.getCurrentStock();
      else if (activeReport === 'lowstock') res = await inventoryApi.getLowStock();
      else if (activeReport === 'expiry') res = await inventoryApi.getExpiryAlerts();
      else if (activeReport === 'sales') res = await pharmacyApi.getSales();
      else if (activeReport === 'income') res = await financeApi.getIncome();
      else if (activeReport === 'expenses') res = await financeApi.getExpenses();
      setData(res?.data?.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, [activeReport]);

  const reportTypes = [
    { key: 'daily', label: 'Daily Farm Records' },
    { key: 'mortality', label: 'Mortality Summary' },
    { key: 'stock', label: 'Current Stock' },
    { key: 'lowstock', label: 'Low Stock' },
    { key: 'expiry', label: 'Expiry Report' },
    { key: 'sales', label: 'Pharmacy Sales' },
    { key: 'income', label: 'Income Report' },
    { key: 'expenses', label: 'Expense Report' },
  ];

  const dailyCols = [
    { key: 'date', label: 'Date', render: r => formatDate(r.date) },
    { key: 'farmName', label: 'Farm' }, { key: 'batchCode', label: 'Batch' },
    { key: 'openingBirdCount', label: 'Opening' }, { key: 'mortality', label: 'Mortality' },
    { key: 'mortalityRate', label: 'Rate %', render: r => r.mortalityRate ? `${r.mortalityRate.toFixed(2)}%` : '-' },
    { key: 'feedConsumed', label: 'Feed (kg)' }, { key: 'eggProduction', label: 'Eggs' },
  ];

  const stockCols = [
    { key: 'itemName', label: 'Item' }, { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' }, { key: 'currentStock', label: 'Current Stock' },
    { key: 'minimumStockLevel', label: 'Min Level' },
  ];

  const expiryCols = [
    { key: 'item', label: 'Item', render: r => r.item?.itemName },
    { key: 'batchNumber', label: 'Batch' }, { key: 'quantityRemaining', label: 'Qty' },
    { key: 'expiryDate', label: 'Expiry', render: r => formatDate(r.expiryDate) },
  ];

  const salesCols = [
    { key: 'receiptNumber', label: 'Receipt #' }, { key: 'customerName', label: 'Customer' },
    { key: 'saleDate', label: 'Date', render: r => formatDate(r.saleDate) },
    { key: 'totalAmount', label: 'Amount', render: r => formatCurrency(r.totalAmount) },
    { key: 'paymentMethod', label: 'Payment' },
  ];

  const financeCols = [
    { key: 'transactionDate', label: 'Date', render: r => formatDate(r.transactionDate) },
    { key: 'category', label: 'Category' }, { key: 'amount', label: 'Amount', render: r => formatCurrency(r.amount) },
    { key: 'description', label: 'Description' },
  ];

  const getColumns = () => {
    if (['daily', 'mortality'].includes(activeReport)) return dailyCols;
    if (['stock', 'lowstock'].includes(activeReport)) return stockCols;
    if (activeReport === 'expiry') return expiryCols;
    if (activeReport === 'sales') return salesCols;
    return financeCols;
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Reports</h5>
      <Row className="g-3">
        <Col xs={12} md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-2">
              {reportTypes.map(r => (
                <button key={r.key} className={`btn btn-sm w-100 text-start mb-1 ${activeReport === r.key ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setActiveReport(r.key)}>
                  {r.label}
                </button>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0">{reportTypes.find(r => r.key === activeReport)?.label}</h6>
                <span className="text-muted small">{data.length} records</span>
              </div>
              <DataTable columns={getColumns()} data={data} loading={loading} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
