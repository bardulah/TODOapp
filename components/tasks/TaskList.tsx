'use client'

import { CheckCircle2, Circle, Clock, Edit, Trash2, Flag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPriorityColor, getPriorityLabel, formatTimeEstimate } from '@/lib/utils'
import { format } from 'date-fns'
import type { Task } from './TaskDashboard'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleComplete: (task: Task) => void
}

export default function TaskList({ tasks, onEdit, onDelete, onToggleComplete }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                onClick={() => onToggleComplete(task)}
                className="mt-1 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      title="Edit task"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(task.id)}
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 mt-3 text-sm">
                  {/* Priority */}
                  <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                    <Flag className="h-3 w-3" />
                    <span>{getPriorityLabel(task.priority)}</span>
                  </div>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {/* Time Estimate */}
                  {task.timeEstimate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeEstimate(task.timeEstimate)}</span>
                    </div>
                  )}

                  {/* Category */}
                  {task.category && (
                    <span
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${task.category.color}20`,
                        color: task.category.color,
                      }}
                    >
                      {task.category.name}
                    </span>
                  )}

                  {/* Status */}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 space-y-1">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 text-sm">
                        {subtask.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
