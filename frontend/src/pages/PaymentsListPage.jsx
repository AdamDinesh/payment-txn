import { useEffect, useState } from 'react';
import { getAllPayments } from '../api/paymentsApi';
import PaymentForm from '../components/PaymentForm';
import PaymentTable from '../components/PaymentTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

const PAGE_SIZE = 10;

function PaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  async function loadPayments() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPayments({
        status: statusFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setPayments(data.payments);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, fromDate, toDate]);

  function handleStatusChange(e) {
    setPage(1);
    setStatusFilter(e.target.value);
  }

  function handleFromChange(e) {
    setPage(1);
    setFromDate(e.target.value);
  }

  function handleToChange(e) {
    setPage(1);
    setToDate(e.target.value);
  }

  function handlePaymentCreated() {
    setShowAddModal(false);
    if (page === 1) {
      loadPayments();
    } else {
      setPage(1);
    }
  }

  const filtersActive = Boolean(statusFilter || fromDate || toDate);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Payment Transactions</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 text-lg leading-none"
            title="Add payment"
          >
            +
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Status</label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="border rounded px-2 py-1"
            >
              <option value="">All statuses</option>
              <option value="INITIATED">Initiated</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromChange}
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">To</label>
            <input
              type="date"
              value={toDate}
              onChange={handleToChange}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading payments...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <PaymentTable
              payments={payments}
              filtersActive={filtersActive}
              onAddPayment={() => setShowAddModal(true)}
            />
            {payments.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Create payment">
        <PaymentForm onCreated={handlePaymentCreated} onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );

}

export default PaymentsListPage;