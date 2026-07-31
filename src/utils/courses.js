// // src/utils/courses.js
// const COURSE_PRICES = {
//   'Frontend Development': 80000,
//   'Backend Development': 80000,
//   'Full Stack Development': 200000,
//   'Mobile Development': 100000,
//   'Cybersecurity': 100000,
//   'Data Science': 80000,
//   'Data Analysis': 80000,
//   'Product Design (UI/UX)': 80000,
//   'Product Management': 80000,
//   'Web3 and Blockchain Development': 200000,
//   'AI / Machine Learning': 200000,
//   'Graphics Design': 0, // Free
// }

// module.exports = { COURSE_PRICES }



// src/utils/courses.js
const COURSE_PRICES = {
  'Frontend Development': { price: 80000, weeks: 11 },
  'Backend Development': { price: 80000, weeks: 11 },
  'Full Stack Development': { price: 200000, weeks: 22 },
  'Mobile Development': { price: 100000, weeks: 11 },
  'Cybersecurity': { price: 100000, weeks: 11 },
  'Data Science': { price: 80000, weeks: 11 },
  'Data Analysis': { price: 80000, weeks: 11 },
  'Product Design (UI/UX)': { price: 80000, weeks: 11 },
  'Product Management': { price: 80000, weeks: 11 },
  'Web3 and Blockchain Development': { price: 200000, weeks: 22 },
  'AI / Machine Learning': { price: 200000, weeks: 22 },
  'Graphics Design': { price: 0, weeks: 0 }, // Free
};

module.exports = { COURSE_PRICES };