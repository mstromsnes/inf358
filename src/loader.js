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
        this.fillDropDown()
        getHydroData(year).then(hydroGraph.updateData.bind(hydroGraph))
        getPriceData(year).then(priceGraph.updateData.bind(priceGraph))
        getMinMaxData().then(hydroGraph.drawMinMax.bind(hydroGraph))
    }
    fillDropDown() {
        let loader = this
        this.dropDown.selectAll("option").data(Loader.years).enter().append("option").text(d => d).attr("value", d => d)
        this.dropDown.on("change", function () {
            loader.year = d3.select(this).property("value")
            getHydroData(loader.year).then(loader.hydroGraph.updateData.bind(loader.hydroGraph))
            getPriceData(loader.year).then(loader.priceGraph.updateData.bind(loader.priceGraph))
        })
    }
}
