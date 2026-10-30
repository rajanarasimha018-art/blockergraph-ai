import { Router } from 'express';
import { db } from '../db/db.js';
import { z } from 'zod';
const router = Router();
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional()
});
router.get('/me', (req, res) => {
    const users = db.getUsers();
    res.json({ success: true, user: users[0] || null });
});
router.post('/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }
    const { email } = parsed.data;
    let user = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        // In demo / fast sign-in mode, auto-provision user
        user = {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'Project Manager'
        };
        db.getUsers().push(user);
    }
    res.json({
        success: true,
        user,
        token: `demo-token-${user.id}`
    });
});
router.post('/demo-login', (req, res) => {
    const user = db.getUsers()[0];
    res.json({
        success: true,
        user,
        token: `demo-token-${user.id}`
    });
});
export default router;
