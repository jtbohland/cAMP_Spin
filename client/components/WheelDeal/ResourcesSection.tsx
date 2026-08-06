import type { Product } from "@/lib/wheel-deal-data.js";

type ResourcesSectionProps = {
  product: Product;
};

export default function ResourcesSection({ product }: ResourcesSectionProps) {
  const resources = product.resources;

  return (
    <div className="mt-5 pt-4 border-t border-border">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span>📚</span> Resources for {product.name}
      </p>

      {!resources || resources.length === 0 ? (
        <div className="bg-muted/30 rounded-lg px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">No resources yet for {product.name}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <span className="mt-0.5 text-base shrink-0">🔗</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {r.label}
                </p>
                {r.description && (
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                    {r.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
