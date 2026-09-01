import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function PaymentTable({ payments }) {
  const navigate = useNavigate();

  if (!payments || payments.length === 0) {
    return <p className="text-gray-500 text-sm p-4">No payments found.</p>;
  }

  return (
    <table className="w-full text-sm bg-white rounded shadow-sm">
      <thead>
        <tr className="text-left border-b bg-gray-50">
          <th className="p-2">Transaction ID</th>
          <th className="p-2">Merchant Ref</th>
          <th className="p-2">Amount</th>
          <th className="p-2">Status</th>
          <th className="p-2">Provider Ref</th>
          <th className="p-2">Created</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <tr
            key={payment.id}
            onClick={() => navigate(`/payments/${payment.id}`)}
            className="border-b hover:bg-gray-50 cursor-pointer"
          >
            <td className="p-2">{payment.id.slice(0, 8)}...</td>
            <td className="p-2">{payment.merchant_ref}</td>
            <td className="p-2">{payment.currency} {payment.amount}</td>
            <td className="p-2">{payment.status}</td>
            <td className="p-2">{payment.provider_ref || '-'}</td>
            <td className="p-2">{new Date(payment.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PaymentTable;
