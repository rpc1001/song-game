import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";

interface GenreSelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectGenre: (genre: string) => void;
}

export default function GenreSelectModal({
  isVisible,
  onClose,
  onSelectGenre,
}: GenreSelectModalProps) {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      // fetch genres only when modal opens
      const fetchGenres = async () => {
        try {
          const response = await axios.get("http://localhost:3000/genres");
          setGenres(response.data.genres || []);
        } catch (error) {
          console.error("Error fetching genres:", error);
        }
      };
      fetchGenres();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose} dismissible = {false}>
      <h2 className="text-2xl font-bold text-white mb-4">Select a Genre</h2>
      <div className="grid sm:grid-cols-3 gap-3 mt-auto">
        {genres.map((genre) => (
            <button
            key={genre}
            onClick={() => {
                onSelectGenre(genre);
                onClose();
            }}
            className="bg-atomic_tangerine-500 hover:brightness-75 text-white py-2 px-4 rounded h-12 w-full flex items-center justify-center"
            >
            <span className="font-bold text-sm whitespace-normal text-center">{genre}</span>
            </button>
        ))}
        </div>
    </Modal>
  );
}
