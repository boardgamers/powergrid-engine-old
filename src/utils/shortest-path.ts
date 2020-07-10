export default function shortestPath<T>(starts: T[], dests: T[], links: Map<T, Map<T, number>>, maxCost = Infinity): {path: T[]; cost: number} | undefined {
  const destSet: Set<T> = new Set(dests);
  const pathTo: Map<T, {path: T[]; cost: number}> = new Map();

  for (const start of starts) {
    pathTo.set(start, {path: [start], cost: 0});

    if (destSet.has(start)) {
      return {path: [start], cost: 0};
    }
  }

  let toExpand = starts;
  let toExpandNext: T[] = [];

  let minToDest = Infinity;
  let bestPath: {path: T[]; cost: number} | undefined = undefined;

  while (toExpand.length > 0) {
    for (const hex of toExpand) {
      const curPath = pathTo.get(hex)!;

      if (curPath.cost >= minToDest || curPath.cost > maxCost) {
        continue;
      }

      const hexLinks = links.get(hex);

      if (!hexLinks) {
        continue;
      }
      for (const [neighbour, cost] of hexLinks.entries()) {
        if (pathTo.has(neighbour) && pathTo.get(neighbour)!.cost <= curPath.cost + cost) {
          continue;
        }

        const extendedPath = {
          cost: curPath.cost + cost,
          path: [...curPath.path, neighbour]
        };

        pathTo.set(neighbour, extendedPath);
        toExpandNext.push(neighbour);

        if (destSet.has(neighbour) && extendedPath.cost < minToDest && extendedPath.cost <= maxCost) {
          minToDest = extendedPath.cost;
          bestPath = extendedPath;
        }
      }
    }

    toExpand = toExpandNext;
    toExpandNext = [];
  }

  return bestPath;
}
