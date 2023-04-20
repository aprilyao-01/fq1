const margin_heatmap = { top: 10, right: 20, bottom: 20, left: 70 };
const width_heatmap = 800 - margin_heatmap.left - margin_heatmap.right;
const height_heatmap = 600 - margin_heatmap.top - margin_heatmap.bottom;

const svg_heatmap = d3.select("#heatmap-chart")
    .attr("width", width_heatmap + margin_heatmap.left + margin_heatmap.right)
    .attr("height", height_heatmap + margin_heatmap.top + margin_heatmap.bottom)
    .append("g")
    .attr("transform", `translate(${margin_heatmap.left}, ${margin_heatmap.top})`);

const tooltip_heatmap = d3.select("#heatmap-tooltip");

d3.csv("gdp_events.csv").then(data => {
    const years = Array.from(new Set(data.map(d => d.Year))).sort();
    const countries = Array.from(new Set(data.map(d => d.Country))).sort();

    const xScale = d3.scaleBand().domain(years).range([0, width_heatmap]).padding(0.05);
    const yScale = d3.scaleBand().domain(countries).range([0, height_heatmap]).padding(0.05);

    const colorScale = d3.scaleSequential()
        .domain([d3.min(data, d => +d.GDP_growth_rate), d3.max(data, d => +d.GDP_growth_rate)])
        .interpolator(d3.interpolateGreens);

    svg_heatmap.append("g")
        .attr("transform", `translate(0, ${height_heatmap})`)
        .call(d3.axisBottom(xScale));

    svg_heatmap.append("g")
        .call(d3.axisLeft(yScale));

    svg_heatmap.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.Year))
        .attr("y", d => yScale(d.Country))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(+d.GDP_growth_rate))
        .on("mouseover", (event, d) => {
            tooltip_heatmap.classed("hidden", false)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`)
                .html(`Country: ${d.Country}<br>Year: ${d.Year}<br>GDP Growth Rate: ${(+d.GDP_growth_rate).toFixed(2)}%`);
            
            const target = d3.select(event.currentTarget);
            const x = parseFloat(target.attr("x"));
            const y = parseFloat(target.attr("y"));
            const width = parseFloat(target.attr("width"));
            const height = parseFloat(target.attr("height"));

            target
                .attr("x", x - 2)
                .attr("y", y - 2)
                .attr("width", width + 4)
                .attr("height", height + 4);
        })
        .on("mouseout", (event) => {
            tooltip_heatmap.classed("hidden", true);

            const target = d3.select(event.currentTarget);
            const x = parseFloat(target.attr("x"));
            const y = parseFloat(target.attr("y"));
            const width = parseFloat(target.attr("width"));
            const height = parseFloat(target.attr("height"));

            target
                .attr("x", x + 2)
                .attr("y", y + 2)
                .attr("width", width - 4)
                .attr("height", height - 4);
        });
});
