function hydroParse(d) {
    let year = "20" + d.date.slice(-2)
    let weekNumber = +d.date.slice(0, 2)+1

    return {
        date: [
            getDateOfISOWeek(weekNumber, year),
            d.date
        ],
        NO: d.NO,
        NO1: d.NO1,
        NO2: d.NO2,
        NO3: d.NO3,
        NO4: d.NO4,
        NO5: d.NO5,
    }
}
function capacityParse(d) {
    return {
        region: d["name"],
        capacity: d["capacity_twh"] * 1000,
    }
}

async function getHydroData() {
    let hydroData = d3.csv("../data/hydro_reservoir.csv", hydroParse)
    let capacityData = d3.csv("../data/reservoir_capacity.csv", capacityParse)
    // let h = await capacityData
    return Promise.all([hydroData, capacityData]).then(data => {
        return data[0].map(d =>
          {
            // console.log(d)
            d.NO = d.NO / data[1].filter(d => d["region"] == "NO")[0].capacity
            d.NO1 = d.NO1 / data[1].filter(d => d["region"] == "NO1")[0].capacity
            d.NO2 = d.NO2 / data[1].filter(d => d["region"] == "NO2")[0].capacity
            d.NO3 = d.NO3 / data[1].filter(d => d["region"] == "NO3")[0].capacity
            d.NO4 = d.NO4 / data[1].filter(d => d["region"] == "NO4")[0].capacity
            d.NO5 = d.NO5 / data[1].filter(d => d["region"] == "NO5")[0].capacity
            return d
        })
    })
}
