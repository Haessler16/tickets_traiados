export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate));
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
