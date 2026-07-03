import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders above 50,000 XAF' },
  { icon: RotateCcw, title: '30-Day Returns', text: 'Hassle-free money back' },
  { icon: ShieldCheck, title: 'Secure Payment', text: 'Card & Mobile Money' },
  { icon: Headphones, title: '24/7 Support', text: 'Talk to a real tech expert' },
];

export function FeatureStrip() {
  return (
    <section className="container-klass mt-12">
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] p-6 dark:border-[#2A2A2A] dark:bg-[#141414] lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-center gap-3">
            <div className="rounded-full bg-brand/10 p-3 text-brand dark:text-brand-light">
              <feature.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{feature.title}</p>
              <p className="text-xs text-[#555555] dark:text-[#999999]">{feature.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
