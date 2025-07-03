import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { acceptFriendRequest, getFriendRequests, getmyfriends, getOutgoingFriendRequests, getrecommendedusers, sendFriendRequest } from '../controllers/user.controller.js';
const router = express.Router();
router.use(protectedRoute);
router.get('/',getrecommendedusers);
router.get('/friends',getmyfriends);
router.post('/friend-request/:id',sendFriendRequest);
router.put('/friend-request/:id/accept',acceptFriendRequest);
router.get('/friend-request',getFriendRequests);
router.get('/outgoing-friend-requests',getOutgoingFriendRequests);

export default router;