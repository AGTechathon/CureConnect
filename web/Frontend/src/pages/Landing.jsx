import React, { useState } from "react";
import HealthcareCards from "../components/HealthCareCard";
import ServicesCard from "../components/ServicesCard";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="bg-white text-gray-900 w-full">
      {/* Hero Section */}
      <div className="px-4 md:px-10 lg:mt-16 lg:-translate-y-11">
        <header className="flex flex-col md:flex-row items-center justify-between py-6 md:p-10">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
              Get Better Care For{" "}
              <span className="text-blue-800">Your Health</span>
            </h2>
            <p className="text-gray-600 mt-3 md:mt-4 text-lg md:text-xl">
              Connecting Rural lives with quality Care{" "}
            </p>
            <a href="/health">
            <button className="mt-4 md:mt-6 bg-blue-950 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg" style={{backgroundColor:"oklch(0.424 0.199 265.638)"}}>Learn More</button>
            </a>
          </div>
          <div className="w-full md:w-1/2 mt-6 md:mt-0">
            <img src=".\src\assets\doctors.png" alt="Doctors" className="w-full" />
          </div>
        </header>
      </div>

      {/* Services Section */}
      <div className="flex flex-col md:flex-row gap-12 md:justify-center md:px-10 mb-16">
        {/* Watch Insights Card (Appointment Card UI) */}
        <div className="bg-blue-100 p-4 md:p-9 rounded-md shadow-sm w-full md:max-w-md">
          <h2 className="text-gray-700 font-medium text-base md:text-lg">Watch Insights</h2>
          <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">Get your live health data from your smartwatch</p>
          <button 
            onClick={() => navigate('/account')}
            className="bg-blue-800 text-white font-medium py-2 md:py-3 px-3 md:px-4 rounded-md w-full text-sm md:text-base"
            style={{backgroundColor:"oklch(0.424 0.199 265.638)"}}
          >
            VIEW WATCH INSIGHTS
          </button>
        </div>

        {/* Emergency Consulting */}
        <div className="bg-blue-100 p-4 md:p-9 rounded-md shadow-sm w-full md:max-w-md">
          <div 
            onClick={() => setShowEmergencyOptions(!showEmergencyOptions)}
            className="cursor-pointer"
          >
            <h2 className="text-gray-700 font-medium text-base md:text-lg">Emergency Consulting</h2>
            <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">Get immediate medical assistance</p>
            <button 
              className="bg-blue-800 text-white font-medium py-2 md:py-3 px-3 md:px-4 rounded-md w-full text-sm md:text-base flex items-center justify-between"
              style={{backgroundColor:"oklch(0.424 0.199 265.638)"}}
            >
              <span>Select Consultation Type</span>
              <svg 
                className={`w-5 h-5 transform transition-transform duration-300 ${showEmergencyOptions ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Emergency Options */}
          {showEmergencyOptions && (
            <div className="mt-4 space-y-4">
              <div 
                onClick={() => navigate('/telemedicine')}
                className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-gray-800 font-medium mb-2">Video Consultation</h3>
                <p className="text-gray-600 text-sm">Connect with doctors through secure video calls</p>
              </div>
              <div 
                onClick={() => navigate('/chat')}
                className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-gray-800 font-medium mb-2">Chat Consultation</h3>
                <p className="text-gray-600 text-sm">Get medical advice through text chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Healthcare Cards */}
      <div className="px-4 md:px-10 lg:m-6 xl:m-32">
        <HealthcareCards />
      </div>

      {/* Services Section */}
      <ServicesCard />
    </div>
  );
};

export default Landing;
