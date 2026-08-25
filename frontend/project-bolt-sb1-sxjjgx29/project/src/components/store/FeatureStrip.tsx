import { Truck, RotateCcw, ShieldCheck, CreditCard } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free delivery', detail: 'On orders above ₹999' },
  { icon: RotateCcw, title: 'Easy returns', detail: 'Within 7 days of delivery' },
  { icon: ShieldCheck, title: 'Genuine warranty', detail: 'Clear manufacturer coverage' },
  { icon: CreditCard, title: 'Pay your way', detail: 'Secure payments and COD' },
];

export function FeatureStrip() {
  return (
    <section className="border-b border-paper-300 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-paper-300 border-x border-paper-300 px-0 md:grid-cols-4 md:divide-y-0">
        {features.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="flex items-center gap-3 p-4 md:p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700"><Icon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-semibold text-ink-900">{title}</p>
              <p className="mt-0.5 text-xs text-ink-500">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
