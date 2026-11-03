import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize Cloudflare R2 S3 Client with checksum configs
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  // Ensure flexible checksum headers are omitted from presigned URLs
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

export interface PresignedUrlOptions {
  key: string
  contentType?: string
  expiresIn?: number
}

export async function getPresignedUploadUrl({
  key,
  contentType,
  expiresIn = 86400, // 24 hours expiration to prevent any clock drift between local/server
}: PresignedUrlOptions) {
  // We do not sign Content-Type in the URL signature so the browser can send the file freely without header mismatch
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn })
  const publicBaseUrl = (process.env.R2_PUBLIC_URL || '/api/media').replace(/\/$/, '')
  const publicUrl = `${publicBaseUrl}/${key}`

  return { uploadUrl, publicUrl, key }
}

export async function deleteR2Object(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
    await r2Client.send(command)
    return true
  } catch (err) {
    console.error('Error deleting R2 object:', err)
    return false
  }
}
