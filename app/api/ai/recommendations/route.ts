import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createAIService } from '@/lib/ai/providers'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { getTasks, getAISettings } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's tasks
    const tasks = await getTasks(session.user.id)

    if (tasks.length === 0) {
      return NextResponse.json({
        recommendations: 'No tasks found. Create some tasks to get AI recommendations!'
      })
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

    // Format tasks for AI
    const tasksContext = tasks.map((task, idx) =>
      `${idx + 1}. [P${task.priority}] ${task.title}${task.dueDate ? ` (Due: ${new Date(task.dueDate).toLocaleDateString()})` : ''}${task.timeEstimate ? ` (~${task.timeEstimate}min)` : ''} - Status: ${task.status}`
    ).join('\n')

    const response = await aiService.complete([
      { role: 'system', content: SYSTEM_PROMPTS.recommendations },
      { role: 'user', content: `Here are my current tasks:\n\n${tasksContext}\n\nProvide recommendations for managing these tasks effectively.` }
    ])

    return NextResponse.json({ recommendations: response.content })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
