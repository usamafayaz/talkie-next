import { motion } from "framer-motion";

const Header = () => {
  const headerVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <header className="fixed top-0 left-0 right-0 flex items-center h-12 bg-transparent px-4">
      <motion.h1
        variants={headerVariant}
        initial={"hidden"}
        animate={"visible"}
        className="text-xl font-semibold text-white"
      >
        Talkie
      </motion.h1>
    </header>
  );
};

export default Header;
