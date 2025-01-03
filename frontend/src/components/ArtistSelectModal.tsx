import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";

interface ArtistSelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirmArtist: (artistName: string) => void;
}

export default function ArtistSelectModal({
  isVisible,
  onClose,
  onConfirmArtist,
}: ArtistSelectModalProps) {

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isVisible && inputRef.current) {
        inputRef.current.focus();
        }
    }, [isVisible]);

  const [artistName, setArtistName] = useState("");

  const handleConfirm = () => {
    if (!artistName.trim()) {
      alert("Please enter a valid artist name.");
      return;
    }
    onConfirmArtist(artistName);
    onClose();
    setArtistName("");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible = {false}>
      <h2 className="text-2xl font-bold text-white mb-4">Select an Artist</h2>
      <input
        ref={inputRef} 
        type="text"
        placeholder="Type an artist name..."
        className="bg-zinc-700  focus:outline-none text-white px-3 py-2 rounded-lg w-full mb-4"
        value={artistName}
        onChange={(e) => setArtistName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
          }
        }}
      />
      <button
        onClick={handleConfirm}
        className="bg-mulberry-500 text-white px-4 py-2 rounded-lg hover:brightness-500 transition"
      >
            <span className="font-bold text-sm whitespace-normal text-center">Confirm</span>
            </button>
    </Modal>
  );
}
