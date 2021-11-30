
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

}

function installLinkHandler(svg, hydroData, priceData, mapRegions, sc) {
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
            sel.selectAll("path").attr("fill", (d, i, n) => {
                let currentColor = d3.select(n[i]).attr("fill")
                try {
                    return sc(hydroData.filter(d => d.date.getTime() == currentTime.getTime())[0][field])

                } catch (e) {
                    return currentColor
                }

            }
            )
            try {
                sel.select(".price").text((+priceData.filter(d => d.date.getTime() == currentTime.getTime())[0][field]).toFixed(4))
            } catch (e) {
            }


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

async function fillDropDown() {
    let dropDown = d3.select("#selectYear")
    dropDown.selectAll('myOptions').data(years).enter().append("option").text(d => d).attr("value", d => d)

    dropDown.on("change", async function () {
        let year = d3.select(this).property("value")
        let [hydroData, priceData, minMaxData] = await Promise.all([getHydroData(year), getPriceData(year), getMinMaxData(year)])
        createUpdateGraphs(d3.select("#hydroGraphs"), hydroData, priceData, "hydro", true, true, true)
        createUpdateGraphs(d3.select("#priceGraphs"), priceData, hydroData, "price", true, true, true)
        createUpdateGraphs(d3.select("#hydroGraphs"), minMaxData.min, priceData, "min", false, true, true)
        createUpdateGraphs(d3.select("#hydroGraphs"), minMaxData.max, priceData, "max", false, true, true)
    })
}

async function main() {

    let map = new RegionMap(d3.select("#norway"))
    let hydro = new GraphSet(d3.select("#hydroGraphs"), "blue")
    let price = new GraphSet(d3.select("#priceGraphs"), "green")
    let interactor = new Interactor(map, hydro, price)
    let loader = new Loader(d3.select("#selectYear"), 2021, hydro, price)

}
// main()
