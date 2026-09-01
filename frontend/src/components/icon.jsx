export function Loading() {
    return (<div className="flex flex-col items-center justify-center gap-2.5 bg-white border border-gray-200 rounded-lg py-12 px-6 min-h-[160px]">
        <svg className="w-5 h-5 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Loading payments...</p>
    </div>)
}
export function Error({ error }) {
    return (<div className="flex flex-col items-center justify-center gap-2.5 bg-red-50 border border-red-200 rounded-lg py-12 px-6 min-h-[160px]">
        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm text-red-700 text-center">{error}</p>
    </div>)
}