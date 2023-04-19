// Define margins
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 400 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const innerRadius = 70;
const outerRadius = Math.min(width, height) / 2;

// Create the containers
const svg = d3.select("#donut-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

const color = d3.scaleOrdinal()
    .range(["#4caf50", "#2196f3", "#ff9800"]);

const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

const tooltip = d3.select("#tooltip");

let data;

// Load data from file
d3.csv("merged_data.csv").then(csvData => {
    data = csvData;

    console.log(data);

    const countries = Array.from(new Set(data.map(d => d.Country)));
    const years = Array.from(new Set(data.map(d => d.Year)));

    // Create a dropdown menu for countries
    d3.select("#country-select")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Create a dropdown menu for year
    d3.select("#year-select")
        .selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Update charts when selection changes
    d3.select("#country-select").on("change", updateChart);
    d3.select("#year-select").on("change", updateChart);

    // Initial update
    updateChart();

    function updateChart() {
        // donut chart
        const selectedCountry = d3.select("#country-select").node().value;
        const selectedYear = d3.select("#year-select").node().value;

        const filteredData = data.filter(d => d.Country === selectedCountry && d.Year === selectedYear)[0];

        const pieData = [
            { label: "Agriculture", value: +filteredData.agriculture },
            { label: "Industry", value: +filteredData.industry },
            { label: "Services", value: +filteredData.services }
        ];

        const path = svg.selectAll("path")
            .data(pie(pieData));

        path.enter()
            .append("path")
            .merge(path)
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .on("mouseover", (event, d) => {
                tooltip.classed("hidden", false)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY - 28}px`)
                    .html(`${d.data.label}: ${d.data.value.toFixed(2)}%`);
            })
            .on("mouseout", () => {
                tooltip.classed("hidden", true);
            });

        path.exit().remove();

        // Add text labels to the chart
        const text = svg.selectAll("text.label")
        .data(pie(pieData));

        text.enter()
        .append("text")
        .attr("class", "label")
        .merge(text)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(d => `${d.data.label}`);

        text.exit().remove(); 
    }
});
