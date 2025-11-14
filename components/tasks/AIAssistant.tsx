'use client'

import { useState } from 'react'
import { X, Sparkles, Lightbulb, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { Task } from './TaskDashboard'

interface AIAssistantProps {
  tasks: Task[]
  onClose: () => void
  onRefresh: () => void
}

type AIFeature = 'recommendations' | 'brainstorm' | null

export default function AIAssistant({ tasks, onClose, onRefresh }: AIAssistantProps) {
  const [activeFeature, setActiveFeature] = useState<AIFeature>(null)
  const [brainstormInput, setBrainstormInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleRecommendations = async () => {
    setActiveFeature('recommendations')
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.recommendations)
      } else {
        const error = await response.json()
        setResult(error.error || 'Failed to generate recommendations')
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
      setResult('Failed to generate recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBrainstorm = async () => {
    if (!brainstormInput.trim()) return

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: brainstormInput,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.brainstorm)
      } else {
        const error = await response.json()
        setResult(error.error || 'Failed to generate brainstorm')
      }
    } catch (error) {
      console.error('Error brainstorming:', error)
      setResult('Failed to brainstorm. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Get AI-powered help with your tasks
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Selection */}
          {!activeFeature && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleRecommendations}>
                <CardContent className="p-6">
                  <Sparkles className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Smart Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered suggestions for prioritizing and organizing your {tasks.length} tasks
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setActiveFeature('brainstorm')}>
                <CardContent className="p-6">
                  <Lightbulb className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Brainstorm Task</h3>
                  <p className="text-sm text-muted-foreground">
                    Break down a complex task into actionable subtasks and steps
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Brainstorm Input */}
          {activeFeature === 'brainstorm' && !result && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">What task would you like to brainstorm?</label>
                <Textarea
                  value={brainstormInput}
                  onChange={(e) => setBrainstormInput(e.target.value)}
                  placeholder="e.g., Launch a new marketing campaign for our product"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBrainstorm}
                  disabled={loading || !brainstormInput.trim()}
                  className="flex-1"
                >
                  {loading ? 'Thinking...' : 'Brainstorm'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveFeature(null)
                    setBrainstormInput('')
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-primary animate-pulse mb-4" />
              <p className="text-muted-foreground">AI is thinking...</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-sans">{result}</pre>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveFeature(null)
                    setResult('')
                    setBrainstormInput('')
                  }}
                >
                  Try Another Feature
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!result && !loading && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Tip:</strong> Configure your preferred AI provider (Gemini, OpenRouter, or Groq) in your environment variables to use these features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
