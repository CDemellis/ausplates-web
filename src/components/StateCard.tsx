import Link from 'next/link';
import { PlateView } from './PlateView';
import { AustralianState, STATE_NAMES } from '@/types/listing';

interface StateCardProps {
  state: AustralianState;
}

export function StateCard({ state }: StateCardProps) {
  return (
    <Link
      href={`/plates/${state.toLowerCase()}`}
      className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all w-full"
    >
      <PlateView combination={state} state={state} size="small" />
      <span className="mt-3 text-sm font-medium text-[var(--text)] group-hover:text-[var(--green)] transition-colors">
        {STATE_NAMES[state]}
      </span>
    </Link>
  );
}
