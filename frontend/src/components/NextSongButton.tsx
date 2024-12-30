interface NextSongButtonProps {
    onNextSong: () => void;
    label:string;
  }
  
  export default function NextSongButton({ onNextSong, label }: NextSongButtonProps) {
    return (
      <button
        onClick={onNextSong}
        className="bg-green-400 text-white px-4 py-2 rounded-lg w-full hover:bg-green-600 transition"
        style={{
            marginTop: "1rem",
            maxWidth: "300px",
            width: "100%",
          }}      >
       {label}
      </button>
    );
  }
  