load_income_data();

function abbrState(input){
    var states = {
        "Arizona":"AZ",
        "Alabama":"AL",
        "Alaska":"AK",
        "Arkansas":"AR",
        "California":"CA",
        "Colorado":"CO",
        "Connecticut":"CT",
        "Delaware":"DE",
        "District Of Columbia":"DC",
        "Florida":"FL",
        "Georgia":"GA",
        "Hawaii":"HI",
        "Idaho":"ID",
        "Illinois":"IL",
        "Indiana":"IN",
        "Iowa":"IA",
        "Kansas":"KS",
        "Kentucky":"KY",
        "Louisiana":"LA",
        "Maine":"ME",
        "Maryland":"MD",
        "Massachusetts":"MA",
        "Michigan":"MI",
        "Minnesota":"MN",
        "Mississippi":"MS",
        "Missouri":"MO",
        "Montana":"MT",
        "Nebraska":"NE",
        "Nevada":"NV",
        "New Hampshire":"NH",
        "New Jersey":"NJ",
        "New Mexico":"NM",
        "New York":"NY",
        "North Carolina":"NC",
        "North Dakota":"ND",
        "Ohio":"OH",
        "Oklahoma":"OK",
        "Oregon":"OR",
        "Pennsylvania":"PA",
        "Puerto Rico":"PR",
        "Rhode Island":"RI",
        "South Carolina":"SC",
        "South Dakota":"SD",
        "Tennessee":"TN",
        "Texas":"TX",
        "Utah":"UT",
        "Vermont":"VT",
        "Virginia":"VA",
        "Washington":"WA",
        "West Virginia":"WV",
        "Wisconsin":"WI",
        "Wyoming":"WY"
    };

    input = input.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

        return states[input];
}

function load_income_data() {

    d3.csv("data/Income/ACS_16_1YR_R1901.US01PRF_with_ann.csv", function(data) {

        // extract states
        var states = _.map(data, function (d) {
            return abbrState(d["Geographical Area"]);
        });

        // extract incomes
        var incomes =  _.map(data, function (d) {
            return parseFloat(d["Dollar"]);
        });

        // get scale for income
        var max   = d3.max(incomes);
        var min   = d3.min(incomes);
        
        
        
        var scale = d3.scaleLinear().domain([0, max]).range([0, 95]);

        // normalize income to be between 0 and 100
        incomes =  _.map(incomes, function (i) {
            return scale(i);
        });

        load_private_school_data(states, incomes);
   });
}

function load_private_school_data(states, incomes) {
    // Private school data query in csv
    var private_school_percent_query = "Percent in private school; Estimate; Population 3 years and over enrolled in school";

    // Read private school data
    d3.csv("data/Education/ACSST5Y2016_S1401_with_ann_2018-01-24T215322EST_EDITED.csv", function(data) {

        // extract private school percentages
        var privates =  _.map(data, function (d) {
            return parseFloat(d[private_school_percent_query]);
        });

        // get scale for private school
        var max   = d3.max(privates);
        var min   = d3.min(privates);
        
        var scale = d3.scaleLinear().domain([0, max]).range([0, 95]);

        // combine state, income, and private school data
        var output = _.map(data, function (d) {

            var private_school = scale(parseFloat(d[private_school_percent_query]));
            var state_abbr     = abbrState(d.state);
            var income         = incomes[states.indexOf(state_abbr)];

            return {
                state: state_abbr,
                private: private_school,
                income: income       }
        });

        // draw graph
        draw(output);
    });
}

function draw(data) {
    // order data by largest income
    data = _.sortBy(data, function (d) {
        return -d.income   });

    // place to containers for the bar graph in the html file
    var containers = d3.select('#graph')
        .selectAll('div')
        .data(data).enter()
        .append('div')
        .attr("class", "data-container");

    // add each component to the container
    var income_containers = containers.append("div").attr("class", "bar-holder");
    var state_container   = containers.append("div").attr("class", "state-holder");
    var private_container = containers.append("div").attr("class", "bar-holder");

    // add the state abbr
    state_container.append('span').text(function (d) {
        return d.state;
    });

    // add the income graph
    income_containers
        .append('div')
        .attr("class", "income-bar")
        .style("width", function (d) {
            return d.income + "%";
        });

    // add the private school graph
    private_container
        .append('div')
        .attr("class", "private-bar")
        .style("width", function (d) {
            return d.private + "%";
        });
}