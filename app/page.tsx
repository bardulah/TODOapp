import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import TaskDashboard from '@/components/tasks/TaskDashboard'
import Header from '@/components/Header'

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header user={session.user} />
      <main className="container mx-auto px-4 py-8">
        <TaskDashboard />
      </main>
    </div>
  )
}
