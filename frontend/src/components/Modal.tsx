import React from "react";

interface ModalProps {
  isVisible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
}

export default function Modal({ isVisible, onClose, children, dismissible = true}: ModalProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={() => {
        if (dismissible && onClose) onClose();
      }}
    >
      <div
        className="bg-zinc-800 overflow-auto p-6 rounded-lg shadow-lg w-80 text-center relative animate-slideInUp"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        style={{
          top: '3.8rem', // align modals with the bottom of the header
          position: 'absolute',
        }}
      >
        {/* Close Button */}
        {dismissible && onClose && (
          <button
            className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
            onClick={onClose}
          >
            ✖
          </button>
        )}
        {/* Modal Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
    </div>
  );
}
