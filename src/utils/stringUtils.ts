/**
 * Capitalizes the first letter of each word in a string (Title Case).
 * Example: "john doe" -> "John Doe"
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
