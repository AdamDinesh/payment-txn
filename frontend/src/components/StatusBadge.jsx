const statusColors = {
  INITIATED: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-amber-100 text-amber-800',
  SUCCESS: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
};


function StatusBadge({ status }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>

  );
}

export default StatusBadge;