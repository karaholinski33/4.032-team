//this height and width is the height and width of the whole section where our graph representations should go 
var margin1 = {t: 10, r: 40, b: 20, l: 30}; //this is an object
var width1 = d3.select('#graphDataRepresentations').node().clientWidth - margin1.r - margin1.l,
    height1 = (d3.select('#graphDataRepresentations').node().clientHeight ) - margin1.t - margin1.b;

console.log(width1);

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
d3.csv("/data/Population/ACSST5Y2016_S0101_with_ann_2018-01-24T215546EST_EDITED.csv", function(data) {
//    console.log(data);
});


var percentageOfPopulationByState;
var projectedBirthsPerState;

//this is the data set that i am using - just the total population of each state 
d3.csv("/data/Population/ACSST5Y2016_S0101_with_ann_2018-01-24T215546EST_EDITED.csv", function(d) {
      return {
        state: d["${dim.label}"],
        totalPopulation: +d["Total; Estimate; Total population"]
      };
    }, function(data) {
//      console.log(data);
    percentageOfPopulationByState = calculatePercentageOfPopulationByState(data);
    projectedBirthsPerState = calculateBirthsPerState(percentageOfPopulationByState);
    
    drawProjectedBirthsPerState(projectedBirthsPerState);
});



//Output of this function is a data set giving me state:percentage of population of the US
function calculatePercentageOfPopulationByState(data) {
    var totalUSPopulation = 0; 
    data.forEach(function(d) {
        totalUSPopulation += d.totalPopulation
    });
    console.log(totalUSPopulation);
    
    var populationPercentages = [];
    data.forEach(function(d) {
        var tempDict = {
            state: d.state,
            percentage: (d.totalPopulation / totalUSPopulation)
        };
        populationPercentages.push(tempDict);
    });
//    console.log(populationPercentages);
    return populationPercentages; 
}

///Output of this function is data set giving state: number of births per state
//Calculated using the Percentage of population by state and the projected births for 2019 data 
//I am only using one data point for this so im not going to bother loading the data in 
//data is the populationPercentageByState
function calculateBirthsPerState(data) {
    var projectedBirths2019 = 40944965; 
    
    var projectedBirthsPerState = [];
    data.forEach(function(d) {
        var tempDict = {
            state: d.state,
            projectedBirths: Math.ceil(d.percentage * projectedBirths2019)
        };
        projectedBirthsPerState.push(tempDict);
    });
//    console.log(projectedBirthsPerState);
    return projectedBirthsPerState;
}

//where actual map graph representation will be drawn 
//data is projectedBirthsPerState data set
function drawProjectedBirthsPerState(data){
    
var lowColor = '#FCCBA8'
var highColor = '#542772'

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width2 / 2, 300/ 2]) // translate to center of screen
  .scale([650]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("#birthMap")
  .append("svg")
  .attr("width", width2)
  .attr("height", 300);

//	var dataArray = [];
//	for (var d = 0; d < data.length; d++) {
//		dataArray.push(parseFloat(data[d].value))
//	}
    
    //d3.extent(todayWeather, function(d) {
//        return new Date(d.time *1000)
//    });

	var extentProjectedBirths = d3.extent(data, function(d) {
            return d.projectedBirths;
    });
    var minVal = extentProjectedBirths[0];
    var maxVal = extentProjectedBirths[1];
    
//	var maxVal = d3.max(data.projectedBirths)
	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
//    console.log("min value: " + minVal + " max value: " + maxVal );
	
  d3.json("data/us-states.json", function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

      // Grab State Name
      var dataState = data[i].state;

      // Grab data value 
      var dataValue = data[i].projectedBirths;

      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.name;

        if (dataState == jsonState) {

          // Copy the data value into the JSON
          json.features[j].properties.value = dataValue;

          // Stop looking through the JSON
          break;
        }
      }
    }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function(d) { return ramp(d.properties.value) });
    
		// add a legend
		var w = 140, h = 300;

		var key = d3.select("#birthKey")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("class", "legend");

		var legend = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", highColor)
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lowColor)
			.attr("stop-opacity", 1);

		key.append("rect")
			.attr("width", w - 100)
			.attr("height", h)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)");

		var y = d3.scaleLinear()
			.range([h, 0])
			.domain([minVal, maxVal]);

		var yAxis = d3.axisRight(y);

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)
  });
}