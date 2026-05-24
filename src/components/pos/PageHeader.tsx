// Compact heading block reused by every POS page.
export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ocean">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p>
    </div>
  );
}
