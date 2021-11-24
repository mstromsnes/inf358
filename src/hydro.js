function drawGraph(svg, data, region) {

    let pxX = +svg.attr("width") - margin;
    let pxY = +svg.attr("height") - margin;

    let makeTimeScale = function (accessor, range) {
        return d3.scaleTime()
            .domain(d3.extent(data, accessor))
            .range(range).nice()
    }

    let scX = makeTimeScale(d => d.date, [margin, pxX]);
    let scY = d3.scaleLinear().domain([0, 1]).range([pxY, margin]).nice()

    let drawData = function (g, accessor, curve) {
        // draw circles
        g.selectAll("circle").data(data).enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", d => scX(d.date))
            .attr("cy", accessor);
        // draw lines
        let lnMkr = d3.line().curve(curve)
            .x(d => scX(d.date)).y(accessor);
        g.append("path").attr("fill", "none")
            .attr("d", lnMkr(data));
    }

    let g = svg.append("g").classed(region, true)
    drawData(g, d => scY(d[region]), d3.curveNatural)
    g.selectAll("circle").attr("fill", colorScale(region));
    g.selectAll("path").attr("stroke", "cyan");

    svg.append("g")
        .call(d3.axisLeft(scY))
        .attr("transform", "translate(" + margin + ",0)")

    svg.append("g").call(d3.axisBottom(scX).ticks(data.length).tickFormat(d3.timeFormat("%V - %Y")))
        .attr("transform", "translate(0," + pxY + ")")
        .selectAll("text")
        .attr("transform", "translate(0,10),rotate(-30)");

    return svg
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
            let g = svg.append("g").classed(feature, true)

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
                    return [path.centroid(d)[0]+60, path.centroid(d)[1]-30]
                }
            }
            g2.append("text")
                .text(d => d.properties.name)
                .attr("x", d=>textPosition(d)[0])
                .attr("y", d=>textPosition(d)[1])
                .classed(feature, true)
                .attr("font-family", "sans-serif").attr("font-size", 14)
                .attr("text-anchor", "middle")
                g2.append("text")
                .text("2")
                .attr("x", d=>textPosition(d)[0])
                .attr("y", d=>textPosition(d)[1] + 14 + 6)
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
    svg.selectAll(".price").filter((d, i, n) => d3.select(n[i]).classed(region)).text(priceDatum[region])
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
function installLinkHandler(svg, data, mapRegions, sc) {
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
        data.currentTime = circle.data()[0].date
        mapRegions.each(function (_, i, n) {
            let sel = d3.select(n[i])
            let field = sel.attr("class")
            sel.selectAll("path").attr("fill", () => {
                return sc(data.filter(d => d.date == data.currentTime)[0][field])
            })

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

function drawCircles(svg, data, accX, accY, sc) {
    let color = sc(Infinity);
    return svg.selectAll("circle").data(data).enter()
        .append("circle")
        .attr("r", 5).attr("cx", accX).attr("cy", accY)
        .attr("fill", color).attr("fill-opacity", 0.4);
}

async function main() {
    let hydroData = await getHydroData("2021")
    let priceData = await getPriceData("2021")
    let minMaxData = await getMinMaxData()
    let graphSvg = d3.select("#hydroGraphs")

    zones.forEach((region, index) => {
        let height = Math.floor(graphSvg.attr("height") / zones.length)
        let svg = graphSvg.append("g")
            .attr("height", height)
            .attr("width", graphSvg.attr("width"))
            .attr("transform", `translate(0,${height * index})`)
        drawGraph(svg, hydroData, region)
    })

    let mapSvg = await drawMap()
    let mapColorScale = d3.scaleLinear().domain([0, 1])
        .range(["white", "blue"])
    zones.forEach(d =>
        initializeMap(d, mapColorScale, mapSvg, hydroData, priceData))
    // let graphs = graphSvg.selectAll("g")
    let mapRegions = mapSvg.selectAll("g")

    graphSvg.call(installLinkHandler, hydroData, mapRegions, mapColorScale);

}
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
main()
