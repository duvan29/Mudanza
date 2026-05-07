import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const user = await User.findById(session.userId).select('displayName email').lean();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar userName={user.displayName} userEmail={user.email} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
