import React from "react";

const HOD = [
  {
    name: "Dr. Revathi Venkataraman",
    role: "Chairperson",
    image: "/team/DrRevathiVenkataraman.png",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-revathi-venkataraman/" },
  },
  {
    name: "Dr. Pushpalatha M",
    role: "Associate Chairperson",
    image: "/team/DrPushpalathaM.png",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-m-pushpalatha/" },
  },
  {
    name: "Dr. Niranjana G",
    role: "Head Of Department",
    image: "/team/DrNiranjanaG.png",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-g-niranjana/" },
  },
];

const advisors = [
  {
    name: "Dr. Baranidharan B",
    role: "Professor",
    image: "/team/DrBaranidharanB.png",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-b-baranidharan/" },
  },
  {
    name: "Dr. Deeban Chakravarthy V",
    role: "Associate Professor",
    image: "/team/DrDeebanChakravarthyV.png",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-v-deeban-chakravarthy/" },
  },
  {
    name: "Dr. Priya S",
    role: "Assistant Professor",
    image: "/team/DrPriyaS.png",
    links: { visit: "https://www.srmist.edu.in/faculty/ms-s-priya/" },
  },
  {
    name: "Dr. Abirami G",
    role: "Assistant Professor",
    image: "/team/DrAbiramiG.png",
    links: { visit: "https://www.srmist.edu.in/faculty/g-abirami-2/" },
  },
];

const mentors = [
  {
    name: "Dr. Hariharan R",
    role: "Assistant Professor",
    image: "/team/DR.Hariharan.jpg",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-hariharan-r/" },
  },
  {
    name: "Dr. Mohideen Abdulkader M",
    role: "Assistant Professor",
    image: "/team/MohideenSir.jpg",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-mohideen-abdulkader-m/" },
  },
  {
    name: "Dr. Ishwarya K",
    role: "Assistant Professor",
    image: "/team/ishwaryamaan.jpg",
    links: { visit: "https://www.srmist.edu.in/faculty/dr-ishwarya-k/" },
  },
  {
    name: "Dr. Umamageswari B",
    role: "Assistant Professor",
    image: "/team/Uma.jpg",
    links: { visit: "https://www.srmist.edu.in/faculty/ms-umamageswari-b/" },
  },
];

const team = [
  {
    name: "Yash Dingar",
    role: "Manager",
    image: "/team/Yash.jpg",
    bio: "Team Lead | Full Stack Web who loves turning ideas into real-world solutions. Let's connect and build awesome things together!",
    links: {
      github: "https://github.com/Q9Kawaii",
      linkedin: "https://www.linkedin.com/in/yash-dingar-946688276/",
      instagram: "https://www.instagram.com/q9kawaii/",
    },
  },
  {
    name: "Anurag Anand",
    role: "Team Member",
    image: "/team/Anurag Anand.jpg",
    bio: "Full Stack Web + ML Developer Love to build solutions with real world impact . Let's connect and build cool stuff together !",
    links: {
      github: "https://github.com/Frostyanand",
      linkedin: "https://www.linkedin.com/in/frostyanand",
      instagram: "https://www.instagram.com/frostyanand?igsh=cjg3YW1na3BkdTc2",
    },
  },
  {
    name: "Mahik Jain",
    role: "Team Member",
    image: "/team/MahikJain.jpg",
    bio: "Keen Programmer",
    links: {
      github: "https://github.com/MJ-1112",
      linkedin: "https://www.linkedin.com/in/mahik-jain-b6a28b324/",
      instagram: "https://www.instagram.com/jain_mahik/",
      visit: "https://my-portfolio-chi-ochre-77.vercel.app/ ",
    },
  },
  {
    name: "Abishek Skanda G",
    role: "Developer",
    image: "/team/skanda.jpg",
    bio: "Programming enthusiast",
    links: {
      github: "https://github.com/ItsSkanda",
      linkedin: "https://www.linkedin.com/in/abishek-skanda-g-751140326/",
      instagram: "https://www.instagram.com/abishekskanda",
    },
  },
];

const Section = ({ title, members }) => {
  const isFaculty = ["HOD", "Advisors", "Mentors"].includes(title);
  const isAdvisors = title === "Advisors";

  return (
    <div className="mb-24 px-4">
      {/* Enhanced Section Header */}
      <div className="text-center mb-16">
        <div className="relative inline-block">
          <h3 className="text-4xl font-extrabold bg-gradient-to-r from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] bg-clip-text text-transparent mb-4">
            {title}
          </h3>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-300 rounded-full"></div>
        </div>
        <p className="text-gray-600 mt-6 text-lg font-light">
          {title === "HOD" && "Leadership & Administrative Excellence"}
          {title === "Advisors" && "Academic Guidance & Strategic Direction"}
          {title === "Mentors" && "Research Support & Faculty Mentorship"}
          {title === "Team" && "Innovation & Technical Development"}
        </p>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdvisors ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-10`}>
        {members.map((member, index) => {
          const cardContent = (
            <div className={`flex flex-col items-center text-center h-full ${isAdvisors ? "p-6" : "p-8"}`}>
              {/* Enhanced Image Section */}
              <div className="relative mb-6 group">
                <div className={`${isAdvisors ? "w-28 h-28" : "w-40 h-40"} rounded-full bg-gradient-to-br from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] p-1.5 shadow-2xl transition-all duration-500 group-hover:scale-105`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover rounded-full bg-white transition-all duration-500 ${member.class || ""}`}
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-80 animate-pulse shadow-lg"></div>
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-[#0c4da2] to-[#3a5b72] rounded-full opacity-70 animate-pulse delay-500 shadow-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-60 animate-ping delay-1000"></div>
              </div>

              {/* Enhanced Text Content */}
              <h3 className={`${isAdvisors ? "text-lg" : "text-xl"} font-bold text-[#0c4da2] mb-3 leading-tight`}>
                {member.name}
              </h3>
              
              <div className="mb-5">
                <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm text-[#3a5b72] font-semibold rounded-full text-sm border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  {member.role}
                </span>
              </div>

              {member.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow font-light max-w-sm">
                  {member.bio}
                </p>
              )}

              {/* Enhanced Action Buttons */}
              <div className="flex gap-4 justify-center mt-auto">
                {isFaculty ? (
                  <span className="px-6 py-3 bg-gradient-to-r from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span>Visit Profile</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </span>
                ) : (
                  <>
                    {member.links.github && (
                      <a
                        href={member.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-br from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:rotate-12 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                          src="githubicon.png"
                          className="h-6 w-6 filter brightness-0 invert group-hover:scale-125 transition-transform duration-300 relative z-10"
                          alt="GitHub"
                        />
                      </a>
                    )}
                    {member.links.instagram && (
                      <a
                        href={member.links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-br from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:rotate-12 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                          src="instagram.png"
                          className="h-6 w-6 filter brightness-0 invert group-hover:scale-125 transition-transform duration-300 relative z-10"
                          alt="Instagram"
                        />
                      </a>
                    )}
                    {member.links.linkedin && (
                      <a
                        href={member.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-br from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:rotate-12 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                          src="linkedin.png"
                          className="h-6 w-6 filter brightness-0 invert group-hover:scale-125 transition-transform duration-300 relative z-10"
                          alt="LinkedIn"
                        />
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          );

          return isFaculty ? (
            <a
              key={index}
              href={member.links.visit}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-100/50 overflow-hidden hover:shadow-3xl hover:-translate-y-3 transition-all duration-700 transform hover:scale-105"
            >
              {/* Enhanced Top Border */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
              
              {cardContent}
              
              {/* Enhanced Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c4da2]/8 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Corner Decorations */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          ) : (
            <div
              key={index}
              className="group relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-100/50 overflow-hidden hover:shadow-3xl hover:-translate-y-3 transition-all duration-700 transform hover:scale-105"
            >
              {/* Enhanced Top Border */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0c4da2] via-[#1e5bb8] to-[#3a5b72] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
              
              {cardContent}
              
              {/* Enhanced Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c4da2]/8 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Corner Decorations */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AboutUs() {
  return (
    <div className="relative min-h-screen overflow-hidden py-20 px-4 sm:px-8 lg:px-20 -mb-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-100/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-blue-200/15 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        <Section title="HOD" members={HOD} />
        <Section title="Advisors" members={advisors} />
        <Section title="Mentors" members={mentors} />
        <Section title="Team" members={team} />
      </div>
    </div>
  );
}
