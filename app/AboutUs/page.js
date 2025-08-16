import React from "react";

const Patrons = [
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
    role: "Head of the Department",
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

const teamLead = [
  {
    name: "Yash Dingar",
    role: "Manager",
    displayRole: ["Team Lead", "Developer", "Coordinator"],
    image: "/team/Yash.jpg",
    bio: "Team Lead | Full Stack Web who loves turning ideas into real-world solutions.",
    links: {
      github: "https://github.com/Q9Kawaii",
      linkedin: "https://www.linkedin.com/in/yash-dingar-946688276/",
      instagram: "https://www.instagram.com/q9kawaii/",
    },
  },
];

const developers = [
  {
    name: "Anurag Anand",
    role: "",
    displayRole: ["Team Member", "Lead Developer"],
    image: "/team/Anurag Anand.jpg",
    bio: "Full Stack Web + ML Developer. Love to build solutions with real world impact.",
    links: {
      github: "https://github.com/Frostyanand",
      linkedin: "https://www.linkedin.com/in/frostyanand",
      instagram: "https://www.instagram.com/frostyanand",
    },
  },
  {
    name: "Abishek Skanda G",
    role: "",
    displayRole: ["Team Member", "Developer"],
    image: "/team/skanda.jpg",
    bio: "Programming enthusiast",
    links: {
      github: "https://github.com/ItsSkanda",
      linkedin: "https://www.linkedin.com/in/abishek-skanda-g-751140326/",
      instagram: "https://www.instagram.com/abishekskanda",
    },
  },
  {
    name: "Mahik Jain",
    role: "",
    displayRole: ["Team Member", "Developer"],
    image: "/team/MahikJain.jpg",
    bio: "Keen Programmer",
    links: {
      github: "https://github.com/MJ-1112",
      linkedin: "https://www.linkedin.com/in/mahik-jain-b6a28b324/",
      instagram: "https://www.instagram.com/jain\_mahik/",
    },
  },
];

const contributors = [
  {
    name: "SIDDHANSH SRIVASTAVA",
    role: "",
    displayRole: ["Contributor"],
    image: "/team/Siddhansh.jpg",
    bio: "Systems programming and cybersecurity enthusiast",
    links: {
      github: "github.com/OMNIPOTENTHAVOC",
      linkedin: "https://www.linkedin.com/in/siddhansh-srivastava-86214a326/",
      instagram: "",
    },
  },
  {
    name: "Pranjal Kundu",
    role: "",
    displayRole: ["Coordinator"],
    image: "/team/fake.png",
    bio: "Live Life",
    links: {
    github: "https://github.com/10pranjal2005",
    linkedin: "https://www.linkedin.com/in/pranjal-kundu-3a557b303",
      instagram: "",
      github: "",
    },
  },
  {
    name: "Aditya Pandey",
    role: "",
    displayRole: ["Coordinator", "Discord Manager"],
    image: "/team/AdiShaitan.jpg",
    bio: "Contributor",
    links: {
      github: "github.com/devsin8",
      linkedin: "www.linkedin.com/in/aditya-pandey-7427171b5/",
      instagram: "www.instagram.com/adiii6806/",
    },
  },
];

const Section = ({ title, members }) => {
  const isFaculty = ["Patrons", "Advisors", "Mentors"].includes(title);
  
  // Array of colors for the dots
  const dotColors = [
    "bg-red-500",
    "bg-blue-500", 
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500"
  ];

  return (
    <div className="mb-16">
      <h3 className="text-center text-3xl font-bold text-[#0c4da2] mb-6">{title}</h3>
      <p className="text-center text-gray-600 mb-10">
        {title === "Patrons" && "Leadership & Administrative Excellence"}
        {title === "Advisors" && "Academic Guidance & Strategic Direction"}
        {title === "Mentors" && "Research Support & Faculty Mentorship"}
        {title === "Team Lead" && "Leadership & Project Management"}
        {title === "Developers" && "Technical Development & Implementation"}
        {title === "Contributors" && "Support & Collaborative Development"}
      </p>

      <div className="flex flex-wrap justify-center gap-8">
        {members.map((member, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition relative w-full sm:w-80 md:w-72 lg:w-80"
          >
            <div className={`flex flex-col items-center p-6 ${member.displayRole ? 'pb-16' : ''}`}>
              <img
                src={member.image}
                alt={member.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-200"
              />
              <h4 className="mt-4 font-bold text-lg text-[#0c4da2]">{member.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{member.role}</p>
              {member.bio && <p className="text-sm text-gray-600 text-center mb-4">{member.bio}</p>}

              {isFaculty ? (
                <a
                  href={member.links.visit}
                  target="\_blank"
                  rel="noreferrer"
                  className="text-sm px-4 py-2 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white rounded-full"
                >
                  Visit Profile
                </a>
              ) : (
                <div className="flex gap-3 mt-2">
                  {member.links.github && member.links.github.trim() !== "" && (
  <a href={member.links.github} target="_blank" rel="noreferrer">
    <img src="githubicon.png" alt="GitHub" className="w-6 h-6" />
  </a>
)}
{member.links.instagram && member.links.instagram.trim() !== "" && (
  <a href={member.links.instagram} target="_blank" rel="noreferrer">
    <img src="instagram.png" alt="Instagram" className="w-6 h-6" />
  </a>
)}
{member.links.linkedin && member.links.linkedin.trim() !== "" && (
  <a href={member.links.linkedin} target="_blank" rel="noreferrer">
    <img src="linkedin.png" alt="LinkedIn" className="w-6 h-6" />
  </a>
)}

                </div>
              )}
            </div>
            
            {member.displayRole && (
              <div className="absolute bottom-2 right-2 flex  gap-1">
                {Array.isArray(member.displayRole) ? (
                  member.displayRole.map((role, index) => (
                    <div
                      key={index}
                      className="bg-white text-gray-800 text-xs px-2 py-1 rounded-full text-center border border-gray-200 shadow-sm flex items-center gap-1"
                    >
                      <div className={`w-2 h-2 rounded-full ${dotColors[index % dotColors.length]}`}></div>
                      {role}
                    </div>
                  ))
                ) : (
                  <div className="bg-white text-gray-800 text-xs px-2 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${dotColors[0]}`}></div>
                    {member.displayRole}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AboutUs() {
  return (
    <div className="py-20 px-6 bg-gradient-to-br from-gray-50 to-indigo-50">
      <Section title="Patrons" members={Patrons} />
      <Section title="Advisors" members={advisors} />
      <Section title="Mentors" members={mentors} />
      <Section title="Team Lead" members={teamLead} />
      <Section title="Developers" members={developers} />
      <Section title="Contributors" members={contributors} />
    </div>
  );
}
