import { Settings, Share, BarChart, HelpCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-zinc-800">
      <div className="max-w-md mx-auto flex items-center justify-between  px-1 py-2">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            className="text-gray-300 p-2 rounded-lg hover:text-white focus:outline-none"
            onClick={() => {}}
          >
            <Settings size={24} strokeWidth={2} />
          </button>
          <button
            className="text-gray-300 p-2 rounded-lg hover:text-white focus:outline-none"
            onClick={() => {}}
          >
            <Share size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Center Title */}
        <h1 className="text-purple-500 text-3xl font-bold">Muser</h1>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button
            className="text-gray-300 p-2 rounded-lg hover:text-white focus:outline-none"
            onClick={() => {}}
          >
            <BarChart size={24} strokeWidth={2} />
          </button>
          <button
            className="text-gray-300 p-2 rounded-lg hover:text-white focus:outline-none"
            onClick={() => {}}
          >
            <HelpCircle size={24} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-b border-gray-700 max-w-md mx-auto"></div>
    </header>
  );
}
