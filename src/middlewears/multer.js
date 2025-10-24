// import express from "express"
import multer from "multer"
// import express from "express"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./WD/NE/backend/03_yt/public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({
    storage
})