// 1: SET GLOBAL VARIABLES
const margin = { top: 70, right: 150, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2.a: LOAD DATA
d3.csv("weather.csv").then(data => {
    const parseDate = d3.timeParse("%m/%d/%Y");
    const formatMonth = d3.timeFormat("%Y-%m");
    const citiesToInclude = ["Chicago", "Jacksonville", "Philadelphia", "Phoenix", "Charlotte", "Indianapolis"];

    const monthlyData = {};

    data.forEach(d => {
        d.date = parseDate(d.date);
        d.city = d.city.trim();
        if (!citiesToInclude.includes(d.city)) return;

        const month = formatMonth(d.date);
        const key = `${month}-${d.city}`;

        if (!monthlyData[key]) {
            monthlyData[key] = { month, city: d.city, temps: [] };
        }

        monthlyData[key].temps.push(+d.actual_mean_temp);
    });

    // 2.b: AVERAGE THE MONTHLY TEMPERATURES
    const averaged = Object.values(monthlyData).map(entry => ({
        month: d3.timeParse("%Y-%m")(entry.month),
        city: entry.city,
        temperature: d3.mean(entry.temps)
    }));

    // Group data by city
    const grouped = Array.from(d3.group(averaged, d => d.city), ([key, values]) => ({
        city: key,
        values
    }));

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleTime()
        .domain(d3.extent(averaged, d => d.month))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(averaged, d => d.temperature) - 5,
            d3.max(averaged, d => d.temperature) + 5
        ])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(grouped.map(d => d.city))
        .range(d3.schemeTableau10);

    // 4.a: DRAW LINES
    const line = d3.line()
        .x(d => xScale(d.month))
        .y(d => yScale(d.temperature));

    svg1_RENAME.selectAll(".line")
        .data(grouped)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.city))
        .attr("stroke-width", 2)
        .attr("d", d => line(d.values));

    // 5.a: AXES FOR CHART 1
    svg1_RENAME.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(12).tickFormat(d3.timeFormat("%b '%y")));

    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: LABELS FOR CHART 1
    svg1_RENAME.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Month");

    svg1_RENAME.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Average Temperature (°F)");

    // 6.c: LEGEND
    const legend = svg1_RENAME.selectAll(".legend")
        .data(grouped)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
        .attr("x", width + 20)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", d => colorScale(d.city));

    legend.append("text")
        .attr("x", width + 38)
        .attr("y", 6)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .text(d => d.city);

    // ==========================================
    //         CHART 2 — PRECIPITATION
    // ==========================================

    // 2.c: COMPUTE AVERAGE PRECIPITATION BY CITY
    const precipitationByCity = d3.rollups(
        data,
        v => d3.mean(v, d => +d.actual_precipitation),  // Change column name if needed
        d => d.city.trim()
    );

    // 2.d: Build array and sort for display
    const precipitationData = precipitationByCity
        .map(([city, precipitation]) => ({ city, precipitation }))
        .filter(d => citiesToInclude.includes(d.city))
        .sort((a, b) => a.precipitation - b.precipitation);

    // 3.b: SET SCALES FOR CHART 2
    const xScale2 = d3.scaleBand()
        .domain(precipitationData.map(d => d.city))
        .range([0, width])
        .padding(0.2);

    const yScale2 = d3.scaleLinear()
        .domain([0, d3.max(precipitationData, d => d.precipitation) + 0.05])
        .range([height, 0]);

    // 4.b: DRAW BARS
    svg2_RENAME.selectAll("rect")
        .data(precipitationData)
        .enter()
        .append("rect")
        .attr("x", d => xScale2(d.city))
        .attr("y", d => yScale2(d.precipitation))
        .attr("width", xScale2.bandwidth())
        .attr("height", d => height - yScale2(d.precipitation))
        .attr("fill", "steelblue");

    // 5.b: AXES FOR CHART 2
    svg2_RENAME.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale2));

    svg2_RENAME.append("g")
        .call(d3.axisLeft(yScale2));

    // 6.b: LABELS FOR CHART 2
    svg2_RENAME.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("City");

    svg2_RENAME.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Average Precipitation (inches)");
});
