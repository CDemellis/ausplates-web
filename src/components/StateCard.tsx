'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PlateView } from './PlateView';
import { AustralianState, STATE_NAMES } from '@/types/listing';

interface StateCardProps {
  state: AustralianState;
}

export function StateCard({ state }: StateCardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push(`/plates/${state.toLowerCase()}`);
    } else {
      router.push(`/signin?redirect=/plates/${state.toLowerCase()}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all w-full"
    >
      <PlateView combination={state} state={state} size="small" />
      <span className="mt-3 text-sm font-medium text-[var(--text)] group-hover:text-[var(--green)] transition-colors">
        {STATE_NAMES[state]}
      </span>
    </button>
  );
}
