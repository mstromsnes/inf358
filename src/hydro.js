function makeTimeScale(data, accessor, range) {
    return d3.scaleTime()
        .domain(d3.extent(data, accessor))
        .range(range).nice()
}

async function drawMap() {
    let svg = d3.selectAll("#norway")
    let pxX = +svg.attr("width")
    let pxY = +svg.attr("height")
    let scale = 2000 * Math.min(pxX / 1200, pxY / 1200)

    let projection = d3.geoMercator()
        .center([17, 65.8])                // GPS of location to zoom on
        .scale(scale)                       // This is like the zoom
        .translate([pxX / 2, pxY / 2])
    const path = d3.geoPath().projection(projection);

    async function drawBorders(url, feature, color) {
        return d3.json(url).then(function (data) {
            data.features = data.features.filter(function (d) {
                return d.properties.name == feature
            })
            let g = svg.append("g").classed(feature, true).classed("map", true)

            // Draw the map
            g.selectAll("path").data(data.features).enter().append("path")
                .attr("fill", color)
                .attr("d", path)
                .classed(feature, true)
                .style("stroke", "visible")
            // .attr("class", feature)

            // Label it
            let g2 = g.selectAll("text").data(data.features).enter().append("g")
            function textPosition(d) {
                if (feature != "NO4")
                    return path.centroid(d)
                else {
                    return [path.centroid(d)[0] + 60, path.centroid(d)[1] - 30]
                }
            }
            g2.append("text")
                .text(d => d.properties.name)
                .attr("x", d => textPosition(d)[0])
                .attr("y", d => textPosition(d)[1])
                .classed(feature, true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle")
            g2.append("text")
                .text("2")
                .attr("x", d => textPosition(d)[0])
                .attr("y", d => textPosition(d)[1] + 14 + 6)
                .classed(feature, true)
                .classed("price", true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle");


        })
    }

    const url = "../config/norge.geojson"
    promises =
        zones.map(zone => drawBorders(url, zone, colorScale(zone)))


    await Promise.all(promises)
    return svg

}

function initializeMap(region, colorScale, svg, hydroData, priceData) {
    let hydroDatum = hydroData[hydroData.length - 1]
    let priceDatum = priceData[priceData.length - 1]
    svg.selectAll("path").filter("." + region).attr("fill", colorScale(hydroDatum[region]))
    svg.selectAll(".price").filter((d, i, n) => d3.select(n[i]).classed(region)).text(priceDatum[region].toFixed(4))
    console.log(svg.selectAll(".price"))

}

function drawTimeline(svg, data) {
    let margin = 18
    let timeData = data.map(d => d.date)
    let pxX = +svg.attr("width")
    let pxY = +svg.attr("height")
    let scX = d3.scaleLinear().domain(timeData).range([0, pxX])
    function tickFormat(d) {
        let date = new Date(d)
        console.log(date.getMonth() + " - " + date.getFullYear())
        return date.getMonth() + 1 + " - " + date.getFullYear()
    }
    svg.append("g").attr("transform", `translate(0,${pxY - margin})`).call(d3.axisBottom(scX).ticks(10).tickFormat(tickFormat))

}
function installLinkHandler(svg, hydroData, priceData, mapRegions) {
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
            sel.selectAll("path").attr("fill", () =>
                mapColorScale(hydroData.filter(d => d.date.getTime() == currentTime.getTime())[0][field])
            )
            try {
                sel.select(".price").text(priceData.filter(d => d.date.getTime() == currentTime.getTime())[0][field].toFixed(4))
            } catch (e) { }


        })

    }

    let hotzone = svg.append("rect").attr("cursor", "crosshair")
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
}
function updateLinkHandler(svg, hydroData, priceData, mapRegions, sc) {
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
            sel.selectAll("path").attr("fill", () =>
                mapColorScale(hydroData.filter(d => d.date.getTime() == currentTime.getTime())[0][field])
            )
            // Price data may not overlap with hydrodata
            try {
                sel.select(".price").text(priceData.filter(d => d.date.getTime() == currentTime.getTime())[0][field].toFixed(4))

            } catch (e) { }


        })

    }

    let hotzone = svg.select("rect").attr("cursor", "crosshair")
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

}

function drawCircles(svg, data, accX, accY, sc) {
    let color = sc(Infinity);
    return svg.selectAll("circle").data(data).enter()
        .append("circle")
        .attr("r", 5).attr("cx", accX).attr("cy", accY)
        .attr("fill", color).attr("fill-opacity", 0.4);
}

function drawUpdateData(svg, hydroData, curve) {
    let pxX = +svg.attr("width") - margin;
    let pxY = +svg.attr("height") - margin;

    let scX = makeTimeScale(hydroData, d => d.date, [margin, pxX]);
    let scY = d3.scaleLinear().domain([0, 1]).range([pxY, margin]).nice()
    // let circles = svg.selectAll(`g`).selectAll("circle").data(hydroData)
    svg.each(function (d) {
        let region = d
        // Circle logic
        {
            let circles = d3.select(this).selectAll("circle").data(hydroData)
            // Remove excess circles
            circles.exit().remove()

            // Add new circles
            circles.enter().append("circle")
                .attr("r", 5)
                .attr("cx", d => scX(d.date))
                .attr("cy", d => scY(d[region]))
                .attr("fill", colorScale(region));

            // Update existing circles
            circles
                .attr("cx", d => scX(d.date))
                .attr("cy", d => scY(d[region]))
        }
        // Line Logic
        {
            // Update lines
            let lnMkr = d3.line().curve(curve)
                .x(d => scX(d.date)).y(d => scY(d[region]));
            let lines = d3.select(this).selectAll("path").data(region)

            // Remove excess lines
            lines.exit().remove()

            // Add new lines
            lines.enter().append("path")
                .attr("fill", "none")
                .attr("stroke", d => colorScale(region))
                .attr("d", lnMkr(hydroData))

            // Update existing lines
            lines.attr("d", lnMkr(hydroData))
        }
        // Axis logic
        {
            let xAxis = d3.select(this).selectAll("g.x").data([0])
            let yAxis = d3.select(this).selectAll("g.y").data([0])

            xAxis.enter().append("g")
                .attr("class", "x")
                .call(d3.axisBottom(scX).ticks(hydroData.length).tickFormat(d3.timeFormat("%V - %Y")))
                .attr("transform", "translate(0," + pxY + ")")
                .selectAll("text")
                .attr("transform", "translate(0,10),rotate(-30)")
            yAxis.enter().append("g")
                .attr("class", "y")
                .call(d3.axisLeft(scY))
                .attr("transform", "translate(" + margin + ",0)")

            xAxis.call(d3.axisBottom(scX).ticks(hydroData.length).tickFormat(d3.timeFormat("%V - %Y")))
                .selectAll("text")
                .attr("transform", "translate(0,10),rotate(-30)")
            yAxis.call(d3.axisLeft(scY))

        }
    })
}
async function createUpdateGraphs(year) {
    let hydroData = await getHydroData(year)
    let priceData = await getPriceData(year)

    let graphSvg = d3.select("#hydroGraphs")
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
            .call(drawUpdateData, hydroData, d3.curveNatural)

    // Update existing graphs
    if (svg.size() > 0)
        svg.call(drawUpdateData, hydroData, d3.curveNatural)
    let mapRegions = d3.selectAll("g.map")
    updateLinkHandler(d3.select("#hydroGraphs"), hydroData, priceData, mapRegions)
}

function fillDropDown() {
    let dropDown = d3.select("#selectYear")
    dropDown.selectAll('myOptions').data(years).enter().append("option").text(d => d).attr("value", d => d)
    dropDown.on("change", function () {
        let year = d3.select(this).property("value")
        createUpdateGraphs(year)
    })
    console.log(dropDown)
}

async function main() {
    let minMaxData = await getMinMaxData()
    fillDropDown()

    let mapSvg = await drawMap()
    // let mapColorScale = d3.scaleLinear().domain([0, 1])
    //     .range(["white", "blue"])

    let hydroData = await getHydroData("2021")
    let priceData = await getPriceData("2021")
    let graphSvg = d3.select("#hydroGraphs")

    createUpdateGraphs("2021")
    // zones.forEach((region, index) => {
    //     let height = Math.floor(graphSvg.attr("height") / zones.length)
    //     let svg = graphSvg.append("g")
    //         .attr("height", height)
    //         .attr("width", graphSvg.attr("width"))
    //         .attr("transform", `translate(0,${height * index})`)
    //         .attr("class", `graph ${region}`)
    //     drawGraph(svg, hydroData, region)
    // })

    zones.forEach(d =>
        initializeMap(d, mapColorScale, mapSvg, hydroData, priceData))
    let mapRegions = mapSvg.selectAll("g").filter(".map")

    graphSvg.call(installLinkHandler, hydroData, priceData, mapRegions);

}
const mapColorScale = d3.scaleLinear().domain([0, 1])
    .range(["white", "blue"])
const margin = 40
const zones = [
    "NO1",
    "NO2",
    "NO3",
    "NO4",
    "NO5",
]
const colors = [
    "grey",
    "white",
    "red",
    "blue",
    "green"
]
const colorScale = d3.scaleOrdinal().domain(zones).range(colors)

const years = [
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
main()
