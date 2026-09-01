import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helper';
function PaymentTable({ payments, filtersActive, onAddPayment }) {
  const navigate = useNavigate();

  if (!payments || payments.length === 0) {
    if (filtersActive) {
      return (
        <div className="text-center py-16 border rounded">
          <p className="font-medium">No payments match your filters</p>
          <p className="text-sm text-gray-500 mt-1">Try a different status or date range.</p>
        </div>
      );
    }
    return (
      <div className="text-center py-16 border rounded">
        <p className="font-medium">No payments yet</p>
        <p className="text-sm text-gray-500 mt-1">Every transaction you create will show up here.</p>

      </div>
    );
  }

  return (
    <div className="min-h-[28rem] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left bg-[#163D48] text-white">
            <th className="p-3 font-semibold border border-gray-300">Transaction ID</th>
            <th className="p-3 font-semibold border border-gray-300">Merchant ref</th>
            <th className="p-3 font-semibold border border-gray-300">Amount</th>
            <th className="p-3 font-semibold border border-gray-300">Status</th>
            <th className="p-3 font-semibold border border-gray-300">Provider ref</th>
            <th className="p-3 font-semibold border border-gray-300">Created</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment, index) => (
            <tr
              key={payment.id}
              onClick={() => navigate(`/payments/${payment.id}`)}
              className={`cursor-pointer border border-gray-300 text-gray-800 ${index % 2 === 0
                ? "bg-white hover:bg-gray-50"
                : "bg-[#f9f9f9] hover:bg-[#DDEFF1]"
                }`}
            >
              <td className="p-3 border border-gray-300 font-mono text-gray-700">
                {payment.id.slice(0, 8)}...
              </td>

              <td className="p-3 border border-gray-300">
                {payment.merchant_ref}
              </td>

              <td className="p-3 border border-gray-300 font-mono">
                {payment.currency} {payment.amount}
              </td>

              <td className="p-3 border border-gray-300">
                <StatusBadge status={payment.status} />
              </td>

              <td className="p-3 border border-gray-300 text-gray-500">
                {payment.provider_ref || "-"}
              </td>

              <td className="p-3 border border-gray-300 text-gray-500">
                {formatDate(payment.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default PaymentTable;