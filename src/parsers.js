function hydroParse(d) {
    let year = "20" + d.date.slice(-2)
    let weekNumber = +d.date.slice(0, 2) + 1

    return {
        date:
            getDateOfISOWeek(weekNumber, year),
        NO: d.NO,
        NO1: d.NO1,
        NO2: d.NO2,
        NO3: d.NO3,
        NO4: d.NO4,
        NO5: d.NO5
    }
}
function nHydroParse(d) {

    return {
        date:
            getDateOfISOWeek(d.Week, d.Year),
        NO: d.NORGE.replace(",","."),
        NO1: d.NO1.replace(",","."),
        NO2: d.NO2.replace(",","."),
        NO3: d.NO3.replace(",","."),
        NO4: d.NO4.replace(",","."),
        NO5: d.NO5.replace(",","."),
    }
}
function capacityParse(d) {
    return {
        region: d["name"],
        capacity: d["capacity_twh"] * 1000,
    }
}
function elspotPriceParse(d) {
    let year = "20" + d.date.slice(-2)
    let weekNumber = +d.date.slice(0, 2) + 1

    return {
        date:
            getDateOfISOWeek(weekNumber, year),
        NO1: +d["Oslo"].replace(",",".") / 1000.0,
        NO2: +d["Kr.sand"].replace(",",".") / 1000.0,
        NO3: +d["Tr.heim"].replace(",",".") / 1000.0,
        NO4: +d["Tromsø"].replace(",",".") / 1000.0,
        NO5: +d["Bergen"].replace(",",".") / 1000.0,
    }
}

function minMaxParser(d) {
    let result = []
    for (let i = 0; i < 54; i++ ){
        result[i] = {}
    }
    d.forEach(d=> {
        let i = d.omrnr > 0 ? d.omrnr : ""
        result[d.iso_uke][`${d.omrType}${i}`] = {
            min : d.minFyllingsgrad,
            max : d.maxFyllingsgrad,
            median : d.medianFyllingsGrad
        }
    })
    return result
}

async function getHydroData(year) {
    return d3.csv(`../data/${year}/hydro_reservoir.csv`, nHydroParse)
    // let capacityData = d3.csv("../data/reservoir_capacity.csv", capacityParse)
    // // let h = await capacityData
    // return Promise.all([hydroData, capacityData]).then(data => {
    //     return data[0].map(d => {
    //         console.log(d)
    //         d.NO = d.NO / data[1].filter(d => d["region"] == "NO")[0].capacity
    //         d.NO1 = d.NO1 / data[1].filter(d => d["region"] == "NO1")[0].capacity
    //         d.NO2 = d.NO2 / data[1].filter(d => d["region"] == "NO2")[0].capacity
    //         d.NO3 = d.NO3 / data[1].filter(d => d["region"] == "NO3")[0].capacity
    //         d.NO4 = d.NO4 / data[1].filter(d => d["region"] == "NO4")[0].capacity
    //         d.NO5 = d.NO5 / data[1].filter(d => d["region"] == "NO5")[0].capacity
    //         return d
    //     })
    // })
}

async function getPriceData(year) {
    return d3.csv(`../data/${year}/elspot-prices_${year}_weekly_nok.csv`, elspotPriceParse)
}

async function getMinMaxData() {
    let d = d3.json("../data/min_max_median.json").then(minMaxParser)
    console.log("huh")
    return d
}
