class RegionMap {
    constructor(svg) {
        this.svg = svg
        this.pxX = +this.svg.attr("width")
        this.pxY = +this.svg.attr("height")
        this.path = d3.geoPath().projection(this.makeProjection())

        let url = "../config/norge.geojson"

        d3.json(url).then(regionGeoJson => {
            this.regions = drawRegions(regionGeoJson, this.path)
        });
        function drawRegions(regionGeoJson, path) {

            // Draw the map
            let g = svg.selectAll("path").data(regionGeoJson.features).enter()
                .append("g").attr("class", d=>d.properties.name)
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
                // .classed(d=>d.properties.name, true)
                .classed("name", true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle")
            g.append("text")
                .text("2")
                .attr("x", d => textPosition(d)[0])
                .attr("y", d => textPosition(d)[1] + 14 + 6)
                // .classed(d=>d.properties.name, true)
                .classed("price", true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle");
            return g
        }
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


}
