import { useEffect, useState } from 'react';
import { getAllPayments } from '../api/paymentsApi';
import PaymentForm from '../components/PaymentForm';
import PaymentTable from '../components/PaymentTable';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

function PaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payment Transactions</h1>


      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <PaymentTable payments={payments} />
        </>
      )}
    </div>
  );
}

export default PaymentsListPage;
