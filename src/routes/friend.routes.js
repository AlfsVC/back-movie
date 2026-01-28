import express from 'express'
import {
  getFriends,
  getRequests,
  requestFriend,
  acceptFriend,
  rejectFriend,
  removeFriend,
} from '../controllers/friendController.js'

const router = express.Router()

router.get('/', getFriends)
router.get('/requests', getRequests)
router.post('/', requestFriend)
router.put('/:id/accept', acceptFriend)
router.put('/:id/reject', rejectFriend)
router.delete('/:id', removeFriend)

export default router
