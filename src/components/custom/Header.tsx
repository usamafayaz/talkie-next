import { motion } from "framer-motion";
import { Trash2, Download } from "lucide-react";

interface HeaderProps {
  onClear: () => void;
  onExport: () => void;
  showActions: boolean;
}

const Header: React.FC<HeaderProps> = ({ onClear, onExport, showActions }) => {
  const headerVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between h-14 bg-transparent px-6 z-[50]">
      <motion.h1
        variants={headerVariant}
        initial={"hidden"}
        animate={"visible"}
        className="text-2xl font-bold tracking-tighter text-white"
      >
        Talkie
      </motion.h1>

      {showActions && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <button
            onClick={onExport}
            className="p-2 rounded-full glass hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Export Chat"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded-full glass hover:bg-white/10 text-white/70 hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
