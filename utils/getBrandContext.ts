import { prisma } from '@/lib/prisma'

interface BrandQueryResult {
  id: string
  brandName: string
  brandType: string
  industry: string
  language: string | null
  website: string | null
  brandVoice: string
  usp: string | null
  missionStatement: string | null
  slogans: string | null
  demographics: string | null
  psychographics: string | null
  contentThemes: string | null
  primaryObjectives: string | null
  brandStory: string | null
}

export async function getRelevantBrandContext(userId: string) {
  try {
    const brands = await prisma.$queryRaw<BrandQueryResult[]>`
      SELECT 
        id, 
        "brandName",
        "brandType",
        industry,
        language,
        website,
        "brandVoice",
        usp,
        "missionStatement",
        slogans,
        demographics,
        psychographics,
        "contentThemes",
        "primaryObjectives",
        "brandStory"
      FROM "Brand"
      WHERE "userId" = ${userId}
      LIMIT 1;
    `

    if (!brands.length) {
      return null;
    }

    const brand = brands[0];
    return `
      Brand: ${brand.brandName}
      Type: ${brand.brandType}
      Industry: ${brand.industry}
      Language: ${brand.language ?? 'N/A'}
      Website: ${brand.website ?? 'N/A'}
      Voice: ${brand.brandVoice}
      USP: ${brand.usp ?? 'N/A'}
      Mission: ${brand.missionStatement ?? 'N/A'}
      Slogans: ${brand.slogans ?? 'N/A'}
      Demographics: ${brand.demographics ?? 'N/A'}
      Psychographics: ${brand.psychographics ?? 'N/A'}
      Content Themes: ${brand.contentThemes ?? 'N/A'}
      Primary Objectives: ${brand.primaryObjectives ?? 'N/A'}
      Brand Story: ${brand.brandStory ?? 'N/A'}
    `.trim();
  } catch (error) {
    console.error('Error getting brand context:', error);
    return null;
  }
}