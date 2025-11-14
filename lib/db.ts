// Data Access Layer - Centralized database operations with auth checks
// This pattern is recommended for Next.js 15+ instead of middleware-based auth

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Task operations
export async function getTasks(userId: string, filters?: {
  status?: string
  priority?: number
  categoryId?: string
}) {
  return prisma.task.findMany({
    where: {
      userId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
    },
    include: {
      category: true,
      subtasks: true,
    },
    orderBy: [
      { priority: 'asc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  })
}

export async function getTask(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    include: {
      category: true,
      subtasks: true,
    },
  })
}

export async function createTask(
  userId: string,
  data: {
    title: string
    description?: string
    priority?: number
    status?: string
    dueDate?: Date
    timeEstimate?: number
    categoryId?: string
    aiGenerated?: boolean
    aiContext?: string
  }
) {
  return prisma.task.create({
    data: {
      ...data,
      userId,
    },
    include: {
      category: true,
      subtasks: true,
    },
  })
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    title?: string
    description?: string
    priority?: number
    status?: string
    dueDate?: Date | null
    timeEstimate?: number | null
    categoryId?: string | null
    completed?: boolean
    completedAt?: Date | null
  }
) {
  // Verify ownership
  const task = await getTask(taskId, userId)
  if (!task) {
    throw new Error('Task not found')
  }

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      category: true,
      subtasks: true,
    },
  })
}

export async function deleteTask(taskId: string, userId: string) {
  // Verify ownership
  const task = await getTask(taskId, userId)
  if (!task) {
    throw new Error('Task not found')
  }

  return prisma.task.delete({
    where: { id: taskId },
  })
}

// Category operations
export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(
  userId: string,
  data: {
    name: string
    color?: string
    icon?: string
  }
) {
  return prisma.category.create({
    data: {
      ...data,
      userId,
    },
  })
}

// Subtask operations
export async function createSubtask(
  taskId: string,
  userId: string,
  data: {
    title: string
  }
) {
  // Verify task ownership
  const task = await getTask(taskId, userId)
  if (!task) {
    throw new Error('Task not found')
  }

  return prisma.subtask.create({
    data: {
      ...data,
      taskId,
    },
  })
}

export async function updateSubtask(
  subtaskId: string,
  userId: string,
  data: {
    title?: string
    completed?: boolean
  }
) {
  // Verify ownership through task
  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId },
    include: { task: true },
  })

  if (!subtask || subtask.task.userId !== userId) {
    throw new Error('Subtask not found')
  }

  return prisma.subtask.update({
    where: { id: subtaskId },
    data,
  })
}

export async function deleteSubtask(subtaskId: string, userId: string) {
  // Verify ownership through task
  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId },
    include: { task: true },
  })

  if (!subtask || subtask.task.userId !== userId) {
    throw new Error('Subtask not found')
  }

  return prisma.subtask.delete({
    where: { id: subtaskId },
  })
}

// AI Settings operations
export async function getAISettings(userId: string) {
  return prisma.aiSettings.findUnique({
    where: { userId },
  })
}

export async function upsertAISettings(
  userId: string,
  data: {
    provider?: string
    apiKey?: string
    model?: string
  }
) {
  return prisma.aiSettings.upsert({
    where: { userId },
    update: data,
    create: {
      ...data,
      userId,
    },
  })
}
