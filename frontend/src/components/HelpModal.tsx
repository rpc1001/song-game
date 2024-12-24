import React from "react";
import Modal from "./Modal";

interface HelpModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isVisible, onClose }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible={true}>
      {/* Help Content */}
      <h2 className="text-2xl font-bold mb-4 text-violet-400">How to Play</h2>
      <p className="text-gray-300 text-sm leading-relaxed">
        - Press <b>Play</b> to listen to a snippet of a song. <br />
        - Type your guess in the input box and press <b>Enter</b>. <br />
        - Each incorrect guess <b>doubles</b> the snippet length. <br />
        - You have <b>5 chances</b> to guess the song correctly.
      </p>
    </Modal>
  );
};

export default HelpModal;
