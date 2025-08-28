import ProjectsText from "./ProjectsText";
import SingleProject from "./SingleProject";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";

const projects = [
  {
    name: "PassManageR",
    year: "June 2024",
    align: "right",
    image: "../../images/project1.png",
    link: "https://projects-pearl-sigma.vercel.app/",
  },
  {
    name: "Chatify",
    year: "December 2024",
    align: "left",
    image: "../../images/project2.png",
    link: "https://chatify-poty.onrender.com",
  },
  {
    name: "Mentra",
    year: "June 2025",
    align: "right",
    image: "../../images/project3.png",
    link: "https://mentraapp.vercel.app/",
  },
];

const ProjectsMain = () => {
  return (
    <div id="projects" className="max-w-[1200px] mx-auto px-4">
      <motion.div
        variants={fadeIn("top", 0)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.7 }}
      >
        <ProjectsText />
      </motion.div>
      <div className="flex flex-col gap-20 max-w-[900px] mx-auto mt-12">
        {projects.map((project, index) => {
          return (
            <SingleProject
              key={index}
              name={project.name}
              year={project.year}
              align={project.align}
              image={project.image}
              link={project.link}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsMain;
