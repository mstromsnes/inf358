async function main() {

    let map = new RegionMap(d3.select("#norway"))
    let hydro = new GraphSet(d3.select("#hydroGraphs"), "blue")
    let price = new GraphSet(d3.select("#priceGraphs"), "green")
    let interactor = new Interactor(map, hydro, price)
    let loader = new Loader(d3.select("#selectYear"), 2021, map, hydro, price)
}
