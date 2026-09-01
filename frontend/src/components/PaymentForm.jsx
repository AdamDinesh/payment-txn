import { useState } from 'react';
import { createPayment } from '../api/paymentsApi';

const initialForm = {
  merchantRef: '',
  customerName: '',
  customerEmail: '',
  amount: '',
  currency: 'INR',
};



function PaymentForm({ onCreated, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);


  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    form.customerEmail.trim()
  );

  const isFormValid =
    form.merchantRef.trim() &&
    form.customerName.trim() &&
    emailIsValid &&
    form.amount &&
    Number(form.amount) > 0 &&
    form.currency.trim();


  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.merchantRef.trim()) newErrors.merchantRef = 'Merchant reference is required';
    if (!form.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!emailIsValid) newErrors.customerEmail = 'Enter a valid email';
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      const data = await createPayment(
        { ...form, amount: Number(form.amount) },
        idempotencyKey
      );
      setForm(initialForm);
      onCreated(data.payment);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Something went wrong, try again';
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {serverError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{serverError}</div>
      )}

      <div>
        <label className="block text-sm mb-1">Merchant reference</label>
        <input
          name="merchantRef"
          value={form.merchantRef}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
        {errors.merchantRef && <p className="text-xs text-red-600 mt-1">{errors.merchantRef}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Customer name</label>
        <input
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
        {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Customer email</label>
        <input
          name="customerEmail"
          value={form.customerEmail}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
        {errors.customerEmail && <p className="text-xs text-red-600 mt-1">{errors.customerEmail}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm mb-1">Amount</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
          {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
        </div>
        <div className="w-24">
          <label className="block text-sm mb-1">Currency</label>
          <input
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 rounded border text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || !isFormValid}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create payment'}
        </button>
      </div>

    </form>
  );

}

export default PaymentForm;