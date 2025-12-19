export const CATEGORIES = {
  DESIGN: {
    value: "design",
    label: "Design"
  },
  WEB_DEVELOPMENT: {
    value: "web_development",
    label: "Web Development"
  },
  ANIMATION: {
    value: "animation",
    label: "Animation"
  },
  MUSIC: {
    value: "music",
    label: "Music"
  }
};

export const getCategoryByValue = (value) => {
  return Object.values(CATEGORIES).find(cat => cat.value === value);
};

export const getCategoryByLabel = (label) => {
  return Object.values(CATEGORIES).find(cat => cat.label === label);
}; 