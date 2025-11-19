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
            action={async (formData: FormData) => {
              'use server'
              const name = formData.get('name') as string
              if (name) {
                await signIn('credentials', {
                  name,
                  redirectTo: '/'
                })
              }
            }}
            className="space-y-3"
          >
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Enter your name to get started
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                required
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Start Using App
            </Button>
          </form>

          {process.env.GITHUB_ID && process.env.GITHUB_SECRET && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form
                action={async () => {
                  'use server'
                  await signIn('github', { redirectTo: '/' })
                }}
              >
                <Button type="submit" variant="outline" className="w-full" size="lg">
                  Sign in with GitHub
                </Button>
              </form>
            </>
          )}

          {process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && (
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
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Start managing your tasks with AI assistance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
