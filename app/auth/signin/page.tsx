import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SignInPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">AI Todo App</CardTitle>
          <CardDescription>
            Smart task management with AI-powered recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={async () => {
              'use server'
              await signIn('github', { redirectTo: '/' })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Sign in with GitHub
            </Button>
          </form>

          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/' })
            }}
          >
            <Button type="submit" variant="outline" className="w-full" size="lg">
              Sign in with Google
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Sign in to start managing your tasks with AI assistance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
