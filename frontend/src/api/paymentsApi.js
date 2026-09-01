import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function createPayment(paymentData, idempotencyKey) {
  const res = await axios.post(`${API_BASE}/payments`, paymentData, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return res.data;
}

export async function getAllPayments(filters) {
  const res = await axios.get(`${API_BASE}/payments`, { params: filters });
  return res.data;
}

export async function getPaymentById(id) {
  const res = await axios.get(`${API_BASE}/payments/${id}`);
  return res.data;
}

export async function updatePaymentStatus(id, status) {
  const res = await axios.patch(`${API_BASE}/payments/${id}/status`, { status });
  return res.data;
}
