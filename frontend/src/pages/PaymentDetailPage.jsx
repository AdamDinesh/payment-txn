
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from "sonner";
import { getPaymentById, updatePaymentStatus } from '../api/paymentsApi';
import StatusBadge from '../components/StatusBadge';
import { Error, Loading } from '../components/icon';
import { formatDate } from '../utils/helper';
const ALLOWED_TRANSITIONS = {
  INITIATED: ['PENDING', 'FAILED'],
  PENDING: ['SUCCESS', 'FAILED'],
  SUCCESS: [],
  FAILED: [],
};

function PaymentDetailPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  async function loadPayment() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaymentById(id);
      setPayment(data.payment || data);
    } catch (err) {
      setError('Payment not found');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayment();
  }, [id]);

  async function handleStatusUpdate() {
    if (!newStatus) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await updatePaymentStatus(id, newStatus, note.trim() || undefined);
      toast.success("Status updated");
      setNewStatus('');
      setNote('');
      await loadPayment();
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to update status';
      setUpdateError(message);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;
  if (!payment) return null;

  const availableStatuses = ALLOWED_TRANSITIONS[payment.status] || [];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-3">
      <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">← Back to list</Link>

      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h1 className="text-base font-medium mb-4">Payment details</h1>
        <div className="grid grid-cols-[120px_1fr] gap-y-2.5 gap-x-3 text-sm">
          <span className="text-gray-500">Transaction ID</span>
          <span className="font-mono text-xs text-gray-900 break-all">{payment.id}</span>

          <span className="text-gray-500">Merchant ref</span>
          <span>{payment.merchant_ref}</span>

          <span className="text-gray-500">Customer</span>
          <span>{payment.customer_name} <span className="text-gray-400">({payment.customer_email})</span></span>

          <span className="text-gray-500">Amount</span>
          <span className="font-medium text-base">{payment.currency} {payment.amount}</span>

          <span className="text-gray-500">Status</span>
          <span><StatusBadge status={payment.status} /></span>

          <span className="text-gray-500">Provider ref</span>
          <span className="text-gray-400">{payment.provider_ref || '—'}</span>

          <span className="text-gray-500">Created</span>
          <span>{formatDate(payment.created_at)}</span>

          <span className="text-gray-500">Updated</span>
          <span>{formatDate(payment.updated_at)}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h2 className="text-base font-medium mb-3.5">Update status</h2>
        <div className="flex items-center gap-2 text-sm mb-3.5">
          <span className="text-gray-500">Current status</span>
          <StatusBadge status={payment.status} />
        </div>

        {availableStatuses.length === 0 ? (
          <p className="text-sm text-gray-500">This payment is in a final state, no further updates allowed.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 h-9 border border-gray-300 rounded-md px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              >
                <option value="">Select new status</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updating}
                className="h-9 px-4 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-gray-900"
              >
                {updating ? 'Updating...' : 'Update status'}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              />
            </div>
          </div>
        )}
        {updateError && <p className="text-sm text-red-600 mt-2">{updateError}</p>}
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h2 className="text-base font-medium mb-3.5">Payment history</h2>
        {payment.history && payment.history.length > 0 ? (
          <ul className="text-sm">
            {payment.history.map((entry, i) => (
              <li
                key={entry.id}
                className={`flex gap-2.5 py-2.5 ${i < payment.history.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                <div>
                  <p>{entry.old_status || 'created'} → <span className="font-medium">{entry.new_status}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.created_at)} | {entry.source} | {entry.note || '-'}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No history yet.</p>
        )}
      </div>
    </div>
  );
}

export default PaymentDetailPage;
