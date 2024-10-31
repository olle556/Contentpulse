import { prisma } from '@/lib/prisma'
import { generateBrandEmbedding } from './embeddings'

// Define the type for the raw query result
interface BrandQueryResult {
  id: string
  brandName: string
  brandVoice: string
  usp: string | null
  missionStatement: string | null
  distance: number
}

export async function getRelevantBrandContext(prompt: string) {
  // Generate embedding for the input prompt
  const promptEmbedding = await generateBrandEmbedding({ brandName: prompt })
  
  // Find similar brand contexts using vector similarity
  const similarBrands = await prisma.$queryRaw<BrandQueryResult[]>`
    SELECT id, "brandName", "brandVoice", usp, "missionStatement",
           embedding <-> ${promptEmbedding}::vector as distance
    FROM "Brand"
    ORDER BY distance
    LIMIT 3;
  `

  // Format the context for Claude
  const context = similarBrands.map((brand) => `
    Brand: ${brand.brandName}
    Voice: ${brand.brandVoice}
    USP: ${brand.usp ?? 'N/A'}
    Mission: ${brand.missionStatement ?? 'N/A'}
  `).join('\n\n')

  return context
}