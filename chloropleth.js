const createFullEducationArray = education => {
  const arr = [];
  education.forEach(element => {
    arr[element.fips] = element;
  });
  return arr;
};

const buildChart = async () => {
  const countyData =
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
  const educationData =
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

  const [counties, education] = await Promise.all([
    d3.json(countyData),
    d3.json(educationData)
  ]).catch(err => console.error(err));

 
  const fullEducationArray = createFullEducationArray(education);
  const educationLevels = education.map(element => element.bachelorsOrHigher);

  var width = 960,
    height = 700;
const padding = {top: 50, right:100, bottom:50, left: 50}


  const blueScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain([Math.min(...educationLevels), Math.max(...educationLevels)]);
const redScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateReds)
    .domain([Math.min(...educationLevels), Math.max(...educationLevels)]);
  const div = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr("county", "")
    .attr("educationPercent", "")
  var svg = d3
    .select("#dataviz")
    .append("svg")
    .attr("width", width + padding.right)
    .attr("height", height);

  var path = d3.geoPath();

  svg
    .selectAll(".counties")
    .data(topojson.feature(counties, counties.objects.counties).features)
    .enter()
    .append("path")
  
    .attr("class", "county")
    .attr("data-fips", d => fullEducationArray[d.id].fips)
    .attr("data-education", d => fullEducationArray[d.id].bachelorsOrHigher)
    .attr("fill", d => blueScale(fullEducationArray[d.id].bachelorsOrHigher))
    .attr("d", path)
    .on("mouseover", d => {
      div
        .transition()
        .duration(0)
        .style("opacity", .7)
        .attr("county", fullEducationArray[d.id].area_name)
        .attr(
          "data-education",
          fullEducationArray[d.id].bachelorsOrHigher
        )
        
        .style("left", d3.event.pageX + 25 + "px")
   
        .style("top", d3.event.pageY + "px");
      div.html(`${fullEducationArray[d.id].area_name}, ${fullEducationArray[d.id].state}<br>
${fullEducationArray[d.id].bachelorsOrHigher}% of adults w/ Bachelors or higher`);
    })
    .on("mouseout", d => {
      div
        .transition()
        .duration(750)
        .style("opacity", 0);
    });
  svg
    .selectAll(".states")
    .data(topojson.feature(counties, counties.objects.states).features)
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("d", path);

  const colorLegend = d3
    .legendColor()
    .labelFormat(d3.format(".1f"))
    .scale(blueScale)
    .title("% ≥ Bachelors")
    .titleWidth(120)
    .shapePadding(0)
    .shapeWidth(30)
    .shapeHeight(30)
    .labelOffset(10)
    .cells(15);
  
    svg
    .append("g")
    .attr("class", "legend")
    .attr('id','legend')
    .attr("transform", `translate(${width+padding.right-100},100)`);
  svg.select(".legend").call(colorLegend);


  svg
    .append("text")
    .attr("id", "title")
    .text("Highest Education Level by County")
    .style("text-anchor", "middle")
    .attr("x", (width + padding.right) / 2)
    .attr("y", 20)
    .attr("font-size", "30px");

  svg
    .append("text")
    .attr("id", "description")
    .text("Amoung Adults 25 and older")
    .style("text-anchor", "middle")
    .attr("x", (width + padding.right) / 2)
    .attr("y", 50)
    .attr("font-size", "20px");
};

document.addEventListener("DOMContentLoaded", buildChart);
