import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';

export interface AuthedRequest extends Request {
  user?: User;
}

// Like a Laravel auth middleware: reads "Authorization: Bearer <token>",
// asks Supabase to validate it, and attaches the user to req.user.
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = data.user;
  next();
}
