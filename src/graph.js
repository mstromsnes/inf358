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
