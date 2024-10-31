export async function generateBrandEmbedding(brandData: any) {
  try {
    // Get the base URL from environment variables, falling back to localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brandData }),
    })

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate embedding');
    }

    const data = await response.json()
    return data.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}