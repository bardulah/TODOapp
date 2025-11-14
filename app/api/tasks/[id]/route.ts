import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getTask, updateTask, deleteTask } from '@/lib/db'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(4).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  dueDate: z.string().nullable().optional(),
  timeEstimate: z.number().int().positive().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  completed: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const task = await getTask(id, session.user.id)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    const taskData: any = {
      ...validatedData,
    }

    if (validatedData.dueDate !== undefined) {
      taskData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }

    if (validatedData.completed !== undefined) {
      taskData.completedAt = validatedData.completed ? new Date() : null
    }

    const task = await updateTask(id, session.user.id, taskData)
    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteTask(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
