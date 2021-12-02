function hydroParse(d) {

    return {
        week: d.Week,
        NO: d.NORGE.replace(",", "."),
        NO1: d.NO1.replace(",", "."),
        NO2: d.NO2.replace(",", "."),
        NO3: d.NO3.replace(",", "."),
        NO4: d.NO4.replace(",", "."),
        NO5: d.NO5.replace(",", "."),
    }
}
function capacityParse(d) {
    return {
        region: d["name"],
        capacity: d["capacity_twh"] * 1000,
    }
}
function elspotPriceParse(d) {
    let weekNumber = +d.date.slice(0, 2)

    return {
        week: weekNumber,
        NO1: +d["Oslo"].replace(",", ".") / 1000.0,
        NO2: +d["Kr.sand"].replace(",", ".") / 1000.0,
        NO3: +d["Tr.heim"].replace(",", ".") / 1000.0,
        NO4: +d["Tromsø"].replace(",", ".") / 1000.0,
        NO5: +d["Bergen"].replace(",", ".") / 1000.0,
    }
}

function minMaxParser(d) {
    let result = {
        min: [],
        max: [],
        median: []
    }
    d.forEach((d) => {
        let region = `${d.omrType}${d.omrnr}`
        if (!result.min[d.iso_uke - 1])
            result.min[d.iso_uke - 1] = {
                week: d.iso_uke
            }
        result.min[d.iso_uke - 1][region] = d.minFyllingsgrad
        if (!result.max[d.iso_uke - 1])
            result.max[d.iso_uke - 1] = {
                week: d.iso_uke
            }
        result.max[d.iso_uke - 1][region] = d.maxFyllingsgrad
        if (!result.median[d.iso_uke - 1])
            result.median[d.iso_uke - 1] = {
                week: d.iso_uke
            }
        result.median[d.iso_uke - 1][region] = d.medianFyllingsgrad
    })
    return result
}

function flowParse(d) {
    let day = +(d.Date.slice(0, 2))
    let month = +(d.Date.slice(3, 5)) - 1
    let year = +(d.Date.slice(6, 10))
    let date = new Date()
    date.setFullYear(year, month, day)
    let hour = +d.Hours.slice(0, 2)
    date.setHours(hour, 0, 0, 0)
    let week = date.getWeek()

    // Don't use the final week of the last year
    if ((week === 53 && month === 0) || year === 2012)
        return this

    let f = []
    // Sum imports and exports
    expandedZones[year].forEach((zone, i) => {
        let h = []
        neighbourStrings(zone, year).forEach((neighbour, j) => {
            let [imp, exp] = neighbour
            let value = d[imp].replace(",", ".") - d[exp].replace(",", ".")
            h[j] = value
        })
        f[i] = h
    })
    let flow = new Flow(date, f)
    if (this[week - 1] === undefined) {
        this[week - 1] = flow
    } else {
        this[week - 1].add(flow)
    }
    return this

    function neighbourStrings(zone, year) {
        let neighbours = regionAdjacency[year][zone]
        return neighbours.map(neighbour => {
            return [`${neighbour} > ${zone}`, `${zone} > ${neighbour}`]
        })

    }
}
async function getHydroData(year) {
    return d3.csv(`../data/${year}/hydro_reservoir.csv`, hydroParse)
}

async function getPriceData(year) {
    return d3.csv(`../data/${year}/elspot-prices_${year}_weekly_nok.csv`, elspotPriceParse)
}

async function getMinMaxData() {
    return d3.json("../data/min_max_median.json").then(minMaxParser)
}

async function getFlowData(year) {
    let reduction = []
    await d3.csv(`../data/${year}/elspot-flow-no_${year}_hourly.csv`, flowParse.bind(reduction))
    return reduction
}

class Flow {
    constructor(date, f) {
        this.date = date
        this.year = date.getFullYear()
        f.forEach((zone, i) => {
            this[expandedZones[this.year][i]] = zone
        })
        this.week = date.getWeek()

    }
    add(rhs) {
        expandedZones[this.year].forEach(region => {
            this[region].forEach(function (value, index) {
                this[region][index] += rhs[region][index]
            }.bind(this))
        })
    }
    forEach(callBack) {
        expandedZones[this.year].forEach((region, index, object) => {
            // console.log(index)
            callBack(this[region], index, this)
        })

    }
    totalExport() {
        let exp = 0
        zones[this.year].forEach(region => {
            this[region].forEach((value) => {
                exp += value
            })
        })
        return {
            week: this.week,
            value: exp/1000 // TWh
        }
    }
}
