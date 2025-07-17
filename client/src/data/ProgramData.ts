// Define Program type inline since it is not exported from services/types
export interface Program {
  id: string;
  title: string;
  description: string;
  mission: string;
  vision: string;
  whatYouLearn: string[];
  jobOpportunities: {
    roles: string[];
    industries: string[];
  };
}

export const programs: Program[] = [
  {
    id: "01",
    title: "Computer Science",
    description:
      "The B.Sc. Computer Science program equips students with a comprehensive foundation in software and systems design, blending theory with hands-on practice to develop skills for the tech-driven world. The curriculum covers programming, data structures, algorithms, and emerging technologies, preparing graduates to solve real-world problems and adapt to industry demands. Students gain exposure to innovations like artificial intelligence and machine learning, while the program fosters creativity and critical thinking for tackling complex technical challenges.",
    mission:
      "The mission is to produce high-level manpower particularly in computer science, who would be able to cope with the demands of advances and development in information and communication technology and who would be relevant in the fast-paced computer-driven global community.",
    vision:
      "To train students to become highly skilled and internationally competitive Computer Scientists and to contribute to Computer Science development through production of novel research outcomes that will enhance quality of lives and technological advancement.",
    whatYouLearn: [
      "To produce Computer Scientists who would be abreast of the state-of-the-art technologies in computing.",
      "To produce graduates who would be employers of labour in addition to the opportunity of securing gainful employment within and across the frontiers of the country (Nigeria) and in the global community.",
      "To employ the use of modern instructional materials and solution-based teaching techniques in the training of students to engender impactful research, teaching and learning outcomes.",
      "To initiate and encourage students' research propositions that is geared towards solving societal problems and propelling the department as a renowned Computer Science training and research hub.",
      "To get regular training and re-training on emerging research and effective teaching techniques in order to adequately impart the students with updated knowledge in various aspects of computing."
    ],
    jobOpportunities: {
      roles: [
        "System Analyst",
        "Programmer",
        "Software Engineer",
        "Database Administrator",
        "Network Engineer",
        "Data Analyst",
        "Data Scientist",
        "Web Developer",
        "Graphics Designer",
        "Computer Lecturer",
        "Researcher",
        "Cybersecurity Expert",
        "UI/UX Designer",
        "Game Developer",
        "Ethical Hacker",
        "…and many others"
      ],
      industries: [
        "IT Firms",
        "Fintechs",
        "Federal and State Ministries & Parastatals",
        "Federal Office of Statistics",
        "Market Research Companies",
        "Banks & Financial Institutions",
        "International Organizations (UNO, WHO, UNESCO, etc.)",
        "Oil & Gas (Shell, NNPC, Chevron, etc.)",
        "Educational Institutions (Teaching & Research)",
        "TV/Media Houses (Graphics/Animation)",
        "Cryptography & Network Services",
        "Telecoms (MTN, Glo, Airtel, 9mobile, etc.)",
        "…and many others"
      ]
    }
  },
  {
    id: "02",
    title: "Cyber Security",
    description:
      "The B.Sc. Cyber Security program provides students with essential knowledge and skills to protect digital systems and networks from cyber threats. Students will gain expertise in ethical hacking, encryption, security protocols, and risk management. The curriculum covers key areas like network security, digital forensics, and cyber law. Graduates are equipped to safeguard information, secure networks, and develop strategies to prevent and respond to cyber-attacks in an increasingly interconnected world. The program also addresses the importance of privacy protection, compliance with regulations, and securing cloud-based systems. Students are trained to think like hackers, enabling them to design more secure systems and detect vulnerabilities proactively.",
    mission:
      "To produce high-level manpower particularly in Cyber Security, capable of tackling emerging cyber threats and securing digital infrastructures, while staying relevant in the rapidly evolving, interconnected global environment.",
    vision:
      "To train students to become highly skilled and internationally competitive Cyber Security professionals, and to contribute to the national and global cyber defense ecosystem through cutting-edge research, ethical practices, and technological innovations.",
    whatYouLearn: [
      "To produce Cyber Security professionals who are up-to-date with the latest developments in cyber defense, ethical hacking, digital forensics, and secure system design.",
      "To train graduates who are capable of independently creating security solutions, consulting across various sectors, or working with security-focused institutions worldwide",
      "To deploy practical, lab-based, and solution-driven instructional methods to enhance teaching, learning, and hands-on security research.",
      "To initiate and support student-led security research aimed at solving real-world cybercrime and digital security challenges.",
      "To ensure continuous faculty development on emerging security trends and instructional innovations, providing students with relevant and modern security knowledge."
    ],
    jobOpportunities: {
      roles: [
        "Cybersecurity Analyst",
        "Penetration Tester",
        "Digital Forensics Expert",
        "Security Architect",
        "Incident Response Specialist",
        "Risk and Compliance Analyst",
        "Malware Analyst",
        "Information Security Officer",
        "Cloud Security Analyst",
        "Security Software Developer",
        "Security Consultant",
        "Threat Intelligence Analyst",
        "Cybercrime Investigator",
        "Policy and Governance Advisor",
        "…and many others"
      ],
      industries: [
        "Cybersecurity Firms",
        "Banks & Financial Institutions",
        "Telecom Companies",
        "Defense & Intelligence Agencies",
        "International Organizations (UN, AU, ECOWAS)",
        "Tech Startups",
        "Law Enforcement (Cybercrime Units)",
        "Oil & Gas",
        "Healthcare & Insurance",
        "E-commerce & Fintechs",
        "Educational Institutions",
        "Cloud Services & Hosting Platforms",
        "…and many others"
      ]
    }
  },
  {
    id: "03",
    title: "Information Technology",
    description:
      "The B.Sc. Information Technology program offers students a broad understanding of IT infrastructure, networking, and system administration. Students will develop practical skills in managing IT systems, supporting business technologies, and troubleshooting technical issues. The curriculum includes courses on database management, network administration, cloud computing, and enterprise software systems. Graduates are prepared to manage and optimize IT systems, ensuring efficient and secure technology solutions for businesses and organizations. Students are also introduced to emerging technologies like virtualization and the Internet of Things (IoT). The program emphasizes developing skills to manage IT infrastructure in both small and large-scale enterprise environments.",
    mission:
      "The mission is to provide students with an understanding of IT infrastructure and networking, empowering them to manage IT systems, support business technologies, and troubleshoot complex technical issues.",
    vision:
      "Our vision is to train IT professionals who can design, implement, and maintain IT systems that drive business operations and innovation across various industries.",
    whatYouLearn: [
      "To master IT infrastructure management, network administration, and system design.",
      "To gain practical skills in cloud computing, databases, and virtualization.",
      "To develop solutions for IT-related challenges in both small and large-scale environments."
    ],
    jobOpportunities: {
      roles: [
        "IT Support Specialist",
        "Network Administrator",
        "System Administrator",
        "IT Project Manager",
        "Cloud Support Engineer",
        "IT Consultant",
        "Help Desk Analyst",
        "Database Manager",
        "DevOps Assistant",
        "Enterprise Application Support",
        "Technical Support Engineer",
        "Infrastructure Technician",
        "…and many others"
      ],
      industries: [
        "Corporate IT Departments",
        "Healthcare Systems",
        "Educational Institutions",
        "Retail & E-commerce",
        "Government IT Agencies",
        "Telecommunications",
        "Financial Institutions",
        "Manufacturing & Logistics",
        "Cloud Hosting Companies",
        "Technology Startups",
        "…and many others"
      ]
    }
  }
];
