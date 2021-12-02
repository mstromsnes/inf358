async function main() {

    let map = new RegionMap(d3.select("#norway"))
    let hydro = new GraphSet(d3.select("#hydroGraphs"), zones["2021"], "blue")
    let price = new GraphSet(d3.select("#priceGraphs"), zones["2021"], "green")
    let exp = new GraphSet(d3.select("#exportGraph"), ["NO"], "orange", true)
    let interactor = new Interactor(map, hydro, price, exp)
    let loader = new Loader(d3.select("#selectYear"), 2021, map, hydro, price, exp)
}
