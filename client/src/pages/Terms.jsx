import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen font-sans text-gray-800 py-16 px-6 sm:px-10 md:px-16"
      style={{
        background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)',
      }}
    >
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-gray-200">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 leading-tight">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Last Updated: July 23, 2025
          </p>
        </header>

        <section className="space-y-10 text-gray-700">
          <p>
            By accessing and using EduSource, you agree to comply with and be bound by the following terms and conditions of use. Please read these terms carefully before using our services.
          </p>
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
              1. User Accounts
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account password.</li>
              <li>Account sharing is strictly prohibited. Each account is for a single, individual user.</li>
              <li>You agree to provide accurate and complete information during registration.</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
              2. Content and Intellectual Property
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All content on EduSource, including courses, videos, text, and graphics, is the intellectual property of EduSource or its content creators.</li>
              <li>Content is for educational purposes only. Unauthorized copying, redistribution, or sale of content is strictly prohibited.</li>
              <li>You are granted a limited, non-exclusive, non-transferable license to access and view the course content for which you have paid or enrolled.</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
              3. Payments and Refunds
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All payments are processed through third-party payment gateways. We do not store your financial information.</li>
              <li>Refund policies are course-specific and will be outlined on the course detail page.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
              4. Prohibited Conduct
            </h2>
            <p>
              You agree not to engage in any of the following activities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violating any laws or regulations.</li>
              <li>Misusing or interfering with the website's functionality.</li>
              <li>Engaging in any form of harassment or abuse towards other users or instructors.</li>
              <li>Uploading malicious software or attempting to breach our security.</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
              5. Disclaimers and Limitation of Liability
            </h2>
            <p>
              EduSource provides its services "as is" and without any warranty. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;