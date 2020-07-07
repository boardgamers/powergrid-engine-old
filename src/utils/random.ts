export function shuffle<T>(array: T[], rng: () => number) {
  const reverse = new Map<number, number>();

  array.forEach((item, i) => {
    let n = rng();

    while (reverse.has(n)) {
      n = rng();
    }

    reverse.set(n, i);
  });

  return [...reverse.keys()].sort().map(n => array[reverse.get(n)!]);
}