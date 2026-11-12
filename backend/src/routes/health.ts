import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth, type AuthedRequest } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/health -> confirms the server is up and Supabase auth is reachable
router.get('/health', async (_req, res) => {
  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    res.status(500).json({ status: 'error', supabase: error.message });
    return;
  }
  res.json({ status: 'ok', supabase: 'connected' });
});

// GET /api/me -> protected route example (needs a Supabase access token)
router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ id: req.user?.id, email: req.user?.email });
});

export default router;
