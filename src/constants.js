
const mapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["orange", "blue"])
const altMapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["white", "green"])
const years = [
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
]
const zones = {
    "2021": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
    ],
    "2020": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
    ],
    "2019": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
    ],
    "2018": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
    ],
    "2017": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
    ],
    "2016": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
    ],
    "2015": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
    ],
    "2014": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
    ],
    "2013": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
    ],
}
const expandedZones = {
    "2021": [
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
    ],
    "2020": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
        "NL",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2019": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
        "NL",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2018": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2017": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2016": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "NO5",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2015": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2014": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
    "2013": [
        "NO1",
        "NO2",
        "NO3",
        "NO4",
        "DK1",
        "SE1",
        "SE2",
        "SE3",
    ],
}
const circleColors = d3.scaleOrdinal().domain(["hydro", "price", "min", "max"]).range(["blue", "green", "red", "yellow"])
// const colors = [
//     "grey",
//     "white",
//     "red",
//     "blue",
//     "green"
// ]
// const circleColors = d3.scaleOrdinal().domain(zones).range(colors)

const margin = { top: 40, bottom: 40, left: 50, right: 0 }

const regionAdjacency = {
    "2021": {
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
    },
    "2020": {
        NO1: ["NO2", "NO3", "NO5", "SE3"],
        NO2: ["NO1", "NO5", "NL", "DK1"],
        NO3: ["NO1", "NO4", "NO5", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        NO5: ["NO1", "NO2", "NO3"],
        NL: ["NO2"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2019": {
        NO1: ["NO2", "NO3", "NO5", "SE3"],
        NO2: ["NO1", "NO5", "NL", "DK1"],
        NO3: ["NO1", "NO4", "NO5", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        NO5: ["NO1", "NO2", "NO3"],
        NL: ["NO2"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2018": {
        NO1: ["NO2", "NO3", "NO5", "SE3"],
        NO2: ["NO1", "NO5", "DK1"],
        NO3: ["NO1", "NO4", "NO5", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        NO5: ["NO1", "NO2", "NO3"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2017": {
        NO1: ["NO2", "NO3", "NO5", "SE3"],
        NO2: ["NO1", "NO5", "DK1"],
        NO3: ["NO1", "NO4", "NO5", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        NO5: ["NO1", "NO2", "NO3"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2016": {
        NO1: ["NO2", "NO3", "NO5", "SE3"],
        NO2: ["NO1", "NO5", "DK1"],
        NO3: ["NO1", "NO4", "NO5", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        NO5: ["NO1", "NO2", "NO3"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2015": {
        NO1: ["NO2", "NO3", "SE3"],
        NO2: ["NO1", "DK1"],
        NO3: ["NO1", "NO4", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2014": {
        NO1: ["NO2", "NO3", "SE3"],
        NO2: ["NO1", "DK1"],
        NO3: ["NO1", "NO4", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
    "2013": {
        NO1: ["NO2", "NO3", "SE3"],
        NO2: ["NO1", "DK1"],
        NO3: ["NO1", "NO4", "SE2"],
        NO4: ["NO3", "SE1", "SE2"],
        DK1: ["NO2"],
        SE1: ["NO4"],
        SE2: ["NO3", "NO4"],
        SE3: ["NO1"]
    },
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
