
class GraphSet {
    constructor(svg, dataSet) {
        let pxX = +svg.attr("width") - margin;
        let pxY = +svg.attr("height") - margin;

        this.dataSet = dataSet
        // this.year = "2021"

        // let scX = makeTimeScale(data, d => d.date, [margin, pxX]);
        // let scY = d3.scaleLinear().domain([0, 1]).range([pxY, margin]).nice()
        // svg.selectAll("g").data(zones).enter()
        //     .call(new Graph, zones.forEach(zone=> this.dataMapper(zone)), pxX, Math.floor(pxY/zones.length))
        this.subGraphs = {}
        zones.forEach((zone, i) => {
            let height = Math.floor(pxY/zones.length)
            let g = svg.append("g").attr("width", pxX).attr("height", height).classed(zone, true)
                .attr("transform", `translate(0,${height * i})`)
            this.subGraphs[zone] = new Graph(g, this.dataMapper(zone), "green")
        })
    }
    dataMapper(zone) {
        return this.dataSet.map(data => {
            return {
                date: data.date,
                value: data[zone]
            }
        })
    }
    // get url() {
    //     if (this.dataSet == "hydro")
    //         return `../data/${year}/hydro_reservoir.csv`
    //     else if (this.dataSet == "price")
    //         return `../data/${year}/elspot-prices_${year}_weekly_nok.csv`
    // }
    // changeYear(year) {
    //     this.year = year
    //     // redraw circles
    // }
    // get parser() {
    //     if (this.dataSet == "hydro")
    //         return getHydroData
    //     if (this.dataSet == "price")
    //         return getPriceData
    // }
}

class Graph {
    constructor(svg, data, color) {
        this.svg = svg
        this.color = color
        this.pxX = +svg.attr("width")
        this.pxY = +svg.attr("height") - margin
        this.updateData(data)

    }
    updateData(data) {
        this.data = data
        this.scX = Graph.makeTimeScale(data, d => d.date, [margin, this.pxX]);
        this.scY = d3.scaleLinear().domain([0, 1]).range([this.pxY, margin]).nice()
        this.svg.call(Graph.drawAxis, this)
        this.svg.call(Graph.drawCircles, this)
        this.svg.call(Graph.drawLines, this)
    }
    // The .call() way of calling does not pass allow this to exist, so functions may as well be static, as we pass in this explicitly as graph
    static drawAxis(svg, graph) {
        let xAxis = svg.selectAll("g.x").data([0])
        let yAxis = svg.selectAll("g.y").data([0])

        // Delete
        xAxis.exit().remove()
        yAxis.exit().remove()

        // Append
        xAxis.enter().append("g")
            .attr("class", "x")
            .call(d3.axisBottom(graph.scX).ticks(graph.data.length).tickFormat(d3.timeFormat("%V")))
            .attr("transform", "translate(0," + graph.pxY + ")")
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis.enter().append("g")
            .attr("class", "y")
            .call(d3.axisLeft(graph.scY))
            .attr("transform", "translate(" + margin + ",0)")

        xAxis.call(d3.axisBottom(graph.scX).ticks(graph.data.length).tickFormat(d3.timeFormat("%V")))
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis.call(d3.axisLeft(graph.scY))

        // Update
        xAxis
            .call(d3.axisBottom(graph.scX).ticks(graph.data.length).tickFormat(d3.timeFormat("%V")))
            .attr("transform", "translate(0," + graph.pxY + ")")
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis
            .call(d3.axisLeft(graph.scY))
            .attr("transform", "translate(" + margin + ",0)")

        xAxis.call(d3.axisBottom(graph.scX).ticks(graph.data.length).tickFormat(d3.timeFormat("%V")))
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis.call(d3.axisLeft(graph.scY))
        graph.xAxis = xAxis
        graph.yAxis = yAxis
    }
    static drawCircles(svg, graph) {
        let circles = svg.selectAll("circle").data(graph.data)

        // Delete
        circles.exit().remove()

        // Append
        circles.enter().append("circle")
            .attr("r", 3)
            .attr("cx", d => graph.scX(d.date))
            .attr("cy", d => graph.scY(d.value))

        // Update
        circles
            .attr("cx", d => graph.scX(d.date))
            .attr("cy", d => graph.scY(d.value))
        graph.circles = circles
    }
    static drawLines(svg, graph) {
        // Define lines
        let lnMkr = d3.line().curve(d3.curveNatural)
            .x(d => graph.scX(d.date)).y(d => graph.scY(d.value));
        let lines = svg.selectAll("path.lines").data(graph.data)

        // Remove excess lines
        lines.exit().remove()


        // Add new lines
        lines.enter().append("path")
            .attr("stroke", graph.color)
            .attr("fill", "none")
            .classed("lines", true)
            .attr("d", lnMkr(graph.data))

        // Update existing lines
        lines.attr("d", lnMkr(graph.data))
        graph.lines = lines
    }
    showLines(show) {
        show ? this.lines.attr("stroke", color) : this.lines.attr("stroke", "none")
    }
    showCircles(show) {
        show ? this.circles.attr("fill", color) : this.circles.attr("fill", "none")
    }

    static makeTimeScale(data, accessor, range) {
        return d3.scaleTime()
            .domain(d3.extent(data, accessor))
            .range(range).nice()
    }
}
async function createUpdateGraphs(graphSvg, dataSet, linkedData, classTag, circles, lines, handler) {

    let height = Math.floor(graphSvg.attr("height") / zones.length)

    let svg = graphSvg.selectAll("g.graph").data(zones)

    // Remove surplus (shouldn't happen)
    svg.exit().remove()

    // Add new (happens first call)
    if (svg.enter().size() > 0)
        svg.enter().append("g")
            .attr("class", "graph")
            .attr("height", height)
            .attr("width", graphSvg.attr("width"))
            .attr("transform", (d, i) => `translate(0,${height * i})`)
            .call(drawUpdateData, dataSet, d3.curveNatural, classTag, circles, lines)

    // Update existing graphs
    if (svg.size() > 0)
        svg.call(drawUpdateData, dataSet, d3.curveNatural, classTag, circles, lines)
    let mapRegions = d3.selectAll("g.map")
    let sc = d3.selectAll(svg._parents).attr("id") == "hydroGraphs" ? mapColorScale : altMapColorScale
    if (handler)
        updateLinkHandler(graphSvg, dataSet, linkedData, mapRegions, sc)
}

function drawUpdateData(svg, data, curve, classTag, circles, lines) {
    let pxX = +svg.attr("width") - margin;
    let pxY = +svg.attr("height") - margin;

    let scX = makeTimeScale(data, d => d.date, [margin, pxX]);
    let scY = d3.scaleLinear().domain([0, 1]).range([pxY, margin]).nice()
    // let circles = svg.selectAll(`g`).selectAll("circle").data(hydroData)
    svg.each(function (d) {
        let region = d
        // Circle logic
        if (circles) {
            let circles = d3.select(this).selectAll("circle." + classTag).data(data)
            // Remove excess circles
            circles.exit().remove()

            // Add new circles
            circles.enter().append("circle")
                .attr("r", 3)
                .attr("cx", d => scX(d.date))
                .attr("cy", d => scY(d[region]))
                .classed(classTag, true)
                .attr("fill", circleColors(classTag));

            // Update existing circles
            circles
                .attr("cx", d => scX(d.date))
                .attr("cy", d => scY(d[region]))
        }
        // Line Logic
        if (lines) {
            // Update lines
            let lnMkr = d3.line().curve(curve)
                .x(d => scX(d.date)).y(d => scY(d[region]));
            let lines = d3.select(this).selectAll("path." + classTag).data(region)

            // Remove excess lines
            lines.exit().remove()

            // Add new lines
            lines.enter().append("path")
                .attr("fill", "none")
                .attr("stroke", d => circleColors(classTag))
                .classed(classTag, true)
                .attr("d", lnMkr(data))

            // Update existing lines
            lines.attr("d", lnMkr(data))
        }
        // Axis logic
        {
            let xAxis = d3.select(this).selectAll("g.x").data([0])
            let yAxis = d3.select(this).selectAll("g.y").data([0])

            xAxis.enter().append("g")
                .attr("class", "x")
                .call(d3.axisBottom(scX).ticks(data.length).tickFormat(d3.timeFormat("%V")))
                .attr("transform", "translate(0," + pxY + ")")
                .selectAll("text")
                .attr("transform", "translate(0,10),rotate(-30)")
            yAxis.enter().append("g")
                .attr("class", "y")
                .call(d3.axisLeft(scY))
                .attr("transform", "translate(" + margin + ",0)")

            xAxis.call(d3.axisBottom(scX).ticks(data.length).tickFormat(d3.timeFormat("%V")))
                .selectAll("text")
                .attr("transform", "translate(0,10),rotate(-30)")
            yAxis.call(d3.axisLeft(scY))

        }
    })
}

