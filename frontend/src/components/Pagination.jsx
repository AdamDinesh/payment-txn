function Pagination({ page, totalPages, onPageChange }) {
  const currentPage = page || 1;
  const pages = totalPages || 1;

  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span>←</span>
        Previous
      </button>

      <div className="px-3 py-2 rounded-md bg-[#163D48] text-white text-sm font-medium">
        {currentPage}
      </div>

      <span className="text-sm text-gray-500">
        of {pages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= pages}
        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <span>→</span>
      </button>
    </div>
  );
}


export default Pagination;