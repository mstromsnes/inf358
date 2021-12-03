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
    constructor(dropDown, relative, year, regionMap, hydroGraph, priceGraph, expGraph) {
        this.dropDown = dropDown
        this.year = year
        this.regionMap = regionMap
        this.hydroGraph = hydroGraph
        this.priceGraph = priceGraph
        this.expGraph = expGraph
        this.relative = relative
        this.relative.on("change", ()=>{this.updateHydro.bind(this)(this.year)})
        this.fillDropDown()
        // Load all data, then draw it.
        Promise.all([
            this.updateHydro(year),
            getPriceData(year).then(priceGraph.updateData.bind(priceGraph)),
            getFlowData(year).then(this.sendFlowData.bind(this)),
            this.regionMap.loadPromise  // The only data that gets loaded outside of here is on inital regionMap setup. This needs to happen before initialiseMap, so we await it here.
        ]).then(this.initalizeMap)
        this.dropDown.data([year])
    }
    fillDropDown() {
        let loader = this
        this.dropDown.selectAll("option").data(Loader.years).enter().append("option").text(d => d).attr("value", d => d)
        this.dropDown.on("change", function () {
            loader.year = d3.select(this).property("value")
            loader.dropDown.data([loader.year])
            Promise.all([
                loader.updateHydro.bind(loader)(loader.year),
                // Reload data for new year then draw it, then reset the map to last timestamp
                getPriceData(loader.year).then(loader.priceGraph.updateData.bind(loader.priceGraph)),
                getFlowData(loader.year).then(loader.sendFlowData.bind(loader)),
            ]).then(loader.initalizeMap)
        })
    }
    initalizeMap() {
        d3.selectAll("rect").dispatch("initialize")
    }
    sendFlowData(data) {
        this.regionMap.updateFlowData.bind(this.regionMap)(data)
        this.expGraph.updateData.bind(this.expGraph)(data.map(flow => flow.totalExport()))
    }
    drawHydro(data) {
        let relative = this.relative.property('checked')
        let [hydro, minMax] = data
        this.hydroGraph.updateData.bind(this.hydroGraph)(hydro)
        this.hydroGraph.drawMinMax.bind(this.hydroGraph)(minMax, relative)
    }
    updateHydro(year) {
        return Promise.all([
            getHydroData(year),
            getMinMaxData()
        ]).then(this.drawHydro.bind(this))
    }
}
