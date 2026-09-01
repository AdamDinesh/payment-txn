import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import PaymentsListPage from './pages/PaymentsListPage';
import PaymentDetailPage from './pages/PaymentDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<PaymentsListPage />} />
        <Route path="/payments/:id" element={<PaymentDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
