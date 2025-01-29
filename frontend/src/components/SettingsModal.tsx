import React from "react";
import Modal from "./Modal";

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSwitchToDailyChallenge: () => void;
  onSwitchToGenre: () => void;
  onSwitchToArtist: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isVisible,
  onClose,
  onSwitchToDailyChallenge,
  onSwitchToGenre,
  onSwitchToArtist
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible={true}>
      <h3 className="text-xl font-bold mb-4 text-white">Select Game Mode</h3>
      <div className="grid grid-cols-1 gap-4">
        <button
          className="bg-purple-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:brightness-90 transition"
          onClick={() => {
            onSwitchToDailyChallenge();
            onClose();
          }}
        >
          Daily Challenge
        </button>
        <button
          className="bg-mulberry-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:brightness-90 transition"
          onClick={() => {
            onSwitchToGenre();
            onClose();
          }}
        >
          Genre Mode
        </button>
        <button
          className="bg-atomic_tangerine-500 text-white font-bold px-4 py-2 rounded-lg w-full hover:brightness-90 transition"
          onClick={() => {
            onSwitchToArtist();
            onClose();
          }}
        >
          Artist Mode
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
