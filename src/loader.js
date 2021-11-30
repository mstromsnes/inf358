class Loader {
    static years = [
        2021,
        2020,
        2019,
        2018,
        2017,
        2016,
        2015,
        2014,
        2013
    ]
    constructor(dropDown, year, hydroGraph, priceGraph) {
        this.dropDown = dropDown
        this.year = year
        this.hydroGraph = hydroGraph
        this.priceGraph = priceGraph
        this.fillDropDown(year)
        getHydroData(year).then(hydroGraph.updateData.bind(hydroGraph))
        getPriceData(year).then(priceGraph.updateData.bind(priceGraph))
        getMinMaxData().then(hydroGraph.drawMinMax.bind(hydroGraph))
    }
    fillDropDown(year) {
        let loader = this
        this.dropDown.selectAll("option").data(Loader.years).enter().append("option").text(d => d).attr("value", d => d)
        this.dropDown.on("change", function () {
            loader.year = d3.select(this).property("value")
            getHydroData(loader.year).then(loader.hydroGraph.updateData.bind(loader.hydroGraph))
            getPriceData(loader.year).then(loader.priceGraph.updateData.bind(loader.priceGraph))
        })
    }
}

async function fillDropDown() {
    let dropDown = d3.select("#selectYear")
    dropDown.selectAll('myOptions').data(years).enter().append("option").text(d => d).attr("value", d => d)

    dropDown.on("change", async function () {
        let year = d3.select(this).property("value")
        let [hydroData, priceData, minMaxData] = await Promise.all([getHydroData(year), getPriceData(year), getMinMaxData(year)])
        createUpdateGraphs(d3.select("#hydroGraphs"), hydroData, priceData, "hydro", true, true, true)
        createUpdateGraphs(d3.select("#priceGraphs"), priceData, hydroData, "price", true, true, true)
        createUpdateGraphs(d3.select("#hydroGraphs"), minMaxData.min, priceData, "min", false, true, true)
        createUpdateGraphs(d3.select("#hydroGraphs"), minMaxData.max, priceData, "max", false, true, true)
    })
}
