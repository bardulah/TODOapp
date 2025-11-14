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
      { role: 'system', content: SYSTEM_PROMPTS.rewriteTask },
      { role: 'user', content: `${taskContext}\n\nRewrite this task to be clearer and more actionable.` }
    ])

    // Try to parse JSON response
    let rewriteResult
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        rewriteResult = JSON.parse(jsonMatch[0])
      } else {
        rewriteResult = {
          improved_title: response.content.split('\n')[0],
          subtasks: [],
          explanation: response.content
        }
      }
    } catch (e) {
      rewriteResult = {
        improved_title: response.content.split('\n')[0],
        subtasks: [],
        explanation: response.content
      }
    }

    return NextResponse.json(rewriteResult)
  } catch (error) {
    console.error('Error rewriting task:', error)
    return NextResponse.json({ error: 'Failed to rewrite task' }, { status: 500 })
  }
}
