// Client-side utility functions for schedule display
// Database operations are handled in API routes

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return time;
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get relative date string (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function getRelativeDateString(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return 'Today';
  }
  if (diffInDays === 1) {
    return 'Tomorrow';
  }
  if (diffInDays === -1) {
    return 'Yesterday';
  }
  if (diffInDays > 0) {
    return `In ${diffInDays} days`;
  }
  return `${Math.abs(diffInDays)} days ago`;
}
