import React from "react";

const advisors = [
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
    role: "Associate Professor",
    image: "/team/DrPriyaS.png",
    links: { visit: "https://www.srmist.edu.in/faculty/ms-s-priya/" },
  },
  {
    name: "Dr. Abirami G",
    role: "Associate Professor",
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
    bio: "Team Lead | Full Stack Web who loves turning ideas into real-world solutions. Let’s connect and build awesome things together!",
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
    bio: "Full Stack Web + ML Developer Love to build solutions with real world impact . Let's connect and build cool stuff together !",
    links: {
      github: "https://github.com/Frostyanand",
      linkedin: "https://www.linkedin.com/in/frostyanand",
      instagram: "https://www.instagram.com/frostyanand?igsh=cjg3YW1na3BkdTc2",
    },
  },
  {
    name: "###########",
    role: "Team Member",
    image: "/team/fake.png",
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
    image: "/team/fake.png",
    bio: "##################",
    links: {
      github: "#",
      linkedin: "#",
      instagram: "#",
    },
  },
];

const Section = ({ title, members }) => {
  const isFaculty = title === "Advisors" || title === "Mentors";
  const isAdvisors = title === "Advisors";

  return (
    <div className="mb-20">
      <h3 className="text-2xl font-bold text-[#0c4da2] text-center mb-10 underline decoration-blue-300 underline-offset-4">
        {title}
      </h3>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdvisors ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-8`}>
        {members.map((member, index) => {
          const cardContent = (
            <div className={`flex flex-col items-center text-center ${isAdvisors ? "p-4" : "p-8"}`}>
              <div className="relative mb-4">
                <div className={`${isAdvisors ? "w-24 h-24" : "w-36 h-36"} rounded-full bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] p-1 shadow-2xl`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover rounded-full bg-white ${member.class || ""}`}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3a5b72] rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#0c4da2] rounded-full opacity-60 animate-pulse delay-300"></div>
              </div>
              <h3 className={`${isAdvisors ? "text-lg" : "text-xl"} font-bold text-[#0c4da2] mb-2`}>{member.name}</h3>
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-blue-50/80 backdrop-blur-sm text-[#3a5b72] font-medium rounded-full text-sm border border-blue-200">
                  {member.role}
                </span>
              </div>
              {member.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">{member.bio}</p>
              )}
              <div className="flex gap-4 justify-center">
                {isFaculty ? (
                  <span className="px-4 py-2 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                    Visit Page
                  </span>
                ) : (
                  <>
                    {member.links.github && (
                      <a
                        href={member.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <img
                          src="githubicon.png"
                          className="h-5 w-5 filter brightness-0 invert group-hover:scale-110 transition-transform"
                          alt="GitHub"
                        />
                      </a>
                    )}
                    {member.links.instagram && (
                      <a
                        href={member.links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <img
                          src="instagram.png"
                          className="h-5 w-5 filter brightness-0 invert group-hover:scale-110 transition-transform"
                          alt="Instagram"
                        />
                      </a>
                    )}
                    {member.links.linkedin && (
                      <a
                        href={member.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <img
                          src="linkedin.png"
                          className="h-5 w-5 filter brightness-0 invert group-hover:scale-110 transition-transform"
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
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
              {cardContent}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c4da2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </a>
          ) : (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
              {cardContent}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c4da2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AboutUs() {
  return (
    <div className="relative min-h-screen overflow-hidden py-16 px-4 sm:px-8 lg:px-20 -mb-20">
      <div className="relative z-10">
        <Section title="Advisors" members={advisors} />
        <Section title="Mentors" members={mentors} />
        <Section title="Team" members={team} />
      </div>
    </div>
  );
}
