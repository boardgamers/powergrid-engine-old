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

type UsLink = {nodes: [UsCity, UsCity], cost: number};

const links: UsLink[] = [
  // Purple
  {nodes: ["seattle", "portland"], cost: 3},
  {nodes: ["seattle", "billings"], cost: 9},
  {nodes: ["seattle", "boise"], cost: 12},
  {nodes: ["portland", "boise"], cost: 13},
  {nodes: ["billings", "boise"], cost: 12},
  {nodes: ["cheyenne", "boise"], cost: 24},
  {nodes: ["cheyenne", "billings"], cost: 9},
  {nodes: ["cheyenne", "denver"], cost: 0},
  {nodes: ["cheyenne", "omaha"], cost: 14},
  // Blue
  {nodes: ["san francisco", "salt lake city"], cost: 27},
  {nodes: ["san francisco", "las vegas"], cost: 14},
  {nodes: ["san francisco", "los angeles"], cost: 9},
  {nodes: ["san diego", "los angeles"], cost: 3},
  {nodes: ["san diego", "las vegas"], cost: 9},
  {nodes: ["san diego", "phoenix"], cost: 14},
  {nodes: ["las vegas", "phoenix"], cost: 15},
  {nodes: ["las vegas", "salt lake city"], cost: 18},
  {nodes: ["las vegas", "santa fe"], cost: 27},
  {nodes: ["las vegas", "los angeles"], cost: 9},
  {nodes: ["phoenix", "santa fe"], cost: 18},
  {nodes: ["santa fe", "salt lake city"], cost: 28},
  // RED
  {nodes: ["kansas city", "oklahoma city"], cost: 8},
  {nodes: ["kansas city", "memphis"], cost: 12},
  {nodes: ["oklahoma city", "memphis"], cost: 14},
  {nodes: ["oklahoma city", "dallas"], cost: 3},
  {nodes: ["memphis", "dallas"], cost: 12},
  {nodes: ["memphis", "new orleans"], cost: 7},
  {nodes: ["new orleans", "dallas"], cost: 12},
  {nodes: ["houston", "dallas"], cost: 5},
  {nodes: ["houston", "new orleans"], cost: 8},
  {nodes: ["birmingham", "new orleans"], cost: 11},
  {nodes: ["birmingham", "memphis"], cost: 6},
  // GREEN
  {nodes: ["atlanta", "raleigh"], cost: 7},
  {nodes: ["atlanta", "savannah"], cost: 7},
  {nodes: ["raleigh", "savannah"], cost: 7},
  {nodes: ["raleigh", "norfolk"], cost: 3},
  {nodes: ["savannah", "jacksonville"], cost: 0},
  {nodes: ["tampa", "jacksonville"], cost: 4},
  {nodes: ["tampa", "miami"], cost: 4},
  // YELLOW
  {nodes: ["fargo", "duluth"], cost: 6},
  {nodes: ["fargo", "minneapolis"], cost: 6},
  {nodes: ["minneapolis", "duluth"], cost: 5},
  {nodes: ["chicago", "minneapolis"], cost: 8},
  {nodes: ["chicago", "duluth"], cost: 12},
  {nodes: ["chicago", "cincinnati"], cost: 7},
  {nodes: ["knoxville", "cincinnati"], cost: 5},
  {nodes: ["st. louis", "cincinnati"], cost: 12},
  {nodes: ["chicago", "st. louis"], cost: 10},
  // BROWN
  {nodes: ["detroit", "buffalo"], cost: 7},
  {nodes: ["pittsburgh", "detroit"], cost: 6},
  {nodes: ["buffalo", "pittsburgh"], cost: 7},
  {nodes: ["buffalo", "new york"], cost: 8},
  {nodes: ["boston", "new york"], cost: 3},
  {nodes: ["philadelphia", "new york"], cost: 0},
  {nodes: ["new york", "boston"], cost: 3},
  {nodes: ["washington d.c.", "philadelphia"], cost: 3},
  {nodes: ["washington d.c.", "pittsburgh"], cost: 6},
  // PURPLE - BLUE
  {nodes: ["portland", "san francisco"], cost: 24},
  {nodes: ["boise", "san francisco"], cost: 23},
  {nodes: ["salt lake city", "boise"], cost: 8},
  {nodes: ["denver", "salt lake city"], cost: 21},
  {nodes: ["denver", "santa fe"], cost: 13},
  // PURPLE - RED
  {nodes: ["denver", "kansas city"], cost: 16},
  {nodes: ["omaha", "kansas city"], cost: 5},
  // PURPLE - YELLOW
  {nodes: ["cheyenne", "minneapolis"], cost: 18},
  {nodes: ["minneapolis", "billings"], cost: 18},
  {nodes: ["minneapolis", "omaha"], cost: 8},
  {nodes: ["fargo", "billings"], cost: 17},
  {nodes: ["omaha", "chicago"], cost: 13},
  // BLUE - RED
  {nodes: ["santa fe", "kansas city"], cost: 16},
  {nodes: ["santa fe", "oklahoma city"], cost: 15},
  {nodes: ["santa fe", "dallas"], cost: 16},
  {nodes: ["santa fe", "houston"], cost: 21},
  // RED - YELLOW
  {nodes: ["kansas city", "chicago"], cost: 8},
  {nodes: ["kansas city", "st. louis"], cost: 6},
  {nodes: ["memphis", "st. louis"], cost: 7},
  // RED - GREEN
  {nodes: ["birmingham", "atlanta"], cost: 3},
  {nodes: ["birmingham", "jacksonville"], cost: 9},
  {nodes: ["new orleans", "jacksonville"], cost: 16},
  // GREEN - YELLOW
  {nodes: ["st. louis", "atlanta"], cost: 12},
  {nodes: ["atlanta", "knoxville"], cost: 5},
  {nodes: ["cincinnati", "raleigh"], cost: 15},
  // GREEN - BROWN
  {nodes: ["pittsburgh", "raleigh"], cost: 7},
  {nodes: ["washington d.c.", "norfolk"], cost: 5},
  // BROWN - YELLOW
  {nodes: ["detroit", "cincinnati"], cost: 4},
  {nodes: ["detroit", "chicago"], cost: 7},
  {nodes: ["detroit", "duluth"], cost: 15},
  {nodes: ["pittsburgh", "cincinnati"], cost: 4}
]

const map = {
  zones,
  links
}

export default map;