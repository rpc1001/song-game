import React from "react";
import Modal from "./Modal";

interface OnboardingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDaily: () => void;
  onSelectGenre: () => void;
  onSelectArtist: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isVisible,
  onClose,
  onSelectDaily,
  onSelectGenre,
  onSelectArtist,
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible={false}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Welcome to Muser!</h2>

        {/* How To Play*/}
        <p className="mb-4 text-gray-300">
          Guess the song by hearing snippets. Each wrong guess doubles the length
          of the snippet. Watch for color-coded hints on{" "}
          <span className="font-bold text-mulberry-500">artist</span> and{" "}
          <span className="font-bold text-munsell_blue">album</span>!
        </p>

        {/* Game Mode Selection */}
        <h3 className="text-xl font-bold mb-4">Choose a Game Mode</h3>
        <div className="grid gap-4">
          <button
            className="bg-purple-500 text-white font-bold  rounded-lg py-2"
            onClick={() => {
              onSelectDaily();
              onClose();
            }}
          >
            Daily Challenge
          </button>

          <button
            className="bg-mulberry-500 text-white  font-bold rounded-lg py-2"
            onClick={() => {
              onSelectArtist();
              onClose();
            }}
          >
            Artist Mode
          </button>
          <button
            className="bg-atomic_tangerine-500 text-white font-bold  rounded-lg py-2"
            onClick={() => {
              onSelectGenre();
              onClose();
            }}
          >
            Genre Mode
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default OnboardingModal;
