import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import type { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface InvoicePrintProps {
  order: Order;
  customerName: string;
  customerEmail?: string;
  onClose: () => void;
}

export function InvoicePrint({ order, customerName, customerEmail, onClose }: InvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice — ${order.orderNumber}</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 13px;
            color: #18181b;
            background: #fff;
            padding: 0;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 12mm 14mm;
          }
          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 14px;
            border-bottom: 2px solid #18181b;
            margin-bottom: 18px;
          }
          .brand-name {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #1d4ed8;
          }
          .brand-tagline { font-size: 11px; color: #71717a; margin-top: 2px; }
          .invoice-label {
            text-align: right;
          }
          .invoice-label h2 {
            font-size: 22px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #18181b;
          }
          .invoice-label p { font-size: 12px; color: #52525b; margin-top: 3px; }
          /* Meta grid */
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            margin-bottom: 22px;
          }
          .meta-box {
            background: #f4f4f5;
            border-radius: 8px;
            padding: 12px 14px;
          }
          .meta-box .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #71717a;
            margin-bottom: 5px;
          }
          .meta-box .value { font-size: 13px; font-weight: 600; color: #18181b; line-height: 1.5; }
          .meta-box .value-sm { font-size: 12px; color: #3f3f46; line-height: 1.6; }
          /* Status badge */
          .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .status-placed    { background: #dbeafe; color: #1d4ed8; }
          .status-processing{ background: #fef9c3; color: #a16207; }
          .status-shipped   { background: #e0f2fe; color: #0369a1; }
          .status-delivered { background: #dcfce7; color: #15803d; }
          .status-cancelled { background: #fee2e2; color: #b91c1c; }
          /* Items table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 22px;
          }
          .items-table th {
            background: #18181b;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 9px 12px;
            text-align: left;
          }
          .items-table th:last-child,
          .items-table td:last-child { text-align: right; }
          .items-table th:nth-child(2),
          .items-table td:nth-child(2) { text-align: center; }
          .items-table th:nth-child(3),
          .items-table td:nth-child(3) { text-align: right; }
          .items-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e4e4e7;
            font-size: 12.5px;
            vertical-align: top;
          }
          .items-table tr:nth-child(even) td { background: #fafafa; }
          .items-table td .item-name { font-weight: 600; color: #18181b; }
          .items-table td .item-sku  { font-size: 10.5px; color: #71717a; margin-top: 2px; }
          /* Totals */
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
          }
          .totals-box {
            width: 260px;
            border: 1.5px solid #e4e4e7;
            border-radius: 8px;
            overflow: hidden;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 14px;
            font-size: 12.5px;
            border-bottom: 1px solid #e4e4e7;
          }
          .totals-row:last-child { border-bottom: none; }
          .totals-row.grand {
            background: #18181b;
            color: #fff;
            font-size: 14px;
            font-weight: 800;
          }
          .totals-row.discount { color: #15803d; }
          /* Footer */
          .footer {
            margin-top: auto;
            padding-top: 16px;
            border-top: 1.5px solid #e4e4e7;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 10.5px;
            color: #71717a;
          }
          .footer .thank-you {
            font-size: 13px;
            font-weight: 700;
            color: #18181b;
            margin-bottom: 3px;
          }
          .footer .legal {
            font-size: 10px;
            color: #a1a1aa;
            max-width: 320px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 8mm 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${content.innerHTML}
        </div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statusClass = `status-${order.status}`;
  const shippingFee = order.itemsTotal >= 999 ? 0 : 49;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="mx-auto max-w-3xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-ink-900 text-white px-5 py-3 rounded-t-xl">
          <span className="font-semibold text-sm">Invoice Preview — {order.orderNumber}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </button>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Invoice paper */}
        <div className="bg-white rounded-b-xl shadow-2xl p-8" ref={printRef}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '2px solid #18181b', marginBottom: '18px' }}>
            <div>
              <div className="brand-name" style={{ fontSize: '26px', fontWeight: 800, color: '#1d4ed8', letterSpacing: '-0.5px' }}>ElectroMart</div>
              <div className="brand-tagline" style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>Your one-stop electronics store</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Invoice</div>
              <div style={{ fontSize: '12px', color: '#52525b', marginTop: '3px' }}>#{order.orderNumber}</div>
              <div style={{ fontSize: '12px', color: '#52525b' }}>{formatDateTime(order.createdAt)}</div>
            </div>
          </div>

          {/* Meta grid: Bill To, Ship To, Order Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '22px' }}>
            {/* Bill To */}
            <div style={{ background: '#f4f4f5', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#71717a', marginBottom: '5px' }}>Bill To</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b', lineHeight: 1.5 }}>{customerName}</div>
              {customerEmail && <div style={{ fontSize: '12px', color: '#3f3f46', lineHeight: 1.6 }}>{customerEmail}</div>}
              <div style={{ fontSize: '12px', color: '#3f3f46', lineHeight: 1.6 }}>📞 {order.address.phone}</div>
            </div>

            {/* Ship To */}
            <div style={{ background: '#f4f4f5', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#71717a', marginBottom: '5px' }}>Ship To</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b', lineHeight: 1.5 }}>{order.address.fullName}</div>
              <div style={{ fontSize: '12px', color: '#3f3f46', lineHeight: 1.5 }}>
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}
              </div>
              <div style={{ fontSize: '12px', color: '#3f3f46' }}>{order.address.city}, {order.address.state}</div>
              <div style={{ fontSize: '12px', color: '#3f3f46' }}>{order.address.pincode}, {order.address.country ?? 'India'}</div>
            </div>

            {/* Order Info */}
            <div style={{ background: '#f4f4f5', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#71717a', marginBottom: '5px' }}>Order Info</div>
              <div style={{ fontSize: '12px', color: '#3f3f46', lineHeight: 1.7 }}>
                <div><b>Order #:</b> {order.orderNumber}</div>
                <div><b>Date:</b> {formatDateTime(order.createdAt)}</div>
                <div><b>Payment:</b> {order.paymentMethod}</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`status-badge ${statusClass}`} style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    background: order.status === 'delivered' ? '#dcfce7' : order.status === 'cancelled' ? '#fee2e2' : '#dbeafe',
                    color: order.status === 'delivered' ? '#15803d' : order.status === 'cancelled' ? '#b91c1c' : '#1d4ed8',
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '22px' }}>
            <thead>
              <tr>
                {['Product', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                  <th key={h} style={{
                    background: '#18181b', color: '#fff',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                    padding: '9px 12px', textAlign: i === 0 ? 'left' : 'right',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.productId} style={{ background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e4e4e7', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: '#18181b', fontSize: '12.5px' }}>{item.name}</div>
                    <div style={{ fontSize: '10.5px', color: '#71717a', marginTop: '2px' }}>SKU: {item.sku}</div>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e4e4e7', textAlign: 'right', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e4e4e7', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e4e4e7', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '260px', border: '1.5px solid #e4e4e7', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12.5px', borderBottom: '1px solid #e4e4e7' }}>
                <span style={{ color: '#52525b' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(order.itemsTotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12.5px', borderBottom: '1px solid #e4e4e7', color: '#15803d' }}>
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span style={{ fontWeight: 600 }}>−{formatCurrency(order.discountTotal)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12.5px', borderBottom: '1px solid #e4e4e7' }}>
                <span style={{ color: '#52525b' }}>Shipping</span>
                <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#15803d' : '#18181b' }}>
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontSize: '14px', fontWeight: 800, background: '#18181b', color: '#fff' }}>
                <span>TOTAL</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ paddingTop: '16px', borderTop: '1.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181b', marginBottom: '3px' }}>Thank you for shopping with ElectroMart!</div>
              <div style={{ fontSize: '10px', color: '#a1a1aa', maxWidth: '320px', lineHeight: 1.5 }}>
                This is a computer-generated invoice and does not require a physical signature.
                For support, contact support@electromart.com
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#71717a' }}>
              <div style={{ fontWeight: 600, color: '#18181b' }}>ElectroMart</div>
              <div>support@electromart.com</div>
            </div>
          </div>

        </div>
        {/* Print tip */}
        <p className="text-center text-xs text-white/60 mt-3 pb-4">
          Click "Print / Save as PDF" → in the print dialog choose "Save as PDF" to download
        </p>
      </div>
    </div>
  );
}
