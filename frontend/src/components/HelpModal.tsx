import React from "react";
import { Play, Key, Repeat } from "lucide-react";
import Modal from "./Modal";

interface HelpModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({
  isVisible,
  onClose,
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible={true}>
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">How to Play</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <Play className="text-purple-500 w-6 h-6 mt-1" />
            <p className="text-gray-300 text-base">
              Press <b>Play</b> to listen to a song snippet.
            </p>
          </div>
          <div className="flex items-start space-x-4">
            <Key className="text-purple-500 w-6 h-6 mt-1" />
            <p className="text-gray-300 text-base">
              Type your guess in the input box and press <b>Enter/Return</b>.
            </p>
          </div>
          <div className="flex items-start space-x-4">
            <Repeat className="text-purple-500 w-6 h-6 mt-1" />
            <p className="text-gray-300 text-base">
              Each incorrect guess <b>doubles</b> the snippet length.
            </p>
          </div>
        </div>

        <hr className="border-zinc-700 my-6" />

        <h3 className="text-xl font-bold mb-4 text-white">Color-Coded Hints</h3>
        <div className="space-y-4">
        <div className="flex items-center space-x-4">
            <div className="w-6 h-6 rounded-full bg-mulberry-500"></div>
            <p className="text-gray-300 text-base">
              <b className="text-mulberry-500">Artist Match:</b> Your guess matches the song's artist.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 rounded-full bg-munsell_blue"></div>
            <p className="text-gray-300 text-base">
              <b className="text-munsell_blue">Album Match:</b> Your guess matches the song's album.
            </p>
          </div>        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
