
const mapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["orange", "blue"])
const altMapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["white", "green"])
const zones = [
    "NO1",
    "NO2",
    "NO3",
    "NO4",
    "NO5",
]
const expandedZones = [
    "NO1",
    "NO2",
    "NO3",
    "NO4",
    "NO5",
    "NL",
    "DK1",
    "DE",
    "SE1",
    "SE2",
    "SE3",
]
const circleColors = d3.scaleOrdinal().domain(["hydro", "price", "min", "max"]).range(["blue", "green", "red", "yellow"])
// const colors = [
//     "grey",
//     "white",
//     "red",
//     "blue",
//     "green"
// ]
// const circleColors = d3.scaleOrdinal().domain(zones).range(colors)

const margin = 40

const regionAdjacency = {
    NO1: ["NO2", "NO3", "NO5", "SE3"],
    NO2: ["NO1", "NO5", "NL", "DK1", "DE"],
    NO3: ["NO1", "NO4", "NO5", "SE2"],
    NO4: ["NO3", "SE1", "SE2"],
    NO5: ["NO1", "NO2", "NO3"],
    NL: ["NO2"],
    DK1: ["NO2"],
    DE: ["NO2"],
    SE1: ["NO4"],
    SE2: ["NO3", "NO4"],
    SE3: ["NO1"]
}

const regionBorder = [
    [[210, 750, -45], [230, 605, 45], [195, 700, 0], [300, 700, 180]],
    [[210, 750, -45 + 180], [120, 720, 90], [120, 820, -70], [160, 840, -90], [210, 800, -120]],
    [[230, 605, 45 + 180], [300, 460, 110], [165, 645, -55], [290, 540, 180]],
    [[300, 460, 110 + 180], [390, 300, 180], [360, 370, 210]],
    [[195, 700, 0 + 180], [120, 720, 90 + 180], [165, 645, -55 + 180]],
    [[120, 820, -70 + 180]],
    [[160, 840, -90 + 180]],
    [[210, 800, -120 + 180]],
    [[390, 300, 180 + 180]],
    [[290, 540, 180 + 180], [360, 370, 210 + 180]],
    [[300, 700, 180 + 180]]
]

const regionLabels = [
    [[250, 760], [225, 630], [195, 695], [300, 695]],
    [[250, 760], [95, 730], [95, 830], [165, 885], [225, 845]],
    [[225, 630], [290, 470], [155, 645], [298, 537]],
    [[290, 470], [395, 297], [370, 365]],
    [[195, 695], [95, 730], [155, 645]],
    [[95, 830]],
    [[165, 885]],
    [[225, 845]],
    [[395, 297]],
    [[298, 537], [370, 365]],
    [[300, 695]]
]
