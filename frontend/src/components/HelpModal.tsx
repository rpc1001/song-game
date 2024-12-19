import React from "react";

interface HelpModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose} // closes modal when clicking outside
    >
      <div
        className="bg-zinc-800 p-6 rounded-lg shadow-lg w-80 text-center relative"
        onClick={(e) => e.stopPropagation()} // avoid closing when clicking insid
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Help Content */}
        <h2 className="text-2xl font-bold mb-4 text-violet-400">How to Play</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          - Press <b>Play</b> to listen to a snippet of a song. <br />
          - Type your guess in the input box and press <b>Enter</b>. <br />
          - Each incorrect guess <b>doubles</b> the snippet length. <br />
          - You have <b>5 chances</b> to guess the song correctly.
        </p>
      </div>
    </div>
  );
};

export default HelpModal;
