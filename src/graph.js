function findScale(data) {
    let [min, max] = d3.extent(data, d => d.value)
    min = Math.min(min, -max)
    max = Math.max(max, -min)
    return [min, max]
}
class GraphSet {
    constructor(svg, zones, color, fullScale) {
        this.svg = svg
        this.pxX = +svg.attr("width") - margin.left - margin.right;
        this.pxY = +svg.attr("height") - margin.top

        this.subGraphs = new Map()
        zones.forEach((zone, i) => {
            let height = Math.floor(this.pxY / zones.length)
            let g = svg.append("g").attr("width", this.pxX).attr("height", height).classed(zone, true)
                .attr("transform", `translate(0,${height * i})`)
            this.subGraphs.set(zone, new Graph(g, color, fullScale))
        })
    }
    dataMapper(zone, dataSet) {
        return dataSet.map(data => {
            return {
                week: +data.week,
                value: data[zone] ? data[zone] : data.value  // The total export data looks a bit different and has already been mapped
            }
        })
    }
    updateData(dataSet) {
        this.dataSet = dataSet
        this.setScales(dataSet)
        this.subGraphs.forEach((graph, region) => {
            graph.extent = this.extent
            graph.updateData(this.dataMapper(region, this.dataSet))
        }
        )
    }
    drawMinMax(minMaxData, relative) {
        this.minMaxData = minMaxData
        this.subGraphs.forEach((graph, region) => {
            let minData = this.dataMapper(region, minMaxData.min)
            let maxData = this.dataMapper(region, minMaxData.max)
            if (relative) {
                this.transformData(graph, minData, maxData)
            } else {
                graph.drawMin(minData)
                graph.drawMax(maxData)
            }
            graph.showMaxMin(!relative)
        })
    }
    drawVertical(week) {
        let x = this.subGraphs.entries().next().value[1].scX(week)
        let verticalLine = this.svg.selectAll("line").filter(".vertical")
        let previousWeek = verticalLine.data()[0]
        if (previousWeek != week)
            verticalLine = verticalLine.data([week])

        verticalLine.exit().remove()

        verticalLine.enter().append("line")
            .attr("x1", x)
            .attr("y1", margin.top)
            .attr("x2", x)
            .attr("y2", this.pxY)
            .attr("pointer-events", "none")
            .classed("vertical", true)
            .style("stroke-width", 2)
            .style("stroke", "green")
            .style("fill", "none")

        verticalLine.attr("x1", x).attr("x2", x)
    }
    setScales(dataSet) {
        let extent = []
        let splitSets = zones["2021"].map(region => this.dataMapper(region, dataSet))
        splitSets.forEach((data, i) => {
            extent[i] = findScale(data)
        })
        this.extent = d3.max(extent)
    }
    transformData(graph, minData, maxData) {
        let data = graph.data.map((d, i) => {
            return {
                week: d.week,
                value: (d.value - minData[i].value) / (maxData[i].value - minData[i].value)
            }
        })
        graph.updateData(data)
    }
}

class Graph {
    constructor(svg, color, fullScale) {
        this.svg = svg
        this.color = color
        this.pxX = +svg.attr("width")
        this.pxY = +svg.attr("height")
        this.fullScale = fullScale

    }
    updateData(data) {
        this.data = data
        this.scX = d3.scaleLinear().domain([1, 53]).range([margin.left, this.pxX - margin.right])
        if (this.fullScale) {
            this.scY = d3.scaleLinear().domain(findScale(data)).range([this.pxY, margin.top]).nice()
        } else if (d3.max(this.extent) > 1.2) {
            this.scY = d3.scaleLinear().domain([0, this.extent[1]]).range([this.pxY, margin.top]).nice()
        } else {
            this.scY = d3.scaleLinear().domain([0, 1]).range([this.pxY, margin.top]).nice()
        }
        this.svg.call(Graph.drawAxis, this)
        this.svg.call(Graph.drawCircles, this)
        this.svg.call(Graph.drawLines, this, this.data, "primary", this.color)
    }
    // The .call() way of calling does not pass allow this to exist, so functions may as well be static, as we pass in this explicitly as graph
    static drawAxis(selection, graph) {
        let xAxis = selection.selectAll("g.x").data([0])
        let yAxis = selection.selectAll("g.y").data([0])
        let tFormat = graph.fullScale ? ",.2r" : ",.1f"
        let xPosition = graph.scY(0)

        // Delete
        xAxis.exit().remove()
        yAxis.exit().remove()

        // Append
        xAxis.enter().append("g")
            .attr("class", "x")
            .call(d3.axisBottom(graph.scX).ticks(Math.floor(graph.data.length / 2)))
            .attr("transform", "translate(0," + xPosition + ")")
            .selectAll("text")
            .attr("transform", "translate(0,10)")
        yAxis.enter().append("g")
            .attr("class", "y")
            .call(d3.axisLeft(graph.scY).tickFormat(d3.format(tFormat)))
            .attr("transform", "translate(" + margin.left + ",0)")

        // Update
        xAxis
            .call(d3.axisBottom(graph.scX).ticks(Math.floor(graph.data.length / 2)))
            .attr("transform", "translate(0," + xPosition + ")")
            .selectAll("text")
            .attr("transform", "translate(0,10)")
        yAxis
            .call(d3.axisLeft(graph.scY).tickFormat(d3.format(tFormat)))
            .attr("transform", "translate(" + margin.left + ",0)")

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
            .attr("fill", graph.color)

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
        lines = selection.selectAll(`path.${lineName}`)
        graph[lineName] = [lines, color]
    }
    showLines(show, lineName) {
        show ? this[lineName][0].attr("stroke", this[lineName][1]) : this[lineName][0].attr("stroke", "none")
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
    showMaxMin(show) {
        this.showLines(show, "min")
        this.showLines(show, "max")
    }

}
