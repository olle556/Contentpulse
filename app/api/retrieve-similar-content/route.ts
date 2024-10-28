import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAIEmbeddings } from '@langchain/openai';

const prisma = new PrismaClient();
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { query, sourceIds, limit = 5 } = await request.json();
    
    // Generate embedding for the query
    const [queryEmbedding] = await embeddings.embedDocuments([query]);
    
    // Retrieve similar content using pgvector similarity search
    const similarContent = await prisma.$queryRaw`
      SELECT 
        id,
        content,
        metadata,
        embedding <-> vector(array[${queryEmbedding}]) as similarity
      FROM "ScrapedContent"
      WHERE "sourceId" = ANY(${sourceIds})
      ORDER BY similarity ASC
      LIMIT ${limit}
    `;

    return NextResponse.json({ 
      success: true,
      content: similarContent
    });

  } catch (error) {
    console.error('Error retrieving similar content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve similar content' 
    }, { status: 500 });
  }
}
