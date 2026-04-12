import type { Metadata } from 'next';
import UserNavbar from '@/components/user/UserNavbar';
import './user.css';

export const metadata: Metadata = {
  title: 'Dashboard | FixHub',
  description: 'Browse services, manage bookings, and track your profile on FixHub.',
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="usr-shell">
      <UserNavbar />
      <main className="usr-content">{children}</main>
    </div>
  );
}
