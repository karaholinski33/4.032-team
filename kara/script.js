//this height and width is the height and width of the whole section where our graph representations should go 
var margin1 = {t: 10, r:0, b: 20, l: 80}; //this is an object
var width1 = d3.select('#graphDataRepresentations').node().clientWidth - margin1.r - margin1.l,
    //height1 = (d3.select('#graphDataRepresentations').node().clientHeight ) - margin1.t - margin1.b;
    height1 = 500;

console.log(width1);
console.log(height1)

var birthPerStatePlot = d3.select('#graphDataRepresentations');


//this width height should be just for the birth per state graph  (making it 1/3 of the height)
//var plot1 = d3.select('#birthPerState') // if we select a html id #name, if we select a class .name
//    .append('svg')
//    .attr('width', width1 + margin1.r + margin1.l)
//    .attr('height', height1 + margin1.t + margin1.b);

var margin2 = {t: 0, r: 40, b: 20, l: 40}; 
var width2 = d3.select('#birthPerState').node().clientWidth - margin2.r - margin2.l,
    height2 = (d3.select('#birthPerState').node().clientHeight) - margin2.t - margin2.b;

//this is the entire data set 
d3.csv("/data/Population/Projected Births 2016 to 2060.csv", function(data) {
    console.log(data);
});

/*
var input_set;
d3.csv("/data/Population/Projected Births 2016 to 2060.csv", function(dataset) {
    var input_set = dataset.forEach(function(d) {                    // NEW
        d.births = +d.BIRTHS;                            // NEW
        d.year = d.YEAR;
    alert(input_set)
    //.key(function(dataset) { return d.year; })
    //.entries(input_set);
   // console.log(JSON.stringify(expensesByYear))
    })
    });
    */



d3.csv("/data/Population/Projected Births 2016 to 2060.csv", function(error, csv_data) {
 var data = d3.nest()
  .key(function(d) { return +d.YEAR + 5;})
  .rollup(function(d) { 
   return d3.sum(d, function(g) {return g.BIRTHS; });
  }).entries(csv_data);
    data = data.slice(0,15)
    console.log(data);
    // set the ranges
    var x = d3.scaleBand()
          .range([0, width1])
          .padding(0.1);
    var y = d3.scaleLinear()
          .range([height1, 0]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
    .attr("width", width1 + margin1.l + margin1.r)
    .attr("height", height1 + margin1.t + margin1.b)
    .append("g")
    .attr("transform", 
          "translate(" + margin1.l + "," + margin1.t + ")");
    console.log(height1)
    console.log(width1)
    console.log(margin1.l)

    



  // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return Object.values(d)[0]; }));
    y.domain([28300000, d3.max(data, function(d) { return Object.values(d)[1]; })]);

  // append the rectangles for the bar chart
    console.log(data)
    console.log('hi')
  svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(Object.values(d)[0]); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(Object.values(d)[1]); })
      .attr("height", function(d) { return height1 - y(Object.values(d)[1]); });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height1 + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));
     });