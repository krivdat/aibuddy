import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
  try {
    const response = await fetch('/api/personas');
    if (!response.ok) {
      console.error('Failed to fetch personas:', response.statusText);
      throw error(response.status, 'Failed to fetch personas');
    }
    const personas = await response.json();
    return { personas };
  } catch (err) {
    console.error('Error loading personas:', err);
    throw error(500, 'Could not load personas');
  }
}
