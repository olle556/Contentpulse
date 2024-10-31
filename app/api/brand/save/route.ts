import { OpenAI } from 'openai'
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function generateEmbedding(brandData: any) {
  const brandText = `
    Brand: ${brandData.brandName}
    Type: ${brandData.brandType}
    Industry: ${brandData.industry}
    Voice: ${brandData.brandVoice}
    USP: ${brandData.usp}
    Mission: ${brandData.missionStatement}
    Target Audience: ${brandData.demographics} ${brandData.psychographics}
    Story: ${brandData.brandStory}
  `.trim()

  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: brandText,
  })

  return embedding.data[0].embedding
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { values, brandId } = await req.json()
    
    if (!values.brandName || !values.brandType || !values.industry || !values.brandVoice) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    try {
      // Generate embedding directly
      console.log('Generating embeddings...');
      const embedding = await generateEmbedding(values);
      
      // Split the embedding into chunks
      const embedding_1 = embedding.slice(0, 384);
      const embedding_2 = embedding.slice(384, 768);
      const embedding_3 = embedding.slice(768, 1152);
      const embedding_4 = embedding.slice(1152, 1536);

      if (brandId) {
        // Update existing brand with new embeddings
        await prisma.$executeRaw`
          UPDATE "Brand"
          SET 
            "brandName" = ${values.brandName},
            "brandType" = ${values.brandType},
            "industry" = ${values.industry},
            "brandVoice" = ${values.brandVoice},
            "language" = ${values.language || null},
            "website" = ${values.website || null},
            "usp" = ${values.usp || null},
            "missionStatement" = ${values.missionStatement || null},
            "slogans" = ${values.slogans || null},
            "demographics" = ${values.demographics || null},
            "psychographics" = ${values.psychographics || null},
            "contentThemes" = ${values.contentThemes || null},
            "primaryObjectives" = ${values.primaryObjectives || null},
            "brandStory" = ${values.brandStory || null},
            "embedding_1" = ('[' || ${embedding_1.join(',')} || ']')::vector(384),
            "embedding_2" = ('[' || ${embedding_2.join(',')} || ']')::vector(384),
            "embedding_3" = ('[' || ${embedding_3.join(',')} || ']')::vector(384),
            "embedding_4" = ('[' || ${embedding_4.join(',')} || ']')::vector(384),
            "updatedAt" = NOW()
          WHERE id = ${brandId}
        `;
        
        return NextResponse.json({ success: true });
      } else {
        console.log('Creating new brand with embeddings...');
        const newId = crypto.randomUUID();
        
        await prisma.$executeRaw`
          INSERT INTO "Brand" (
            "id",
            "brandName",
            "brandType",
            "industry",
            "brandVoice",
            "language",
            "website",
            "usp",
            "missionStatement",
            "slogans",
            "demographics",
            "psychographics",
            "contentThemes",
            "primaryObjectives",
            "brandStory",
            "userId",
            "embedding_1",
            "embedding_2",
            "embedding_3",
            "embedding_4",
            "createdAt",
            "updatedAt"
          ) VALUES (
            ${newId},
            ${values.brandName},
            ${values.brandType},
            ${values.industry},
            ${values.brandVoice},
            ${values.language || null},
            ${values.website || null},
            ${values.usp || null},
            ${values.missionStatement || null},
            ${values.slogans || null},
            ${values.demographics || null},
            ${values.psychographics || null},
            ${values.contentThemes || null},
            ${values.primaryObjectives || null},
            ${values.brandStory || null},
            ${session.user.id},
            ('[' || ${embedding_1.join(',')} || ']')::vector(384),
            ('[' || ${embedding_2.join(',')} || ']')::vector(384),
            ('[' || ${embedding_3.join(',')} || ']')::vector(384),
            ('[' || ${embedding_4.join(',')} || ']')::vector(384),
            NOW(),
            NOW()
          )
        `;

        const verifyResult = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Brand" WHERE id = ${newId}
        `;

        if (!verifyResult?.[0]?.id) {
          throw new Error('Failed to create brand');
        }

        return NextResponse.json({ id: verifyResult[0].id });
      }
    } catch (error) {
      console.error('Database operation failed:', error)
      console.error('Full error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Database operation failed', details: error }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Failed to save brand:', error)
    return NextResponse.json(
      { error: 'Failed to save brand', details: error }, 
      { status: 500 }
    )
  }
}