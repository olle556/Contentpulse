import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { brandData } = body

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

    return NextResponse.json({ embedding: embedding.data[0].embedding })
  } catch (error) {
    console.error('Error generating embedding:', error)
    return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 })
  }
}