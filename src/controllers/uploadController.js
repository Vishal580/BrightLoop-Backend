const fs = require('fs');
const path = require('path');

const uploadJobDescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    
    // Read the file content
    let content = '';
    
    if (req.file.mimetype === 'text/plain') {
      content = fs.readFileSync(filePath, 'utf8');
    } else if (req.file.mimetype === 'application/pdf') {
      // For PDF files, you might want to use a PDF parser like pdf-parse
      // For now, we'll return an error message
      return res.status(400).json({
        error: 'PDF parsing not implemented yet. Please use .txt files.'
      });
    }

    // Clean up - delete the uploaded file after reading
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      content: content,
      filename: req.file.originalname
    });

  } catch (error) {
    console.error('Error processing uploaded file:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to process uploaded file'
    });
  }
};

module.exports = {
  uploadJobDescription
};