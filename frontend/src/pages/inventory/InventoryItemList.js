import React, { useEffect, useState } from 'react';
import { Button, Card, Nav, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils';

const InventoryItemList = () => {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      inventoryApi.getItems(),
      inventoryApi.getLowStock(),
      inventoryApi.getExpiryAlerts(),
    ]).then(([i, l, e]) => {
      setItems(i.data.data || []);
      setLowStock(l.data.data || []);
      setExpiry(e.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const itemColumns = [
    { key: 'itemName', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'minimumStockLevel', label: 'Min Level' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: r => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary" onClick={() => navigate(`/inventory/items/${r.id}/edit`)}>Edit</Button>
          <Button size="sm" variant="outline-success" onClick={() => navigate('/inventory/stock-in', { state: { itemId: r.id } })}>Stock In</Button>
          <Button size="sm" variant="outline-warning" onClick={() => navigate('/inventory/stock-out', { state: { itemId: r.id } })}>Stock Out</Button>
        </div>
      )
    },
  ];

  const expiryColumns = [
    { key: 'item', label: 'Item', render: r => r.item?.itemName },
    { key: 'batchNumber', label: 'Batch' },
    { key: 'quantityRemaining', label: 'Qty Remaining' },
    { key: 'expiryDate', label: 'Expiry Date', render: r => formatDate(r.expiryDate) },
    { key: 'supplier', label: 'Supplier' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Inventory</h5>
        <Button variant="success" size="sm" onClick={() => navigate('/inventory/items/new')}>+ Add Item</Button>
      </div>
      <Tab.Container defaultActiveKey="all">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item><Nav.Link eventKey="all">All Items</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="low">Low Stock <span className="badge bg-warning text-dark">{lowStock.length}</span></Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="expiry">Expiring <span className="badge bg-danger">{expiry.length}</span></Nav.Link></Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="all">
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={itemColumns} data={items} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="low">
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={itemColumns} data={lowStock} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
          <Tab.Pane eventKey="expiry">
            <Card className="border-0 shadow-sm"><Card.Body><DataTable columns={expiryColumns} data={expiry} loading={loading} /></Card.Body></Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default InventoryItemList;
