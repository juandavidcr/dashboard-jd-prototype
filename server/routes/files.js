const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    // Allowed extensions: pdf, docx, csv, txt
    const allowed = ['.pdf', '.docx', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only pdf, docx, csv, txt files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    const metaType = req.body.type || '';
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ success: true, file: { filename: file.filename, originalname: file.originalname, size: file.size, type: metaType, path: `/uploads/${file.filename}` } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  // list uploaded files
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read uploads' });
    const list = files.map(f => ({ filename: f, url: `/uploads/${f}` }));
    res.json(list);
  });
});

module.exports = router;
