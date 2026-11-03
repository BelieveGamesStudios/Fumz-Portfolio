import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const resolvedParams = await params
    const key = Array.isArray(resolvedParams.key)
      ? resolvedParams.key.join('/')
      : resolvedParams.key

    if (!key) {
      return new NextResponse('Key not provided', { status: 400 })
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })

    const response = await s3.send(command)

    if (!response.Body) {
      return new NextResponse('Object body empty', { status: 404 })
    }

    // Convert AWS SDK stream to Web ReadableStream
    const nodeStream = response.Body as unknown as Readable
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk))
        nodeStream.on('end', () => controller.close())
        nodeStream.on('error', (err) => controller.error(err))
      },
      cancel() {
        nodeStream.destroy()
      },
    })

    const headers = new Headers()
    if (response.ContentType) {
      headers.set('Content-Type', response.ContentType)
    }
    if (response.ContentLength) {
      headers.set('Content-Length', response.ContentLength.toString())
    }
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(webStream, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse('File not found', { status: 404 })
    }
    console.error('Error fetching media from R2:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

