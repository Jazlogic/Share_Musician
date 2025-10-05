import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.IDRIVE_REGION as string,
  endpoint: process.env.IDRIVE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY as string,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.IDRIVE_BUCKET_NAME as string;
console.log('BUCKET_NAME en storageService:', BUCKET_NAME);

export const storageService = {
  async getUploadUrl(key: string, fileType: string) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return { uploadURL, key };
  },

  async getDownloadUrl(key: string) {
    console.log('Intentando obtener URL de descarga para key:', key, 'en bucket:', BUCKET_NAME);
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const downloadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return { downloadURL };
  },
};