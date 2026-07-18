'use client';

import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n';
import { useT } from '@/components/layout/i18n-ui';

const features: { icon: any; title: TranslationKey; text: TranslationKey }[] = [
  { icon: Truck, title: 'features.freeShipping', text: 'features.freeShippingSub' },
  { icon: RotateCcw, title: 'features.returns', text: 'features.returnsSub' },
  { icon: ShieldCheck, title: 'features.securePayment', text: 'features.securePaymentSub' },
  { icon: Headphones, title: 'features.support', text: 'features.supportSub' },
];

export function FeatureStrip() {
  const { t } = useT();
  return (
    <section className="container-klass mt-12">
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] p-6 dark:border-[#2A2A2A] dark:bg-[#141414] lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-center gap-3">
            <div className="rounded-full bg-brand/10 p-3 text-brand dark:text-brand-light">
              <feature.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{t(feature.title)}</p>
              <p className="text-xs text-[#555555] dark:text-[#999999]">{t(feature.text)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
