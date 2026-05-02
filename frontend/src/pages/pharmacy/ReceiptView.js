import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api';
import { Card, Button, Table, Row, Col } from 'react-bootstrap';
import { formatDate, formatCurrency } from '../../utils';

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    pharmacyApi.getReceipt(id).then(r => setSale(r.data.data));
  }, [id]);

  if (!sale) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-3">
            <div className="fs-4">🌿</div>
            <h5 className="fw-bold text-success">Trust Agro</h5>
            <p className="text-muted small mb-0">Pharmacy Receipt</p>
          </div>
          <hr />
          <Row className="mb-2">
            <Col xs={6}><small className="text-muted">Receipt #</small><div className="fw-semibold">{sale.receiptNumber}</div></Col>
            <Col xs={6}><small className="text-muted">Date</small><div className="fw-semibold">{formatDate(sale.saleDate)}</div></Col>
          </Row>
          <Row className="mb-3">
            <Col xs={6}><small className="text-muted">Customer</small><div>{sale.customerName || 'Walk-in'}</div></Col>
            <Col xs={6}><small className="text-muted">Payment</small><div>{sale.paymentMethod}</div></Col>
          </Row>
          <Table size="sm" bordered>
            <thead className="table-light"><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              {sale.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.itemName}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan={3} className="fw-bold text-end">Total</td><td className="fw-bold">{formatCurrency(sale.totalAmount)}</td></tr></tfoot>
          </Table>
          <div className="text-center mt-3 text-muted small">Thank you for your purchase!</div>
          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-secondary" className="w-100" onClick={() => navigate('/pharmacy')}>Back</Button>
            <Button variant="success" className="w-100" onClick={() => window.print()}>Print</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReceiptView;
