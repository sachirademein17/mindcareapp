import multer from 'multer'
import path from 'path'
import { Request, Response, NextFunction } from 'express'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})

export const upload = multer({ storage })
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.array('documents', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed', details: err.message })
    }
    next()
  })
}