import { useEffect, useState } from 'react';
import { getAllPayments } from '../api/paymentsApi';
import PaymentForm from '../components/PaymentForm';
import PaymentTable from '../components/PaymentTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { Error, Loading } from '../components/icon';

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
  function handleClearFilters() {
    setStatusFilter("");
    setFromDate("");
    setToDate("");
  };

  const filtersActive = Boolean(statusFilter || fromDate || toDate);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Payment Transactions</h1>

        </div>

        <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="h-9 border border-gray-300 rounded-md px-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
            >
              <option value="">All statuses</option>
              <option value="INITIATED">Initiated</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromChange}
              className="h-9 border border-gray-300 rounded-md px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">To</label>
            <input
              type="date"
              value={toDate}
              onChange={handleToChange}
              className="h-9 border border-gray-300 rounded-md px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
            />
          </div>

          {(statusFilter || fromDate || toDate) && (
            <button
              onClick={handleClearFilters}
              className="h-9 px-3 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Clear filters
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="leading-none ml-auto flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <span className="text-base leading-none ">+</span>
            Add payment
          </button>
        </div>

        {loading && <Loading />}
        {error && <Error error={error} />}

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