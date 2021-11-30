
const mapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["white", "blue"])
const altMapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["white", "green"])
const zones = [
    "NO1",
    "NO2",
    "NO3",
    "NO4",
    "NO5",
]
const circleColors = d3.scaleOrdinal().domain(["hydro", "price", "min", "max"]).range(["blue","green","red", "yellow"])
// const colors = [
//     "grey",
//     "white",
//     "red",
//     "blue",
//     "green"
// ]
// const circleColors = d3.scaleOrdinal().domain(zones).range(colors)

const margin = 40
