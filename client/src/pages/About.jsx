import React from "react";
import { FaLaptopCode, FaBullseye, FaLightbulb, FaEnvelope, FaLinkedin } from "react-icons/fa";

const teamMembers = [
  {
    name: "Arvind Kumar",
    role: "Founder",
    bio: "Arvind leads the strategic vision and growth of EduSource. With a background in Full Stack Developer, he is passionate about building a platform that empowers learners worldwide.",
    image: "https://res.cloudinary.com/dh8gcylzx/image/upload/v1753377789/Untitled_design_9_exnbbt.png",
    email: "arvindkumar18320@gmail.com",
    linkedin: "https://www.linkedin.com/in/arvind-kumar-9b898b247/",
  },
  {
    name: "Vikas Sharma",
    role: "CEO",
    bio: "Vikas is an expert in User Interface and E-learning technologies. He oversees the development team and ensures our platform remains cutting-edge and reliable.",
    image: "https://res.cloudinary.com/dh8gcylzx/image/upload/v1753374282/DP_jentmm.png",
    email: "vikas472004@gmail.com",
    linkedin: "http://www.linkedin.com/in/vikasharma4",
  },
];

const About = () => {
  return (
    <div
      className="min-h-screen font-sans text-gray-800 py-16 px-6 sm:px-10 md:px-16"
      style={{
        background: "linear-gradient(to bottom right, #e3f2fd, #e0f7fa)",
      }}
    >
      <div className="max-w-6xl mx-auto p-8 sm:p-12 rounded-xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 leading-tight">
            About EduSource
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A modern e-learning platform where innovation meets education.
          </p>
        </header>

        <section className="space-y-12">
          {/* Our Story Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-blue-100 p-8 rounded-xl shadow-lg border border-blue-100">
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                <FaLaptopCode className="text-blue-500" />
                Our Story
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                Founded with a passion for accessible education, EduSource was created to bridge the gap between aspiring learners and industry-leading experts. We believe that knowledge should be a boundless resource, and our platform is built to deliver high-quality, practical courses to anyone, anywhere.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://res.cloudinary.com/dh8gcylzx/image/upload/v1753373439/A_modern_e-learning_website_scene_showing_diverse_students_learning_online_using_laptops_and_tablets_in_a_bright_clean_minimal_classroom_or_home_environment._The_setting_is_professional_and_frien_qqof7t.jpg"
                alt="About Us"
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Our Mission Section */}
          <div className="bg-blue-100 p-8 rounded-xl shadow-lg border border-blue-100">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
              <FaBullseye className="text-blue-500" />
              Our Mission
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              To empower learners globally by providing a dynamic and comprehensive library of courses crafted by top professionals. We are dedicated to fostering a community of lifelong learners and giving them the tools to master skills for the future.
            </p>
          </div>

          {/* Our Vision Section */}
          <div className="bg-blue-100 p-8 rounded-xl shadow-lg border border-blue-100">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
              <FaLightbulb className="text-blue-500" />
              Our Vision
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              To become the world's leading platform for online learning, recognized for our commitment to quality content, innovative teaching methods, and a supportive educational community. We envision a world where anyone can achieve their professional and personal goals through accessible and engaging education.
            </p>
          </div>

          {/* Our Team Section */}
          <div className="pt-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 text-center mb-10">
              Meet Our Team
            </h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                      />
                      <h3 className="mt-4 text-xl font-bold text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-blue-700 font-semibold">{member.role}</p>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                        {member.bio}
                      </p>

                      <div className="flex gap-4 mt-4 justify-center">
                        <a
                          href={`mailto:${member.email}`}
                          className="text-gray-600 hover:text-blue-800 transition-colors"
                          aria-label={`Email ${member.name}`}
                        >
                          <FaEnvelope className="text-2xl" />
                        </a>
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-800 transition-colors"
                          aria-label={`LinkedIn for ${member.name}`}
                        >
                          <FaLinkedin className="text-2xl" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
