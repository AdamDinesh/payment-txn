import { useEffect } from 'react';

function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return;
        function handleKey(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white rounded-lg w-full max-w-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

}

export default Modal;