import { NextResponse } from 'next/server'
import { getPublicSocialLinks } from '@/app/actions/public'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const links = await getPublicSocialLinks()
    return NextResponse.json(links, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error in /api/links:', error)
    return NextResponse.json({}, { status: 500 })
  }
}

