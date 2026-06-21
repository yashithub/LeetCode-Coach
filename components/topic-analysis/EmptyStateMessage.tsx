interface EmptyStateMessageProps {
  message: string;
  variant?: 'info' | 'success';
}

export default function EmptyStateMessage({ message, variant = 'info' }: EmptyStateMessageProps) {
  const accent = variant === 'success' ? 'border-mint/30 bg-mint/5 text-mint' : 'border-orange/30 bg-orange/5 text-orange';

  return (
    <div className={`rounded-lg border px-4 py-5 text-center ${accent}`}>
      <p className="text-sm leading-relaxed text-ink-muted">{message}</p>
    </div>
  );
}
