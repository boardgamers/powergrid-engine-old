type UsCity = "seattle" | "portland" | "boise" | "billings" | "cheyenne" | "denver" | "omaha" | "fargo" | "duluth" | "minneapolis" | "chicago" | "cincinnati" | "st. louis" | "knoxville" | "kansas city" | "oklahoma city" | "dallas" | "memphis" | "houston" | "new orleans" | "birmingham" | "norfolk" | "raleigh" | "savannah" | "atlanta" | "jacksonville" | "tampa" | "miami" | "detroit" | "buffalo" | "new york" | "boston" | "philadelphia" | "washington d.c." | "pittsburgh" | "san francisco" | "salt lake city" | "las vegas" | "santa fe" | "phoenix" | "san diego" | "los angeles";

type UsZone = "purple" | "yellow" | "red" | "green" | "brown" | "blue";
type UsZoneInfo = Array<{key: UsZone, cities: UsCity[]}>;

const zones: UsZoneInfo = [{
  key: "purple",
  cities: ["seattle", "portland", "boise", "billings", "cheyenne", "denver", "omaha"]
}, {
  key: "yellow",
  cities: ["fargo", "duluth", "minneapolis", "chicago", "cincinnati", "st. louis", "knoxville"]
}, {
  key: "red",
  cities: ["kansas city", "oklahoma city", "dallas", "memphis", "houston", "new orleans", "birmingham"]
}, {
  key: "green",
  cities: ["norfolk", "raleigh", "savannah", "atlanta", "jacksonville", "tampa", "miami"]
}, {
  key: "brown",
  cities: ["detroit", "buffalo", "new york", "boston", "philadelphia", "washington d.c.", "pittsburgh"]
}, {
  key: "blue",
  cities: ["san francisco", "salt lake city", "las vegas", "santa fe", "phoenix", "san diego", "los angeles"]
}];

type UsLink = {cities: UsCity[], cost: number};

const links: UsLink[] = [
  // Purple
  {cities: ["seattle", "portland"], cost: 3},
  {cities: ["seattle", "billings"], cost: 9},
  {cities: ["seattle", "boise"], cost: 12},
  {cities: ["portland", "boise"], cost: 13},
  {cities: ["billings", "boise"], cost: 12},
  {cities: ["cheyenne", "boise"], cost: 24},
  {cities: ["cheyenne", "billings"], cost: 9},
  {cities: ["cheyenne", "denver"], cost: 0},
  {cities: ["cheyenne", "omaha"], cost: 14},
  // Blue
  {cities: ["san francisco", "salt lake city"], cost: 27},
  {cities: ["san francisco", "las vegas"], cost: 14},
  {cities: ["san francisco", "los angeles"], cost: 9},
  {cities: ["san diego", "los angeles"], cost: 3},
  {cities: ["san diego", "las vegas"], cost: 9},
  {cities: ["san diego", "phoenix"], cost: 14},
  {cities: ["las vegas", "phoenix"], cost: 15},
  {cities: ["las vegas", "salt lake city"], cost: 18},
  {cities: ["las vegas", "santa fe"], cost: 27},
  {cities: ["las vegas", "los angeles"], cost: 9},
  {cities: ["phoenix", "santa fe"], cost: 18},
  {cities: ["santa fe", "salt lake city"], cost: 28},
  // RED
  {cities: ["kansas city", "oklahoma city"], cost: 8},
  {cities: ["kansas city", "memphis"], cost: 12},
  {cities: ["oklahoma city", "memphis"], cost: 14},
  {cities: ["oklahoma city", "dallas"], cost: 3},
  {cities: ["memphis", "dallas"], cost: 12},
  {cities: ["memphis", "new orleans"], cost: 7},
  {cities: ["new orleans", "dallas"], cost: 12},
  {cities: ["houston", "dallas"], cost: 5},
  {cities: ["houston", "new orleans"], cost: 8},
  {cities: ["birmingham", "new orleans"], cost: 11},
  {cities: ["birmingham", "memphis"], cost: 6},
  // GREEN
  {cities: ["atlanta", "raleigh"], cost: 7},
  {cities: ["atlanta", "savannah"], cost: 7},
  {cities: ["raleigh", "savannah"], cost: 7},
  {cities: ["raleigh", "norfolk"], cost: 3},
  {cities: ["savannah", "jacksonville"], cost: 0},
  {cities: ["tampa", "jacksonville"], cost: 4},
  {cities: ["tampa", "miami"], cost: 4},
  // YELLOW
  {cities: ["fargo", "duluth"], cost: 6},
  {cities: ["fargo", "minneapolis"], cost: 6},
  {cities: ["minneapolis", "duluth"], cost: 5},
  {cities: ["chicago", "minneapolis"], cost: 8},
  {cities: ["chicago", "duluth"], cost: 12},
  {cities: ["chicago", "cincinnati"], cost: 7},
  {cities: ["knoxville", "cincinnati"], cost: 5},
  {cities: ["st. louis", "cincinnati"], cost: 12},
  {cities: ["chicago", "st. louis"], cost: 10},
  // BROWN
  {cities: ["detroit", "buffalo"], cost: 7},
  {cities: ["pittsburgh", "detroit"], cost: 6},
  {cities: ["buffalo", "pittsburgh"], cost: 7},
  {cities: ["buffalo", "new york"], cost: 8},
  {cities: ["boston", "new york"], cost: 3},
  {cities: ["philadelphia", "new york"], cost: 0},
  {cities: ["new york", "boston"], cost: 3},
  {cities: ["washington d.c.", "philadelphia"], cost: 3},
  {cities: ["washington d.c.", "pittsburgh"], cost: 6},
  // PURPLE - BLUE
  {cities: ["portland", "san francisco"], cost: 24},
  {cities: ["boise", "san francisco"], cost: 23},
  {cities: ["salt lake city", "boise"], cost: 8},
  {cities: ["denver", "salt lake city"], cost: 21},
  {cities: ["denver", "santa fe"], cost: 13},
  // PURPLE - RED
  {cities: ["denver", "kansas city"], cost: 16},
  {cities: ["omaha", "kansas city"], cost: 5},
  // PURPLE - YELLOW
  {cities: ["cheyenne", "minneapolis"], cost: 18},
  {cities: ["minneapolis", "billings"], cost: 18},
  {cities: ["minneapolis", "omaha"], cost: 8},
  {cities: ["fargo", "billings"], cost: 17},
  {cities: ["omaha", "chicago"], cost: 13},
  // BLUE - RED
  {cities: ["santa fe", "kansas city"], cost: 16},
  {cities: ["santa fe", "oklahoma city"], cost: 15},
  {cities: ["santa fe", "dallas"], cost: 16},
  {cities: ["santa fe", "houston"], cost: 21},
  // RED - YELLOW
  {cities: ["kansas city", "chicago"], cost: 8},
  {cities: ["kansas city", "st. louis"], cost: 6},
  {cities: ["memphis", "st. louis"], cost: 7},
  // RED - GREEN
  {cities: ["birmingham", "atlanta"], cost: 3},
  {cities: ["birmingham", "jacksonville"], cost: 9},
  {cities: ["new orleans", "jacksonville"], cost: 16},
  // GREEN - YELLOW
  {cities: ["st. louis", "atlanta"], cost: 12},
  {cities: ["atlanta", "knoxville"], cost: 5},
  {cities: ["cincinnati", "raleigh"], cost: 15},
  // GREEN - BROWN
  {cities: ["pittsburgh", "raleigh"], cost: 7},
  {cities: ["washington d.c.", "norfolk"], cost: 5},
  // BROWN - YELLOW
  {cities: ["detroit", "cincinnati"], cost: 4},
  {cities: ["detroit", "chicago"], cost: 7},
  {cities: ["detroit", "duluth"], cost: 15},
  {cities: ["pittsburgh", "cincinnati"], cost: 4}
]

const map = {
  zones,
  links
}

export default map;