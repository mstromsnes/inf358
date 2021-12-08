class Interactor {
    constructor(regionMap, hydroGraph, priceGraph, exportGraph) {
        this.regionMap = regionMap
        this.hydroGraph = hydroGraph
        this.priceGraph = priceGraph
        this.exportGraph = exportGraph
        this.installLinkHandler()
    }
    linkHandler(hotzone, graph) {
        hotzone
            .attr("cursor", "crosshair")
            .attr("x", margin.left).attr("y", margin.top)
            .attr("width", graph.pxX - margin.left - margin.right).attr("height", graph.pxY-margin.top)
            .attr("visibility", "hidden")
            .attr("pointer-events", "all")
            .on("mousemove", function (event) {
                if (this.mouseHeld) {
                    this.updateMap(d3.pointer(event), graph)
                }
            }.bind(this))
            .on("mousedown", function (event) {
                this.mouseHeld = true
                this.updateMap(d3.pointer(event), graph)
            }.bind(this))
            .on("mouseup", function () {
                this.mouseHeld = false
            }.bind(this))
            .on("mouseleave", function () {
                this.mouseHeld = false
            }.bind(this))
            .on("initialize", function () {
                let pt = [+hotzone.attr("width"), +hotzone.attr("height") / 2]
                this.updateMap(pt, graph)
            }.bind(this))
    }
    installLinkHandler() {
        this.mouseHeld = false
        this.hotzoneHydro = this.hydroGraph.svg.append("rect")
        this.hotzonePrice = this.priceGraph.svg.append("rect")
        this.hotzoneExport = this.exportGraph.svg.append("rect")

        this.hotzoneHydro.call(this.linkHandler.bind(this), this.hydroGraph)
        this.hotzonePrice.call(this.linkHandler.bind(this), this.priceGraph)
        this.hotzoneExport.call(this.linkHandler.bind(this), this.exportGraph)

    }
    updateMap(pt, graph) {
        let year = d3.select("#selectYear").data()[0]
        let minimum = 5000
        let circle = graph.svg.selectAll("circle").each((d, i, n) => {
            let sel = d3.select(n[i])
            let xDistance = Math.abs(sel.attr("cx") - pt[0])
            minimum = Math.min(minimum, xDistance)
        }).filter((d, i, n) =>
            Math.abs(d3.select(n[i]).attr("cx") - pt[0]) == minimum)
        let selectedWeek = circle.data()[0].week
        zones[year].forEach(zone => {
            let color, priceLabel
            try {
                color = mapColorScale(this.hydroGraph.subGraphs.get(zone).data.filter(d => d.week == selectedWeek)[0].value)
            } catch (e) {
                color = "grey"
            }
            this.regionMap.updateRegionColor(zone, color)

            try {
                priceLabel = this.priceGraph.subGraphs.get(zone).data.filter(d => d.week == selectedWeek)[0].value.toFixed(4)
            } catch (e) {
                priceLabel = "N/A"
            }
            this.regionMap.updateRegionLabel(zone, priceLabel)
        })
        this.regionMap.updateFlowLabels(selectedWeek, year)
        this.hydroGraph.drawVertical(selectedWeek)
        this.priceGraph.drawVertical(selectedWeek)
        this.exportGraph.drawVertical(selectedWeek)

    }
}
