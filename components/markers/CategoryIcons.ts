// Map category names to emoji icons
export const CategoryIcons: Record<string, string> = {
  'Music': '🎵',
  'Musique': '🎵',
  'Art': '🎨',
  'Food': '🍽️',
  'Alimentation': '🍽️',
  'Technology': '💻',
  'Technologie': '💻',
  'Fitness': '🧘',
  'Forme et Bien-être': '🧘',
  'Sports': '⚽',
  'Sport': '⚽',
  'Education': '📚',
  'Éducation': '📚',
  'Community': '👥',
  'Communauté': '👥',
  'Festival': '🎭',
  'Charity': '❤️',
  'Charité': '❤️',
  'Business': '💼',
  'Professionnel': '💼',
  'Default': '📍'
};

// Get the appropriate icon for a category
export function getCategoryIcon(category: string): string {
  return CategoryIcons[category] || CategoryIcons.Default;
}
