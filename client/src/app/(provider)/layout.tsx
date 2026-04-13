import type { Metadata } from 'next';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import ProviderHeader from '@/components/provider/ProviderHeader';
import ProviderGuard from '@/components/provider/ProviderGuard';
import './provider.css';

export const metadata: Metadata = {
  title: 'Provider Panel | FixHub',
  description: 'FixHub provider dashboard',
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderGuard>
      <div className="pv-shell">
        <ProviderSidebar />
        <div className="pv-main">
          <ProviderHeader />
          <main className="pv-content">{children}</main>
        </div>
      </div>
    </ProviderGuard>
  );
}
