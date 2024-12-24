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
      <h2 className="text-2xl font-bold text-violet-400 mb-4">Select a Genre</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => {
              onSelectGenre(genre);
              onClose();
            }}
            className="bg-violet-500 hover:bg-violet-600 text-white py-2 px-2 rounded"
          >
            {genre}
          </button>
        ))}
      </div>
    </Modal>
  );
}
