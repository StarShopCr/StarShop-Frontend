'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-400">
        Showing <span className="font-bold text-white">{itemsPerPage}</span> of <span className="font-bold text-white">24</span> tickets
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/10 rounded-md"
        >
          Previous
        </button>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm text-white hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/10 rounded-md font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
} 