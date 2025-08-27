import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";

const letterVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.05 } },
};

const containerVariant = {
  show: {
    transition: {
      staggerChildren: 0.17,
    },
  },
};

const name = "Ayush Kumar";

const HeroText = () => {
  return (
    <div className="flex flex-col gap-4 h-full justify-center md:text-left sm:text-center">
      <motion.h2
        variants={fadeIn("down", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="lg:text-2xl sm:text-xl  uppercase text-lightGrey "
      >
        Full Stack Developer
      </motion.h2>
      <motion.h1
        variants={containerVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="md:text-[2.8rem] lg:text-6xl sm:text-4xl text-orange font-bold uppercase"
      >
        {name.split("").map((char, i) => (
          <motion.span key={i} variants={letterVariant}>
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
        <br className="sm:hidden md:block" />
      </motion.h1>
      <motion.p
        variants={fadeIn("up", 0.6)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="text-lg mt-4"
      >
        A Passionate FullStack Developer and Coder <br /> with 1 years of
        experience in creating deployable projects.
      </motion.p>
    </div>
  );
};

export default HeroText;