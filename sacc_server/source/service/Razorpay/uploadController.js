// controllers/uploadController.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const BUCKET = process.env.S3_BUCKET_NAME;

exports.generatePresignedUrls = async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'files array required' });
    }

    const results = await Promise.all(files.map(async (f) => {
      // f should have name and type
      const ext = (f.name || '').split('.').pop();
      const key = `tournaments/${Date.now()}_${uuidv4()}.${ext || 'bin'}`;

      const params = {
        Bucket: BUCKET,
        Key: key,
        Expires: 60 * 5, // presigned url valid for 5 minutes
        ContentType: f.type || 'application/octet-stream',
        ACL: 'public-read'
      };

      const presignedUrl = s3.getSignedUrl('putObject', params);

      // Build an accessible URL (depends on your bucket config)
      // If your bucket policy allows public read and the standard S3 URL works:
      const publicUrl = process.env.S3_PUBLIC_BASE_URL
        ? `${process.env.S3_PUBLIC_BASE_URL}/${key}`
        : `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        name: f.name,
        type: f.type,
        key,
        presignedUrl,
        publicUrl
      };
    }));

    return res.json({ success: true, uploads: results });
  } catch (err) {
    console.error('generatePresignedUrls', err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
};
