import { Link } from "react-scroll";

const AboutMeText = () => {
  return (
    <div className="flex flex-col md:items-start sm:items-center md:text-left sm:text-center">
      <h2 className="text-6xl text-cyan mb-10">About Me</h2>
      <p>
Hello, I'm Ayush Kumar, a dedicated Web Developer and a Computer Science student at Galgotias University.

My technical skill set includes Java, HTML, CSS, JavaScript, React.js, ReactNative, NativeWind, Clerk, Convex, Next.js, Node.js, Express.js, MongoDB, Tailwind CSS, Material UI, and GitHub. I specialize in developing modern, responsive, and scalable web applications with a strong focus on user experience and performance.

I am passionate about solving real-world problems through code and continually expanding my knowledge in full-stack development. My commitment to innovation and teamwork was recently recognized when I secured 2nd prize in the Rinex Hackathon, where I successfully contributed to a high-impact project under competitive conditions.

I am currently seeking opportunities where I can apply my skills, learn from industry professionals, and contribute meaningfully to forward-thinking projects. I'm enthusiastic about building solutions that make a difference.
      </p>
      <button className="border border-orange rounded-full py-2 px-4 text-lg flex gap-2 items-center mt-10 hover:bg-orange transition-all duration-500 cursor-pointer md:self-start sm:self-center">
        <Link
          spy={true}
          smooth={true}
          duration={500}
          offset={-120}
          to="projects"
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          My Projects
        </Link>
      </button>
    </div>
  );
};

export default AboutMeText;
