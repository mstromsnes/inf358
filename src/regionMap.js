class RegionMap {
    constructor(svg) {
        this.defs = svg.append("defs")
        RegionMap.defineArrow(this.defs)
        RegionMap.defineGradient(this.defs)
        this.svg = svg
        this.pxX = +this.svg.attr("width")
        this.pxY = +this.svg.attr("height")
        this.path = d3.geoPath().projection(this.makeProjection())

        let url = "../config/norge.geojson"

        this.appendColorMap()

        d3.json(url).then(function (regionGeoJson) {
            this.regions = drawRegions(regionGeoJson, this.path)
            this.appendArrows(svg)
            console.log(this.flowElements)
        }.bind(this));
        function drawRegions(regionGeoJson, path) {

            // Draw the map
            let g = svg.selectAll("path").data(regionGeoJson.features).enter()
                .append("g").attr("class", d => d.properties.name)
            g.append("path")
                .attr("d", path)
                .attr("fill", "red")
                .style("stroke", "visible")
            g.call(labelRegions, path)
            return g
        }

        function labelRegions(g, path) {
            function textPosition(d) {
                let feature = d.properties.name
                if (feature != "NO4")
                    return path.centroid(d)
                else {
                    return [path.centroid(d)[0] + 60, path.centroid(d)[1] - 30]
                }
            }
            g.append("text")
                .text(d => d.properties.name)
                .attr("x", d => textPosition(d)[0])
                .attr("y", d => textPosition(d)[1])
                .classed("name", true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
            g.append("text")
                .text("2")
                .attr("x", d => textPosition(d)[0])
                .attr("y", d => textPosition(d)[1] + 14 + 6)
                .classed("price", true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
            return g
        }
    }
    static defineArrow(defs) {
        defs.append("svg").attr("width", "40").attr("height", "20").attr("id", "westArrow").attr("viewBox", "0 0 902.25049 364.71875")
            .append("polygon")
            .attr("points", "902.25049,222.98633 233.17773,222.98633 233.17773,364.71875 0,182.35938 233.17773,0 233.17773,141.73242 902.25049,141.73242 902.25049,222.98633 ")
            .attr("id", "eastArrow")
            .attr("fill", "green")
            .attr("stroke", "black")
    }
    static defineGradient(defs) {
        let gradient = defs.append("linearGradient").attr("id", "colorMap")
            .attr("x2", "0%")
            .attr("y1", "100%")
        let start = gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", mapColorScale(0))
        let stop = gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", mapColorScale(1))
    }
    appendArrows(svg) {
        this.flowElements = {
            "2021": [],
            "2020": [],
            "2019": [],
            "2018": [],
            "2017": [],
            "2016": [],
            "2015": [],
            "2014": [],
            "2013": [],
        }
        let g = svg.append("g").classed("flow", true)
        regionBorder.forEach(function (region, i) {
            let neighbourElements = []
            region.forEach((location, j) => {
                let neighbour = regionAdjacency["2021"][expandedZones["2021"][i]][j]
                let [x, y, a] = location
                let width = 40
                let height = 20
                let arrow = g.append("use")
                    .attr("href", "#westArrow")
                    .attr("x", x).attr("y", y)
                    .attr("transform", `translate(${width / 2},${height / 2}) translate(${x},${y}) rotate(${a}) translate(${-x},${-y}) translate(${-width / 2},${-height / 2})`)
                    .classed(`${region}${neighbour}`, true)
                let label = appendLabel(g, region, neighbour, i, j)
                neighbourElements[j] = [arrow, label]
            })
            this.addFlowElements(neighbourElements, i)
        }.bind(this))
        function appendLabel(g, region, neighbour, i, j) {
            let [x, y] = regionLabels[i][j]
            return g.append("text")
                .attr("x", x).attr("y", y)
                .classed(`${region}${neighbour}`, true)
                .attr("fill", "white").text("593")

        }
    }
    addFlowElements(neighbours, i) {
        years.forEach(year => {
            let zone = expandedZones["2021"][i]
            let index = expandedZones[year].findIndex(d=> d === zone)
            this.flowElements[year][index] = neighbours
        })
    }
    appendColorMap() {
        this.svg.append("rect").attr("x", "800").attr("y", "660").attr("width", "60").attr("height", "200").attr("fill", "url(#colorMap)")
    }
    makeProjection() {
        let scale = 2000 * Math.min(this.pxX / 1200, this.pxY / 1200)
        let center = [35, 56.8]
        let location = [this.pxX, this.pxY]
        return d3.geoMercator().center(center).scale(scale).translate(location)
    }
    mapRegionPath(region) {
        return this.svg.select(`g.${region}`)
    }
    mapRegions() {
        return this.svg.selectAll(`g`)
    }
    updateRegionColor(region, color) {
        let g = this.regions.filter(`g.${region}`)
        g.selectAll("path").attr("fill", color)
    }
    updateRegionLabel(region, text) {
        let g = this.regions.filter(`g.${region}`)
        g.selectAll("text.price").text(text)

    }
    // Dataset is the full array for that regions exports
    updateFlowLabels(week, year) {
        this.hideFlow()
        this.dataSet[week - 1].forEach((region, i) => {
            region.forEach(function (flow, j) {
                try {
                    let [arrow, label] = this.flowElements[year][i][j]
                    if (flow < 0) {
                        arrow.attr("visibility", "visible")
                        label.attr("visibility", "visible").text(-Math.floor(flow / 1000))
                    }
                } catch (e) {
                    console.log(e)
                }
            }.bind(this))
        })

    }
    hideFlow() {
        this.flowElements["2021"].forEach(d => {
            d.forEach(h=> {
                let [arrow, label] = h
                arrow.attr("visibility", "hidden")
                label.attr("visibility", "hidden")
            })
        })
    }
    updateFlowData(dataSet) {
        this.dataSet = dataSet
    }


}
