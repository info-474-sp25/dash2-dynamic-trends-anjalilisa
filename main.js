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
    const citiesToInclude = ["Chicago", "Jacksonville", "Philadelphia", "Phoenix"];

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

    // 3.a: SET SCALES
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

    // 5.a: AXES
    // svg1_RENAME.append("g")
    //     .attr("transform", `translate(0, ${height})`)
    //     .call(d3.axisBottom(xScale)
    //         .ticks(12)
    //         .tickFormat(d3.timeFormat("%m"))); // show month numbers (01–12)
    svg1_RENAME.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale)
        .ticks(12)
        .tickFormat(d3.timeFormat("%b '%y"))); // Month-Year

    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: AXIS LABELS
    svg1_RENAME.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Month (Numeric)");

    svg1_RENAME.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Average Temperature (°F)");

    // // 6.b: CHART TITLE
    // svg1_RENAME.append("text")
    //     .attr("x", width / 2)
    //     .attr("y", -30)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "18px")
    //     .style("font-weight", "bold")
    //     .text("Monthly Average Temperature by City (July 2014 – June 2015)");

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




    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});