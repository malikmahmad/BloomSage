import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const VALUES = [
  {
    title: "Ingredients you can read",
    body: "Every formula lists its actives in plain language on the front of the label, not buried in fine print on the back.",
    icon: "📋",
  },
  {
    title: "Small batches, tested properly",
    body: "We produce in small runs so nothing sits on a shelf for years before it reaches you.",
    icon: "⚗️",
  },
  {
    title: "No filler claims",
    body: "If a product doesn't do something, we don't say it does. Skincare marketing has enough of that already.",
    icon: "✓",
  },
];

const TEAM = [
  {
    name: "Dr. Amara Noor",
    role: "Formulation Chemist",
    bio: "12 years developing actives-first cosmetic formulations. Believes that most 10-step routines can be cut to three.",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
  },
  {
    name: "Sara Qureshi",
    role: "Dermatology Nurse",
    bio: "Works in clinical dermatology and tests every Bloomsage formula on the reactive-skin end of the spectrum before launch.",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
  },
  {
    name: "Hina Malik",
    role: "Operations & Logistics",
    bio: "Makes sure formulas that pass the lab also arrive intact, on time, and packaged the way they're supposed to be.",
    img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",
  },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-sage-50 py-16 sm:py-20">
        <div className="container-page max-w-2xl text-center">
          <Leaf size={28} className="mx-auto text-sage-600" />
          <h1 className="mt-4 font-display text-3xl font-semibold text-sage-900 sm:text-4xl">
            We started Bloomsage because most "clean" skincare wasn't.
          </h1>
          <p className="mt-4 text-ink/70">
            Bloomsage began as a small-batch project between a formulation chemist and a
            dermatology nurse who kept getting asked the same question by friends: "what should
            I actually be using?" A few years and a lot of iteration later, that question became
            a full catalog of cleansers, serums, and moisturizers built around ingredients that
            actually earn their place in the formula.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line">
        <div className="container-page grid grid-cols-2 gap-6 py-12 sm:grid-cols-4">
          {[
            { number: "16+", label: "Products" },
            { number: "6", label: "Categories" },
            { number: "100%", label: "Plant-based" },
            { number: "2021", label: "Founded" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-sage-700">{s.number}</p>
              <p className="mt-1 text-sm text-ink/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-sage-900">
          What we care about
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-xl border border-line bg-white p-6">
              <span className="text-2xl">{value.icon}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-sage-900">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-line bg-sage-50 py-16">
        <div className="container-page">
          <h2 className="text-center font-display text-2xl font-semibold text-sage-900">
            The team
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="overflow-hidden rounded-xl border border-line bg-white">
                <img
                  src={member.img}
                  alt={member.name}
                  className="aspect-[4/3] w-full object-cover object-top"
                />
                <div className="p-5">
                  <p className="font-display text-lg font-semibold text-sage-900">{member.name}</p>
                  <p className="font-mono text-xs uppercase tracking-wide text-sage-600">
                    {member.role}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line py-14">
        <div className="container-page max-w-xl text-center">
          <h2 className="font-display text-2xl font-semibold text-sage-900">
            Ready to find your routine?
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            Browse the full catalog — every product page lists exactly what's in it and why.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-sage-700 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-900"
          >
            Shop all products
          </Link>
        </div>
      </section>
    </div>
  );
}
