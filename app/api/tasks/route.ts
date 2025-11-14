import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getTasks, createTask } from '@/lib/db'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(4).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  dueDate: z.string().optional(),
  timeEstimate: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  aiGenerated: z.boolean().optional(),
  aiContext: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const categoryId = searchParams.get('categoryId')

    const filters: any = {}
    if (status) filters.status = status
    if (priority) filters.priority = parseInt(priority)
    if (categoryId) filters.categoryId = categoryId

    const tasks = await getTasks(session.user.id, filters)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    const taskData: any = {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    }

    const task = await createTask(session.user.id, taskData)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
