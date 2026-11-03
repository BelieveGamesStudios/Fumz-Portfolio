import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileType, fileSize, folder = 'uploads' } = body

    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 })
    }

    const allowedFolders = ['builds', 'certifications', 'projects', 'uploads']
    const targetFolder = allowedFolders.includes(folder) ? folder : 'uploads'

    // Max file size limits: 1GB for builds, 25MB for other assets
    const maxSizeBytes =
      targetFolder === 'builds'
        ? 1024 * 1024 * 1024 // 1 GB
        : 25 * 1024 * 1024 // 25 MB

    if (fileSize && fileSize > maxSizeBytes) {
      const limitMB = Math.round(maxSizeBytes / (1024 * 1024))
      return NextResponse.json(
        { error: `File size exceeds the allowed limit of ${limitMB}MB` },
        { status: 400 }
      )
    }

    // Clean filename and create unique key
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase()
    const uniqueKey = `${targetFolder}/${Date.now()}_${sanitizedName}`

    const contentType = fileType || 'application/octet-stream'

    const { uploadUrl, publicUrl, key } = await getPresignedUploadUrl({
      key: uniqueKey,
      contentType,
    })

    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch (error: any) {
    console.error('Presign route error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate presigned upload URL' },
      { status: 500 }
    )
  }
}
