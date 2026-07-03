import { Award, MapPin, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'About Us' };

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy customers' },
  { icon: Award, value: '8 years', label: 'In business' },
  { icon: ShieldCheck, value: '100%', label: 'Genuine products' },
  { icon: MapPin, value: '10 regions', label: 'Nationwide delivery' },
];

export default function AboutPage() {
  return (
    <div className="container-klass max-w-4xl py-14">
      <h1 className="text-center text-3xl font-extrabold sm:text-4xl">
        About <span className="text-brand dark:text-brand-light">Klass Computer</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#555555] dark:text-[#999999]">
        Founded in Douala, Klass Computer has grown into one of Cameroon&apos;s most trusted
        computer and electronics retailers. We believe everyone deserves genuine technology
        at honest prices — backed by real warranties and real human support.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-klass p-6 text-center">
            <stat.icon className="mx-auto h-7 w-7 text-brand dark:text-brand-light" />
            <p className="mt-3 text-2xl font-extrabold">{stat.value}</p>
            <p className="text-sm text-[#555555] dark:text-[#999999]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="prose-klass mt-12">
        <h2>Our Story</h2>
        <p>
          What started as a small repair counter in Akwa has become a full retail operation
          with an online store serving all ten regions of Cameroon. Every product we sell is
          sourced from official distributors, tested by our technicians and covered by a
          12-month warranty.
        </p>
        <h2>Why buy from us?</h2>
        <ul>
          <li><strong>Genuine products only</strong> — official manufacturer warranty on everything.</li>
          <li><strong>Expert advice</strong> — our staff are technicians first, salespeople second.</li>
          <li><strong>After-sales support</strong> — free setup help and same-day service in Douala.</li>
          <li><strong>Fair prices</strong> — transparent pricing in XAF with no hidden fees.</li>
        </ul>
      </div>

      <div className="mt-12 rounded-lg bg-[#0A0A0A] p-8 text-center">
        <h2 className="text-xl font-extrabold text-white">Visit our showroom</h2>
        <p className="mt-2 text-sm text-white/70">
          Akwa, Douala — open Monday to Saturday, 8:00 AM – 6:30 PM
        </p>
        <Link href="/contact" className="btn-primary mt-5">
          Get Directions
        </Link>
      </div>
    </div>
  );
}
