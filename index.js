const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');





const app = express();
const port = 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Homepage route
app.get('/', (req, res) => {
  res.send('File Upload API is running.');
});

// Upload a single file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Retrieve list of uploaded files
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve files' });
    }
    res.json({ files });
  });
});

// Download a file
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  res.download(filePath);
});

// Delete a file
app.delete('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`File Upload API running at http://localhost:${port}`);
});
