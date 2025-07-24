import React from "react";
import { FaLaptopCode, FaBullseye, FaLightbulb } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen font-sans text-gray-800 py-16 px-6 sm:px-10 md:px-16"
      style={{
        background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)',
      }}
    >
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-gray-200">
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
          <div className="flex flex-col md:flex-row items-center gap-8">
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
                src="https://source.unsplash.com/featured/?education,technology"
                alt="About Us"
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Our Mission Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
              <FaBullseye className="text-blue-500" />
              Our Mission
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              To empower learners globally by providing a dynamic and comprehensive library of courses crafted by top professionals. We are dedicated to fostering a community of lifelong learners and giving them the tools to master skills for the future.
            </p>
          </div>

          {/* Our Vision Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
              <FaLightbulb className="text-blue-500" />
              Our Vision
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              To become the world's leading platform for online learning, recognized for our commitment to quality content, innovative teaching methods, and a supportive educational community. We envision a world where anyone can achieve their professional and personal goals through accessible and engaging education.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;