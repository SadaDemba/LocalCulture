// Map category names to emoji icons
export const CategoryIcons: Record<string, string> = {
  'Music': '🎵',
  'Art': '🎨',
  'Food': '🍽️',
  'Technology': '💻',
  'Fitness': '🧘',
  'Sports': '⚽',
  'Education': '📚',
  'Community': '👥',
  'Festival': '🎭',
  'Charity': '❤️',
  'Business': '💼',
  'Default': '📍'
};

// Get the appropriate icon for a category
export function getCategoryIcon(category: string): string {
  return CategoryIcons[category] || CategoryIcons.Default;
}
