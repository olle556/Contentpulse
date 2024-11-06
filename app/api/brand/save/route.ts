import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { values, brandId } = await req.json()
    console.log('Processing request:', { brandId, userId: session.user.id })
    
    if (!values.brandName || !values.brandType || !values.industry || !values.brandVoice) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const data = {
      brandName: values.brandName,
      brandType: values.brandType,
      industry: values.industry,
      language: values.language || null,
      website: values.website || null,
      brandVoice: values.brandVoice,
      description: values.description || null,
      missionStatement: values.missionStatement || null,
      slogans: values.slogans || null,
      demographics: values.demographics || null,
      psychographics: values.psychographics || null,
      contentThemes: values.contentThemes || null,
      primaryObjectives: values.primaryObjectives || null,
      brandStory: values.brandStory || null,
    }

    try {
      const result = await prisma.brand.upsert({
        where: {
          id: brandId ? parseInt(brandId) : -1,
        },
        update: {
          ...data,
          updatedAt: new Date(),
        },
        create: {
          ...data,
          userId: session.user.id,
        },
      })
      
      console.log('Upserted brand:', result)
      return NextResponse.json({ 
        id: result.id,
        success: true 
      })

    } catch (error) {
      console.error('Operation failed:', error)
      return NextResponse.json(
        { error: 'Database operation failed' }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Request failed:', error)
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    )
  }
}