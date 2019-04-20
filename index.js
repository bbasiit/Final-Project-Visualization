
/* Dimension for the choropleths */
let cWidth = 1600;
let cHeight = 40;
let cMargin = {top:10, bottom:20, right:0, left:0};
let cFWidth = cWidth + cMargin.left + cMargin.right;
let cFHeight = cHeight + cMargin.top + cMargin.bottom;

/* Dimension for the bar charts */

let bWidth = 900;
let bHeight = 200;
let bMargin = {top:50, bottom:20, right:10, left:40};
let bFWidth = bWidth + bMargin.left + bMargin.right;
let bFHeight = bHeight + bMargin.top + bMargin.bottom;

let rWidth = 100;
let rSpacing = 20;

/* Dimension for the scatter charts */

let lWidth = 400;
let lHeight = 200;
let lMargin = {top:30, bottom:20, right:10, left:40};
let lFWidth = lWidth + lMargin.left + lMargin.right;
let lFHeight = lHeight + lMargin.top + lMargin.bottom;

d3.csv("Admission_Predict.csv").then(data => {
  cleanData(data);
  drawIndividual(data);
  drawGraphs(data);
});

/*
Converts the data from string to int and float as necessary and sorts the
rows by ascending values of chance of admission.
*/
function cleanData(data) {
  // convert from string to appropriate types
  data.forEach(d => {
    d[data.columns[0]] = parseInt(d[data.columns[0]]);
    d[data.columns[1]] = parseInt(d[data.columns[1]]);
    d[data.columns[2]] = parseInt(d[data.columns[2]]);
    d[data.columns[3]] = parseInt(d[data.columns[3]]);
    d[data.columns[4]] = parseFloat(d[data.columns[4]]);
    d[data.columns[5]] = parseFloat(d[data.columns[5]]);
    d[data.columns[6]] = parseFloat(d[data.columns[6]]);
    d[data.columns[7]] = parseInt(d[data.columns[7]]);
    d[data.columns[8]] = parseFloat(d[data.columns[8]]);
  });

  // sort the data by ascending values of chance of admission
  data.sort((a,b) => a[data.columns[8]] - b[data.columns[8]]);
}

const indieBarYScales = [];

function drawIndividual(data) {

  let indieBarSvg = d3.select("#individual-bar")
                      .append("svg")
                        .attr("width", bFWidth)
                        .attr("height", bFHeight);

  for(let i=1; i<8; i++) {
    let maxVal = d3.max(data.map(d=>d[data.columns[i]]));
    let barYscale = d3.scaleLinear()
                        .domain([0, maxVal])
                        .range([0, bHeight]);
    indieBarYScales.push(barYscale);
  }

  let xBScale = d3.scaleLinear()
                  .domain([0, 1])
                  .range([0, bWidth]);

  let yBScale = d3.scaleLinear()
                  .domain([0, 1])
                  .range([bHeight, 0]);

  indieBarSvg.append("g")
       .attr("transform", `translate(${bMargin.left}, ${bHeight + bMargin.top})`)
       .call(d3.axisBottom(xBScale).ticks(0));

  indieBarSvg.append("g")
       .attr("transform", `translate(${bMargin.left}, ${bMargin.top})`)
       .call(d3.axisLeft(yBScale).ticks(0));

  let indieBars = indieBarSvg.append("g")
                              .attr("id", "bar-group")
                              .attr("transform", `translate(${bMargin.left}, ${bMargin.top})`);

  let indieTexts = indieBarSvg.append("g")
                                .attr("id", "text-group")
                                .attr("transform", `translate(${bMargin.left}, ${bMargin.top})`);

  // Draw labels

  let indieLabels = indieBarSvg.append("g")
                              .attr("transform", `translate(${bMargin.left}, 20)`);

  let labels = indieLabels.selectAll("text")
                 .data(data.columns.slice(1,8));

  labels.enter()
      .append("text")
        .attr("x", (d, i) => rSpacing + i*(rWidth + rSpacing))
      .merge(labels)
        .transition()
          .attr("y", (d,i) => 0)
          .text(d => d)

  drawBarChart(data[0]);

  let indieColor = d3.interpolateGreens
  let xiScale = d3.scaleLinear()
                    .domain([0, data.length])
                    .range([0, cWidth]);

  let indieSvg = d3.select("#individual-choropleth")
                   .append("svg")
                   .attr("height", cFHeight)
                   .attr("width", cFWidth);

  let rectWidth = cWidth/data.length;

  let indieChoro = indieSvg.append("g")
                           .selectAll("rect")
                           .data(data)
                           .enter()
                           .append("rect")
                             .attr("id", d=> "individual-" + d[data.columns[0]])
                             .attr("class", "indie-rect")
                             .attr("x", (d,i) => xiScale(i))
                             .attr("y", cMargin.top)
                             .attr("height", cHeight)
                             .attr("width", rectWidth)
                             .attr("fill", d => indieColor(d[data.columns[8]]))
                             .on("mouseover",d => {
                                drawBarChart(d, indieBarYScales, indieBarSvg, indieTexts);
                                d3.selectAll(".dpoint-"+d[data.columns[0]])
                                    .attr("r", 8);
                                d3.select("#individual-" + d[data.columns[0]])
                                  .attr("height", cHeight*1.3);
                              })
                             .on("mouseout",d => {
                                 d3.selectAll(".dpoint-"+d[data.columns[0]])
                                     .attr("r", 2);
                                 d3.select("#individual-" + d[data.columns[0]])
                                      .attr("height", cHeight);
                               });

}

function drawBarChart(datum) {
  let bars = d3.select("#bar-group");
  let textGroup = d3.select("#text-group");
  let columns = Object.keys(datum);

  let values = Object.values(datum).slice(1, 8);

  let rects = bars.selectAll("rect")
     .data(values);

  // let textGroup = svg.select("#value-texts");

  let texts = textGroup.selectAll("text")
                 .data(values)

  texts.enter()
      .append("text")
        .attr("x", (d, i) => rSpacing + i*(rWidth + rSpacing))
      .merge(texts)
        .transition()
          .attr("y", (d,i) => bHeight - indieBarYScales[i](d) - 10)
          .text(d => d)

  rects.enter()
       .append("rect")
          .attr("x", (d, i) => rSpacing + i*(rWidth + rSpacing))
          .attr("width", d => rWidth)
       .merge(rects)
          .transition()
          .attr("y", (d,i) => bHeight - indieBarYScales[i](d))
          .attr("height", (d, i) => indieBarYScales[i](d));

  d3.select(".card-title").text(datum[columns[8]]);
}

function drawGraphs(data) {
  let chartsDiv = d3.select("#charts");

  const chancesExtent = d3.extent(data.map(d=>d[data.columns[8]]));
  let scatterXscale = d3.scaleLinear()
                      .domain(chancesExtent)
                      .range([0, lWidth]);

  let xAxisSuffix = "-xAxis";
  let yAxisSuffix = "-yAxis";
  let scatterSuffix = "-scatter";

  for(let i=1; i<7; i++) {
    let columnValues = data.map(d=>d[data.columns[i]]);
    let scatterYscale = d3.scaleLinear()
                        .domain(d3.extent(columnValues))
                        .range([lHeight, 0]);

    let scatterDiv = chartsDiv.append("div")
                .attr("class", "col s4");

    scatterDiv.append("div")
            .attr("class", "badge")
            .text(data.columns[i])

    let scatterId = data.columns[i].replace(" ", "-");

    let scatterSvg = scatterDiv.append("svg")
                            .attr("height", lFHeight)
                            .attr("width", lFWidth)
                            .attr("id", scatterId);

    scatterSvg.append("g")
              .attr("transform", `translate(${lMargin.left}, ${lMargin.top})`)
              .attr("id", scatterId + yAxisSuffix)
           .call(d3.axisLeft(scatterYscale));

    scatterSvg.append("g")
              .attr("transform", `translate(${lMargin.left}, ${lHeight + lMargin.top})`)
              .attr("id", scatterId + xAxisSuffix)
            .call(d3.axisBottom(scatterXscale));

    let scatterData = data.map(function(d) {
      return {
        x: d[data.columns[8]],
        y: d[data.columns[i]],
        id: d[data.columns[0]],
        data: d
      }
    });

    scatterSvg.append("g")
                .attr("transform", `translate(${lMargin.left}, ${lMargin.top})`)
                .attr("id", scatterId + scatterSuffix)
              .selectAll("circle")
              .data(scatterData)
              .enter()
              .append("circle")
                .attr("class", d=> "circle dpoint-" + d.id)
                .attr("cx", d => scatterXscale(d.x))
                .attr("cy", d => scatterYscale(d.y))
                .attr("r", 2)
                .on("mouseover", d=> {
                    d3.selectAll(".dpoint-"+d.id)
                      .attr("r", 8);
                    drawBarChart(d.data);
                    d3.select("#individual-" + d.id)
                         .attr("height", cHeight*1.2);
                })
                .on("mouseout", d=> {
                    d3.selectAll(".dpoint-"+d.id)
                      .attr("r", 2);
                    d3.select("#individual-" + d.id)
                           .attr("height", cHeight);
                });

  }

  /* Choropleth */

  let chancesSvg = d3.select("#combined-choropleth")
                     .append("svg")
                        .attr("height", cFHeight)
                        .attr("width", cFWidth);

  let xcScale = d3.scaleLinear()
                  .domain(chancesExtent)
                  .range([0, cWidth]);

  let chancesColor = d3.interpolateGreens;

  let gradientId = "linear-gradient";

  // https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
  let chancesGradient = chancesSvg.append("defs")
                                  .append("linearGradient")
                                     .attr("id", gradientId)
                                     // horizontal gradient
                                     .attr("x1", "0%")
                                     .attr("y1", "0%")
                                     .attr("x2", "100%")
                                     .attr("y2", "0%");

  //Append multiple color stops by using D3's data/enter step
  chancesGradient.selectAll("stop")
     .data([
         {offset: "0%", color: chancesColor(chancesExtent[0])},
         {offset: "100%", color: chancesColor(chancesExtent[1])}
       ])
     .enter().append("stop")
     .attr("offset", function(d) { return d.offset; })
     .style("stop-color", function(d) { return d.color; });

  let chancesChoro = chancesSvg.append("g")
                                  .attr("transform", `translate(${cMargin.left}, ${cMargin.top})`)
                               .append("rect")
                                  .attr("width", cWidth)
                                  .attr("height", cHeight)
                                  .style("fill", `url(#${gradientId})`);

  let brush = d3.brushX()
                .extent([[cMargin.left, cMargin.top], [cWidth + cMargin.left, cHeight + cMargin.top]])
                .on("end", brushed);

  let slider = chancesSvg.append("g")
                        .call(brush);


  function brushed() {
    let selected = d3.event.selection;
    let extent = [xcScale.invert(selected[0]), xcScale.invert(selected[1])];

    let selectedData = data.filter(d => d[data.columns[8]] >= extent[0] && d[data.columns[8]] <= extent[1]);

    for(let i=1; i<7; i++) {
      let selectedValues = selectedData.map(d=>d[data.columns[i]]);
      let selectedYscale = d3.scaleLinear()
                             .domain(d3.extent(selectedValues))
                             .range([lHeight, 0]);

      let selectedXscale = d3.scaleLinear()
                             .domain(extent)
                             .range([0, lWidth]);

      let selectedLine = d3.line()
                           .x(d => selectedXscale(d.x))
                           .y(d => selectedYscale(d.y))
                           .curve(d3.curveLinear);


      let plotData = selectedData.map(function(d) {
        return {
          x: d[data.columns[8]],
          y: d[data.columns[i]],
          id: d[data.columns[0]],
          data: d
        }
      });

      // change the axes
      d3.select("#" + data.columns[i].replace(" ", "-") + xAxisSuffix)
        .transition()
        .call(d3.axisBottom(selectedXscale));

      d3.select("#" + data.columns[i].replace(" ", "-") + yAxisSuffix)
        .transition()
        .call(d3.axisLeft(selectedYscale));

      let circleSelection = d3.select("#" + data.columns[i].replace(" ", "-") + scatterSuffix)
                              .selectAll("circle")
                              .data(plotData);

      circleSelection.exit().remove();

      circleSelection.enter()
                     .append("circle")
                       .attr("class", d=> "circle dpoint-" + d.id)
                       .attr("r", 2)
                       .on("mouseover", d=> {
                           d3.selectAll(".dpoint-"+d.id)
                             .attr("r", 8);
                           drawBarChart(d.data);
                           d3.select("#individual-" + d.id)
                              .attr("height", cHeight*1.2);
                       })
                       .on("mouseout", d=> {
                           d3.selectAll(".dpoint-"+d.id)
                             .attr("r", 2);
                           d3.select("#individual-" + d.id)
                             .attr("height", cHeight);
                       })
                    .merge(circleSelection)
                       .attr("class", d=> "circle dpoint-" + d.id)
                       .attr("cx", d => selectedXscale(d.x))
                       .attr("cy", d => selectedYscale(d.y));



    }
  }

}
