"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeCity = searchParams.get("city") ?? "Todas";
  const search = searchParams.get("q") ?? "";

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "Todas") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          placeholder="Pesquisar eventos, concertos, rodeios..."
          defaultValue={search}
          onChange={(e) => {
            const value = e.target.value;
            clearTimeout(
              (window as unknown as { _searchTimeout?: ReturnType<typeof setTimeout> })
                ._searchTimeout
            );
            (window as unknown as { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout =
              setTimeout(() => updateParams({ q: value }), 300);
          }}
          className="w-full rounded-xl border border-white/5 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Cidade
        </p>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => updateParams({ city })}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                (city === "Todas" && !searchParams.get("city")) ||
                  activeCity === city
                  ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Categoria
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams({ category: "" })}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              !activeCategory
                ? "bg-brand-red text-white shadow-md shadow-brand-red/20"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            )}
          >
            Todas
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => updateParams({ category })}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                activeCategory === category
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}