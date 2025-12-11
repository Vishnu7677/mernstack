// controllers/uploadController.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require('uuid');

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME;

exports.generatePresignedUrls = async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'files array required' });
    }

    const results = await Promise.all(files.map(async (f) => {
      const ext = (f.name || '').split('.').pop();
      const key = `tournaments/${Date.now()}_${uuidv4()}.${ext || 'bin'}`;

      // Create the PutObject command
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: f.type || 'application/octet-stream',
        // Note: ACL is often not recommended in v3 - use bucket policies instead
        // ACL: 'public-read'
      });

      // Generate presigned URL (valid for 5 minutes)
      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

      // Public URL (make sure your bucket policy allows public read if needed)
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