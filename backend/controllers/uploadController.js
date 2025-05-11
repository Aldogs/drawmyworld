const processImage = require('../utils/processImage');
// or upload to S3 in here

exports.uploadDrawing = async (req, res) => {
  try {
    // Get and process the uploaded image
    const result = await processImage(req.body.imageData); // base64 or file
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};