import React from "react";

const Privacy = () => {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800 py-16 px-6 sm:px-10 md:px-16"
      style={{
        background: "linear-gradient(to bottom right, #e3f2fd, #e0f7fa)",
      }}
      >
        <div className="max-w-5xl mx-auto bg-blue-100 p-8 rounded-xl shadow-lg border border-blue-100">
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your privacy is of utmost importance to us. This document outlines how EduSource collects, uses, and protects your personal information.
            </p>
          </header>
  
          <section className="space-y-10">
            {/* Section 1: Information We Collect */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect information to provide and improve our services, communicate with you, and personalize your learning experience. The types of data we collect include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong className="text-blue-600">Personal Information:</strong>
                  This includes your name, email address, and demographic details you provide during registration or profile updates.
                </li>
                <li>
                  <strong className="text-blue-600">Usage Data:</strong>
                  Information about how you interact with our platform, such as courses viewed, lessons completed, and time spent on the site.
                </li>
                <li>
                  <strong className="text-blue-600">Payment Information:</strong>
                  For paid courses, we collect transaction details through our third-party payment processor (Razorpay). We do not store your credit card or bank account details on our servers.
                </li>
              </ul>
            </div>
  
            {/* Section 2: How We Use Your Information */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                The information we collect is used in the following ways:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To provide and manage our services, including course access and personalized content.</li>
                <li>To process transactions and send you transaction confirmations.</li>
                <li>To communicate with you about your account, course updates, and promotional offers.</li>
                <li>To improve our platform's functionality and user experience.</li>
                <li>To monitor and analyze trends, usage, and activities in connection with our services.</li>
              </ul>
            </div>
  
            {/* Section 3: Data Security */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
                3. Data Security
              </h2>
              <p className="text-gray-700">
                We are committed to protecting your data. We implement a variety of security measures, including encryption and access controls, to maintain the safety of your personal information. Your data is stored on secure, reliable cloud infrastructure (Firebase) with industry-standard protections.
              </p>
            </div>
  
            {/* Section 4: Cookies and Third-Party Services */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
                4. Cookies and Third-Party Services
              </h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience, track usage patterns, and provide you with relevant content. Our third-party services, like payment gateways and analytics providers, have their own privacy policies. We encourage you to review them to understand how your data is handled.
              </p>
            </div>
            
            {/* Section 5: Your Rights */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
                5. Your Rights
              </h2>
              <p className="text-gray-700 mb-4">
                You have the right to access, update, and delete your personal information. You can manage most of your data through your profile settings. For data not accessible via your profile, you can contact us to make a request.
              </p>
            </div>
  
            {/* Section 6: Changes to this Policy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 border-b-2 border-blue-200 pb-2">
                6. Changes to this Policy
              </h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. We encourage you to review this policy periodically for any changes.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  };
  
  export default Privacy;
