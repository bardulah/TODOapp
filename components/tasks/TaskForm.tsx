'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from './TaskDashboard'

interface TaskFormProps {
  task?: Task | null
  onClose: () => void
  onTaskCreated: () => void
}

interface Category {
  id: string
  name: string
  color: string
}

export default function TaskForm({ task, onClose, onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority?.toString() || '4')
  const [status, setStatus] = useState(task?.status || 'todo')
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '')
  const [timeEstimate, setTimeEstimate] = useState(task?.timeEstimate?.toString() || '')
  const [categoryId, setCategoryId] = useState(task?.categoryId || '')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [aiParsing, setAiParsing] = useState(false)
  const [aiRewriting, setAiRewriting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const taskData = {
        title,
        description: description || undefined,
        priority: parseInt(priority),
        status,
        dueDate: dueDate || undefined,
        timeEstimate: timeEstimate ? parseInt(timeEstimate) : undefined,
        categoryId: categoryId || undefined,
      }

      const url = task ? `/api/tasks/${task.id}` : '/api/tasks'
      const method = task ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        onTaskCreated()
      }
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  const handleAIParse = async () => {
    if (!title) return

    setAiParsing(true)
    try {
      const response = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: title }),
      })

      if (response.ok) {
        const parsed = await response.json()
        if (parsed.priority) setPriority(parsed.priority.toString())
        if (parsed.dueDate) setDueDate(parsed.dueDate)
        if (parsed.timeEstimate) setTimeEstimate(parsed.timeEstimate.toString())
      }
    } catch (error) {
      console.error('Error parsing task:', error)
    } finally {
      setAiParsing(false)
    }
  }

  const handleAIRewrite = async () => {
    if (!title) return

    setAiRewriting(true)
    try {
      const response = await fetch('/api/ai/rewrite-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title,
          taskDescription: description,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.improved_title) {
          setTitle(result.improved_title)
        }
        if (result.explanation) {
          setDescription(result.explanation)
        }
      }
    } catch (error) {
      console.error('Error rewriting task:', error)
    } finally {
      setAiRewriting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title with AI Parse */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Task Title *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAIParse}
                  disabled={aiParsing || !title}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {aiParsing ? 'Parsing...' : 'AI Parse'}
                </Button>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Finish report by Friday P1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Try natural language like "Buy milk tomorrow P1" or "Review code 30min"
              </p>
            </div>

            {/* Description with AI Rewrite */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAIRewrite}
                  disabled={aiRewriting || !title}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  {aiRewriting ? 'Rewriting...' : 'AI Rewrite'}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">P1 - Urgent</SelectItem>
                    <SelectItem value="2">P2 - High</SelectItem>
                    <SelectItem value="3">P3 - Medium</SelectItem>
                    <SelectItem value="4">P4 - Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Time Estimate */}
              <div className="space-y-2">
                <Label htmlFor="timeEstimate">Time Estimate (minutes)</Label>
                <Input
                  id="timeEstimate"
                  type="number"
                  min="1"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
