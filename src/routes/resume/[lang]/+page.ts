export function load({ params }) {
  return import(`../../../lib/info-${params.lang}.json`);
}
