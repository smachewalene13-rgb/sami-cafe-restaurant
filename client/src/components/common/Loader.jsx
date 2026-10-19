import { Coffee } from 'lucide-react';

export default function Loader({ text = 'Brewing perfection...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-coffee-200 border-t-coffee-700 animate-spin" />
        <Coffee className="w-7 h-7 text-coffee-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      {text && <p className="mt-4 text-sm font-medium text-coffee-800">{text}</p>}
    </div>
  );
}
