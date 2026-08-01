import { CheckCircle2 } from 'lucide-react';

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-[#323641] text-white text-sm px-5 py-3 rounded-xl shadow-lg animate-[fadeUp_0.25s_ease]"
      role="status"
    >
      <CheckCircle2 className="w-5 h-5 text-[#39ae00] shrink-0" />
      <span>{message}</span>
    </div>
  );
}
