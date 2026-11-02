import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import convert from 'heic-convert'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) {
      return new NextResponse('Failed to fetch image', { status: res.status })
    }

    const arrayBuffer = await res.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Convert HEIC to JPEG
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    })

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: any) {
    console.error('HEIC conversion error:', err)
    return new NextResponse('Failed to convert image', { status: 500 })
  }
}

