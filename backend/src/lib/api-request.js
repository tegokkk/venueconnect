import { ValidationError } from '@/server/errors';

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new ValidationError('Request body must contain valid JSON');
  }
}
