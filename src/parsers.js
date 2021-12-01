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
async function getHydroData(year) {
    return d3.csv(`../data/${year}/hydro_reservoir.csv`, hydroParse)
}

async function getPriceData(year) {
    return d3.csv(`../data/${year}/elspot-prices_${year}_weekly_nok.csv`, elspotPriceParse)
}

async function getMinMaxData() {
    return d3.json("../data/min_max_median.json").then(minMaxParser)
}
