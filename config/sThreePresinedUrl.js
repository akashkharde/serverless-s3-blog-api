import { asyncHandler } from '../utils/asyncHandler.js';
import mime from 'mime-types';
import { v4 as uuid } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 1) Client → Requests a pre-signed upload URL from backend
// 2) Backend → Generates signed URL and returns it
// 3) Client → Uploads image directly to S3 using signed URL
// 4) Client → Sends blog data + uploaded image key (URL) to backend
// 5) Backend → Stores blog entry in DB

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
        : undefined, // In Lambda → auto IAM Role
});


export const sThreePresinedUrl = asyncHandler(async (req, res) => {
    const { fileName } = req.body;

    if (!fileName) {
        return res.status(400).json({
            success: false,
            message: "fileName is required"
        });
    }


    const ext = fileName.split('.').pop().toLowerCase();
    const contentType = mime.lookup(ext);

    if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({
            success: false,
            message: "Invalid file type. Only images allowed"
        });
    }

    const safeFileName = `${uuid()}.${ext}`;
    const fileKey = `${safeFileName}`;
    console.log("contentType", contentType);

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 180 }); //sec
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;


    return res.status(200).json({
        success: true,
        message: "Presigned URL generated",
        uploadUrl,
        fileKey,
        contentType,
        publicUrl
    });
});
