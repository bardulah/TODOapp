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
    const { taskTitle, taskDescription } = await request.json()

    if (!taskTitle) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
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

    const taskContext = `Task: ${taskTitle}${taskDescription ? `\nDescription: ${taskDescription}` : ''}`

    const response = await aiService.complete([
      { role: 'system', content: SYSTEM_PROMPTS.brainstorm },
      { role: 'user', content: `${taskContext}\n\nHelp me brainstorm how to approach this task. What subtasks, steps, and considerations should I think about?` }
    ])

    return NextResponse.json({ brainstorm: response.content })
  } catch (error) {
    console.error('Error brainstorming:', error)
    return NextResponse.json({ error: 'Failed to generate brainstorm' }, { status: 500 })
  }
}
