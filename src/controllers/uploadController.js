const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const uploadJobDescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    let content = '';

    if (mimeType === 'text/plain') {
      content = fs.readFileSync(filePath, 'utf8');

    } else if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;

    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const data = await mammoth.extractRawText({ path: filePath });
      content = data.value;

    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: 'Unsupported file type'
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