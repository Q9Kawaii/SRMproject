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
    <div className="bg-white py-12 px-4 sm:px-8 lg:px-20 -mb-50">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">About Us</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow-xl hover:shadow-lg transition"
          >
            <img
              src={member.image}
              alt={member.name}
              className={`w-32 h-32 object-cover rounded-full border-4 border-blue-200 mb-4 ${member.class || ""} drop-shadow-2xl shadow-neutral-950`}
            />
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p className="text-sm text-blue-500">{member.role}</p>
            <p className="text-center mt-2 text-gray-600 text-sm">{member.bio}</p>
            <div className="flex gap-4 justify-center mt-3 text-blue-600">
              <a href={member.links?.github} target="_blank" rel="noopener noreferrer">
                <img src="githubicon.png" className="h-6" />
              </a>
              <a href={member.links?.instagram} target="_blank" rel="noopener noreferrer">
                <img src="instagram.png" className="h-6" />
              </a>
              <a href={member.links?.linkedin} target="_blank" rel="noopener noreferrer">
                <img src="linkedin.png" className="h-6" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
