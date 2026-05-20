import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate, formatCurrency } from '../../utils';

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    pharmacyApi.getReceipt(id).then(r => setSale(r.data.data));
  }, [id]);

  if (!sale) {
    return <div className="text-center py-12 text-sm text-gray-500">Loading receipt...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Card>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl">🌿</div>
            <h2 className="text-2xl font-semibold text-gray-900">Trust Agro</h2>
            <p className="text-sm text-gray-500">Pharmacy Receipt</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Receipt #</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{sale.receiptNumber}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Date</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(sale.saleDate)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Customer</p>
              <p className="mt-2 text-sm text-gray-900">{sale.customerName || 'Walk-in'}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Payment</p>
              <p className="mt-2 text-sm text-gray-900">{sale.paymentMethod}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200">
            <table className="min-w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sale.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">{item.itemName}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(sale.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center text-sm text-gray-500">Thank you for your purchase!</div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/pharmacy')}>Back</Button>
            <Button variant="primary" className="w-full" onClick={() => window.print()}>Print</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptView;
