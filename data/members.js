/*
  Member directory
  ----------------
  Add, edit, or remove entries in this array. Each entry automatically gets
  a profile at member.html?id=your-slug. The `custom` object is optional:
  leave it out for the default profile, or use it to personalize the page.
*/
window.GROUP_MEMBERS = [
  {
    slug: "vu-van-khu",
    name: "Vu Van Khu",
    displayName: "Dr. Vu Van Khu",
    role: "Group lead · Assistant Professor",
    affiliation: "Data Science, VinUniversity",
    initials: "VK",
    accent: "teal",
    bio: "I work at the intersection of combinatorics, coding theory, and combinatorial optimization, with a focus on mathematical structures that can make communication and decision systems more reliable.",
    interests: ["Coding theory", "Combinatorics", "Combinatorial optimization"],
    email: "vu.vankhu@vinuni.edu.vn",
    links: [{ label: "VinUniversity profile", url: "https://vinuni.edu.vn/" }],
    custom: {
      label: "Current focus",
      text: "Building a shared research program around constrained sequences, graph structures, and optimization methods for communication and data systems."
    }
  }
  // Add another object here to create another member profile.
];
