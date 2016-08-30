import express from 'express';
import user from './user';
import memo from './memo';

const router = express.Router();

router.use('/user',user);
router.use('/memo',memo)

export default router;
