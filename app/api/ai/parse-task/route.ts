import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createAIService } from '@/lib/ai/providers'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { getAISettings } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Get user's AI settings
    const aiSettings = await getAISettings(session.user.id)

    const aiService = createAIService(
      aiSettings?.provider as any,
      aiSettings?.apiKey || undefined,
      aiSettings?.model || undefined
    )

    if (!aiService) {
      return NextResponse.json({
        error: 'No AI provider configured. Please add an API key in settings.'
      }, { status: 400 })
    }

    const response = await aiService.complete([
      { role: 'system', content: SYSTEM_PROMPTS.parseTask },
      { role: 'user', content: input }
    ])

    // Parse the JSON response
    let parsedTask
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedTask = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: return basic parsing
        parsedTask = {
          title: input,
          priority: 4,
          dueDate: null,
          timeEstimate: null,
          category: null
        }
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      parsedTask = {
        title: input,
        priority: 4,
        dueDate: null,
        timeEstimate: null,
        category: null
      }
    }

    return NextResponse.json(parsedTask)
  } catch (error) {
    console.error('Error parsing task:', error)
    return NextResponse.json({ error: 'Failed to parse task' }, { status: 500 })
  }
}
