class GraphSet {
    constructor(svg, color) {
        this.svg = svg
        this.pxX = +svg.attr("width") - margin;
        this.pxY = +svg.attr("height") - margin;

        this.subGraphs = new Map()
        zones.forEach((zone, i) => {
            let height = Math.floor(this.pxY / zones.length)
            let g = svg.append("g").attr("width", this.pxX).attr("height", height).classed(zone, true)
                .attr("transform", `translate(0,${height * i})`)
            this.subGraphs.set(zone, new Graph(g, color))
        })
    }
    dataMapper(zone, dataSet) {
        return dataSet.map(data => {
            return {
                week: +data.week,
                value: data[zone]
            }
        })
    }
    updateData(dataSet) {
        this.dataSet = dataSet
        this.subGraphs.forEach((graph, region) => graph.updateData(this.dataMapper(region, this.dataSet)))
    }
    drawMinMax(minMaxData) {
        this.minMaxData = minMaxData
        this.subGraphs.forEach((graph, region) => {
            let minData = this.dataMapper(region, minMaxData.min)
            let maxData = this.dataMapper(region, minMaxData.max)
            graph.drawMin(minData)
            graph.drawMax(maxData)
        })
    }
}

class Graph {
    constructor(svg, color) {
        this.svg = svg
        this.color = color
        this.pxX = +svg.attr("width")
        this.pxY = +svg.attr("height") - margin
        this.scX = d3.scaleLinear().domain([1, 53]).range([margin, this.pxX])
        this.scY = d3.scaleLinear().domain([0, 1]).range([this.pxY, margin]).nice()

    }
    updateData(data) {
        this.data = data
        this.svg.call(Graph.drawAxis, this)
        this.svg.call(Graph.drawCircles, this)
        this.svg.call(Graph.drawLines, this, this.data, "primary", this.color)
    }
    // The .call() way of calling does not pass allow this to exist, so functions may as well be static, as we pass in this explicitly as graph
    static drawAxis(selection, graph) {
        let xAxis = selection.selectAll("g.x").data([0])
        let yAxis = selection.selectAll("g.y").data([0])

        // Delete
        xAxis.exit().remove()
        yAxis.exit().remove()

        // Append
        xAxis.enter().append("g")
            .attr("class", "x")
            .call(d3.axisBottom(graph.scX).ticks(graph.data.length))
            .attr("transform", "translate(0," + graph.pxY + ")")
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis.enter().append("g")
            .attr("class", "y")
            .call(d3.axisLeft(graph.scY))
            .attr("transform", "translate(" + margin + ",0)")

        xAxis.call(d3.axisBottom(graph.scX).ticks(graph.data.length))
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis.call(d3.axisLeft(graph.scY))

        // Update
        xAxis
            .call(d3.axisBottom(graph.scX).ticks(graph.data.length))
            .attr("transform", "translate(0," + graph.pxY + ")")
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis
            .call(d3.axisLeft(graph.scY))
            .attr("transform", "translate(" + margin + ",0)")

        xAxis.call(d3.axisBottom(graph.scX).ticks(graph.data.length))
            .selectAll("text")
            .attr("transform", "translate(0,10),rotate(-30)")
        yAxis.call(d3.axisLeft(graph.scY))
        graph.xAxis = xAxis
        graph.yAxis = yAxis
    }
    static drawCircles(selection, graph) {
        let circles = selection.selectAll("circle").data(graph.data)

        // Delete
        circles.exit().remove()

        // Append
        circles.enter().append("circle")
            .attr("r", 3)
            .attr("cx", d => graph.scX(d.week))
            .attr("cy", d => graph.scY(d.value))

        // Update
        circles
            .attr("cx", d => graph.scX(d.week))
            .attr("cy", d => graph.scY(d.value))
        graph.circles = circles
    }
    static drawLines(selection, graph, data, lineName, color) {
        // Define lines
        let lnMkr = d3.line().curve(d3.curveNatural)
            .x(d => graph.scX(d.week)).y(d => graph.scY(d.value));
        let lines = selection.selectAll(`path.${lineName}`).data(data)

        // Remove excess lines
        lines.exit().remove()


        // Add new lines
        lines.enter().append("path")
            .attr("stroke", color)
            .attr("fill", "none")
            .classed(lineName, true)
            .attr("d", lnMkr(data))

        // Update existing lines
        lines.attr("d", lnMkr(data))
        graph[lineName] = lines
    }
    showLines(show) {
        show ? this.lines.attr("stroke", color) : this.lines.attr("stroke", "none")
    }
    showCircles(show) {
        show ? this.circles.attr("fill", color) : this.circles.attr("fill", "none")
    }

    static makeTimeScale(data, accessor, range) {
        return d3.scaleLinear()
            .domain(d3.extent(data, accessor))
            .range(range).nice()
    }
    drawMin(minData) {
        this.svg.call(Graph.drawLines, this, minData, "min", "red")
    }

    drawMax(maxData) {
        this.svg.call(Graph.drawLines, this, maxData, "max", "yellow")
    }
}
function updateLinkHandler(svg, colorData, textData, mapRegions, sc) {
    let pxX = svg.attr("width") - 2 * margin
    let pxY = svg.attr("height") - 2 * margin

    let mouseHeld = false

    function updateMap(event) {
        let pt = d3.pointer(event);
        let minimum = 5000
        let circle = d3.selectAll("circle").each((d, i, n) => {
            let sel = d3.select(n[i])
            let xDistance = Math.abs(sel.attr("cx") - pt[0])
            minimum = Math.min(minimum, xDistance)
        }).filter((d, i, n) =>
            Math.abs(d3.select(n[i]).attr("cx") - pt[0]) == minimum)
        let currentTime = circle.data()[0].date
        mapRegions.each(function (_, i, n) {
            let sel = d3.select(n[i])
            let field = sel.attr("class").slice(0, 3)
            sel.selectAll("path").attr("fill", () => {
                let currentColor = d3.select(n[i]).attr("fill")
                try {
                    return sc(colorData.filter(d => d.date.getTime() == currentTime.getTime())[0][field])

                } catch (e) {
                    return currentColor
                }

            }
            )
            // Price data may not overlap with hydrodata
            try {
                sel.select(".price").text((+textData.filter(d => d.date.getTime() == currentTime.getTime())[0][field]).toFixed(4))

            } catch (e) { }


        })

    }

    let hotzone = svg.select("rect").data([0])
    hotzone.exit().remove
    if (hotzone.enter().size() > 0)
        hotzone.enter().append("rect")
            .attr("cursor", "crosshair")
            .attr("x", margin).attr("y", margin)
            .attr("width", pxX).attr("height", pxY)
            .attr("visibility", "hidden")
            .attr("pointer-events", "all")
            .on("mousemove", function (event) {
                if (mouseHeld) {
                    updateMap(event)
                }
            })
            .on("mousedown", function (event) {
                mouseHeld = true
                updateMap(event)
            })
            .on("mouseup", function () {
                mouseHeld = false
            })
            .on("mouseleave", function () {
                mouseHeld = false
            })
    if (hotzone.size() > 0)
        hotzone
            .on("mousemove", function (event) {
                if (mouseHeld) {
                    updateMap(event)
                }
            })
            .on("mousedown", function (event) {
                mouseHeld = true
                updateMap(event)
            })
            .on("mouseup", function () {
                mouseHeld = false
            })
            .on("mouseleave", function () {
                mouseHeld = false
            })

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

    let scX = makeTimeScale(data, d => d.week, [margin, pxX]);
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

