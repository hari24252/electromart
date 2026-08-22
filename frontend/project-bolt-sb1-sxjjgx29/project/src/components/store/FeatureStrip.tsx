import { Truck, RotateCcw, Shield, Headphones, Zap, CreditCard } from 'lucide-react';

export function FeatureStrip() {
  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders ₹999+' },
    { icon: RotateCcw, title: '7-Day Returns', desc: 'Hassle-free policy' },
    { icon: Shield, title: 'Genuine Warranty', desc: 'On all products' },
    { icon: CreditCard, title: 'COD Available', desc: 'Pay when you receive' },
    { icon: Zap, title: 'Fast Dispatch', desc: 'Same-day for in-stock' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
  ];

  return (
    <div className="bg-white brutal-border-y border-y-2 border-ink-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-3 brutal-border bg-paper-100 hover:bg-paper-200 transition-colors group"
              >
                <span className="brutal-border bg-white p-2.5 mb-2 group-hover:shadow-brutal-sm transition-all">
                  <Icon className="w-5 h-5 text-ink-900" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wide">{f.title}</p>
                <p className="text-2xs text-ink-500 mt-0.5">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
