import React from "react";

const team = [
  {
    name: "Yash Dingar",
    role: "Manager",
    image: "/team/yash DP.png",
    bio: "Leads and manages the project vision, communication and coordination. FullStack Developer",
    class: "",
    links: {
      github: "https://github.com/Q9Kawaii",
      linkedin: "#",
      instagram: "https://www.instagram.com/q9kawaii/",
    },
  },
  {
    name: "Anurag Anand",
    role: "Team Member",
    image: "/team/Anurag Anand.jpg",
    bio: "Code so clean you could eat off it. Don’t, though. Just trying to make cool stuff that helps.Stick around — I’m just getting started",
    links: {
      github: "https://github.com/Frostyanand",
      linkedin: "www.linkedin.com/in/frostyanand",
      instagram: "https://www.instagram.com/frostyanand?igsh=cjg3YW1na3BkdTc2",
    },
  },
  {
    name: "###########",
    role: "Team Member",
    image: "/team/frosty.jpg",
    bio: "##################",
    links: {
      github: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    name: "###########",
    role: "Team Member",
    image: "/team/technos.jpg",
    bio: "##################",
    links: {
      github: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
];

export default function AboutUs() {
  return (
    <div className="relative min-h-screen overflow-hidden py-16 px-4 sm:px-8 lg:px-20 -mb-50">
  {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
    <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
  </div>

  {/* Floating Geometric Shapes */}
  <div className="absolute top-20 left-20 w-4 h-4 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
  <div className="absolute top-40 right-32 w-6 h-6 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>
  <div className="absolute bottom-40 left-32 w-5 h-5 bg-blue-400 transform rotate-45 animate-bounce delay-1000"></div>

  <div className="relative z-10">
    {/* Header Section */}
    <div className="text-center mb-16">
      <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 border border-blue-100 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
        </div>
        
        <h2 className="text-4xl font-bold text-[#0c4da2] mb-2 relative">
          About Us
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
        </h2>
        
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Meet the dedicated team behind SRM Samadhan - passionate developers committed to transforming student management systems
        </p>
      </div>
    </div>

    {/* Team Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {team.map((member, index) => (
        <div
          key={index}
          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500"
        >
          {/* Card gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
          
          <div className="p-8 flex flex-col items-center text-center">
            {/* Profile Image */}
            <div className="relative mb-6">
              <div className="w-36 h-36 rounded-full bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] p-1 shadow-2xl">
                <img
                  src={member.image}
                  alt={member.name}
                  className={`w-full h-full object-cover rounded-full bg-white ${member.class || ""}`}
                />
              </div>
              {/* Floating decoration around image */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3a5b72] rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#0c4da2] rounded-full opacity-60 animate-pulse delay-300"></div>
            </div>

            {/* Member Info */}
            <h3 className="text-xl font-bold text-[#0c4da2] mb-2">{member.name}</h3>
            
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-blue-50/80 backdrop-blur-sm text-[#3a5b72] font-medium rounded-full text-sm border border-blue-200">
                {member.role}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
              {member.bio}
            </p>

            {/* Social Links */}
            <div className="flex gap-4 justify-center">
              {member.links?.github && (
                <a 
                  href={member.links.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <img src="githubicon.png" className="h-5 w-5 filter brightness-0 invert group-hover:scale-110 transition-transform" alt="GitHub" />
                </a>
              )}
              
              {member.links?.instagram && (
                <a 
                  href={member.links.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <img src="instagram.png" className="h-5 w-5 filter brightness-0 invert group-hover:scale-110 transition-transform" alt="Instagram" />
                </a>
              )}
              
              {member.links?.linkedin && (
                <a 
                  href={member.links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <img src="linkedin.png" className="h-5 w-5 filter brightness-0 invert group-hover:scale-110 transition-transform" alt="LinkedIn" />
                </a>
              )}
            </div>
          </div>

          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c4da2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      ))}
    </div>

    {/* Footer Section */}
    <div className="text-center mt-16">
      <div className="inline-block p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
        <p className="text-sm text-[#0c4da2] font-medium italic">
          Building the future of student management systems
        </p>
        <p className="text-xs text-gray-600 mt-2">
          SRM Institute of Science and Technology – Innovation Through Technology
        </p>
      </div>
    </div>
  </div>
</div>

  );
}
