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
    constructor(dropDown, year, regionMap, hydroGraph, priceGraph) {
        this.dropDown = dropDown
        this.year = year
        this.regionMap = regionMap
        this.hydroGraph = hydroGraph
        this.priceGraph = priceGraph
        this.fillDropDown()
        // Load all data, then draw it.
        Promise.all([
            getHydroData(year).then(hydroGraph.updateData.bind(hydroGraph)),
            getPriceData(year).then(priceGraph.updateData.bind(priceGraph)),
            getMinMaxData().then(hydroGraph.drawMinMax.bind(hydroGraph)),
            getFlowData(year).then(regionMap.updateFlowData.bind(regionMap)),
            this.regionMap.loadPromise  // The only data that gets loaded outside of here is on inital regionMap setup. This needs to happen before initialiseMap, so we await it here.
        ]).then(this.initalizeMap)
        this.dropDown.data([year])
        console.log(this.dropDown.data())
    }
    fillDropDown() {
        let loader = this
        this.dropDown.selectAll("option").data(Loader.years).enter().append("option").text(d => d).attr("value", d => d)
        this.dropDown.on("change", function () {
            loader.year = d3.select(this).property("value")
            loader.dropDown.data([loader.year])
            Promise.all([
                // Reload data for new year then draw it, then reset the map to last timestamp
                getHydroData(loader.year).then(loader.hydroGraph.updateData.bind(loader.hydroGraph)),
                getPriceData(loader.year).then(loader.priceGraph.updateData.bind(loader.priceGraph)),
                getFlowData(loader.year).then(loader.regionMap.updateFlowData.bind(loader.regionMap)),
            ]).then(loader.initalizeMap)
        })
    }
    initalizeMap(){
        d3.selectAll("rect").dispatch("initialize")
    }
}
