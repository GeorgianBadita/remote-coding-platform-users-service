import express from 'express'

const router = express.Router()

/* GET home page. */
router.get('/', (_req, res) => {
  res.status(200).send('YEAH1')
})

export default router
