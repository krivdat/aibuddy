import { json } from '@sveltejs/kit';
import personas from '$lib/server/personas.json';

export async function GET() {
  const publicPersonas = personas.map(
    // eslint-disable-next-line no-unused-vars
    ({ system_prompt, initial_greeting_prompt, ...rest }) => rest
  );
  return json(publicPersonas);
}
