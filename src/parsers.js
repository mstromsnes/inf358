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
    let day = +(d.Date.slice(0,2))
    let month = +(d.Date.slice(3,5))-1
    let year = +(d.Date.slice(6,10))
    let date = new Date()
    date.setFullYear(year, month, day)
    let hour = +(d.Hours.slice(5,7)) - 1
    date.setHours(hour, 0, 0, 0)
    let week = date.getWeek()

    // Don't use the final week of the last year
    if (week === 53 && month === 0)
        return this

    // Sum imports and exports
    let NO1 = [
        d["NO2 > NO1"].replace(",",".") - d["NO1 > NO2"].replace(",","."),
        d["NO3 > NO1"].replace(",",".") - d["NO1 > NO3"].replace(",","."),
        d["NO5 > NO1"].replace(",",".") - d["NO1 > NO5"].replace(",","."),
        d["SE3 > NO1"].replace(",",".") - d["NO1 > SE3"].replace(",","."),
    ]
    let NO2 = [
        d["NO1 > NO2"].replace(",",".") - d["NO2 > NO1"].replace(",","."),
        d["NO5 > NO2"].replace(",",".") - d["NO2 > NO5"].replace(",","."),
        d["NL > NO2"].replace(",",".") - d["NO2 > NL"].replace(",","."),
        d["DK1 > NO2"].replace(",",".") - d["NO2 > DK1"].replace(",","."),
        d["DE > NO2"].replace(",",".") - d["NO2 > DE"].replace(",","."),
    ]
    let NO3 = [
        d["NO1 > NO3"].replace(",",".") - d["NO3 > NO1"].replace(",","."),
        d["NO4 > NO3"].replace(",",".") - d["NO3 > NO4"].replace(",","."),
        d["NO5 > NO3"].replace(",",".") - d["NO3 > NO5"].replace(",","."),
        d["SE2 > NO3"].replace(",",".") - d["NO3 > SE2"].replace(",","."),
    ]
    let NO4 = [
        d["NO3 > NO4"].replace(",",".") - d["NO4 > NO3"].replace(",","."),
        d["SE1 > NO4"].replace(",",".") - d["NO4 > SE1"].replace(",","."),
        d["SE2 > NO4"].replace(",",".") - d["NO4 > SE2"].replace(",","."),
    ]
    let NO5 = [
        d["NO1 > NO5"].replace(",",".") - d["NO5 > NO1"].replace(",","."),
        d["NO2 > NO5"].replace(",",".") - d["NO5 > NO2"].replace(",","."),
        d["NO3 > NO5"].replace(",",".") - d["NO5 > NO3"].replace(",","."),
    ]
    let NL = [
        d["NO2 > NL"].replace(",",".") - d["NL > NO2"].replace(",","."),
    ]
    let DK1 = [
        d["NO2 > DK1"].replace(",",".") - d["DK1 > NO2"].replace(",","."),
    ]
    let DE = [
        d["NO2 > DE"].replace(",",".") - d["DE > NO2"].replace(",","."),
    ]
    let SE1 = [
        d["NO4 > SE1"].replace(",",".") - d["SE1 > NO4"].replace(",","."),
    ]
    let SE2 = [
        d["NO3 > SE2"].replace(",",".") - d["SE2 > NO3"].replace(",","."),
        d["NO4 > SE2"].replace(",",".") - d["SE2 > NO4"].replace(",","."),
    ]
    let SE3 = [
        d["NO1 > SE3"].replace(",",".") - d["SE3 > NO1"].replace(",","."),
    ]
    let flow = new Flow(date, NO1, NO2, NO3, NO4, NO5, NL, DK1, DE, SE1, SE2, SE3)
    if (this[week-1] === undefined) {
        this[week-1] = flow
    } else {
        this[week-1].add(flow)
    }
    return this
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
    constructor(date, NO1, NO2, NO3, NO4, NO5, NL, DK1, DE, SE1, SE2, SE3){
        this.date = date
        this.NO1 = NO1
        this.NO2 = NO2
        this.NO3 = NO3
        this.NO4 = NO4
        this.NO5 = NO5
        this.NL = NL
        this.DK1 = DK1
        this.DE = DE
        this.SE1 = SE1
        this.SE2 = SE2
        this.SE3 = SE3
        this.week = date.getWeek()

    }
    add(rhs) {
        expandedZones.forEach(region => {
            this[region].forEach(function (value, index) {
                this[region][index] += rhs[region][index]
            }.bind(this))
        })
    }
    forEach(callBack) {
        expandedZones.forEach((region, index, object) => {
            callBack(this[region], index, this)
        })

    }
}
