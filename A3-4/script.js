//Declare Global Variables
var globalstates, winnerupdatedstatelist, winner, sliderUpdatedStatesList;
var state = 0;
var dropboxselectedrow;
var dropdownselectedValue = "0";
var width, height, projection, path, svg, div, lowColor, highColor, ramp;
var slideValue = 0;

$(document).ready(function(){
    init();
});


function disableDropDown() {
    $("#dropdown-select").prop("disabled", true);
}

function enableDropDown() {
    $("#dropdown-select").prop("disabled", false);
}

function disablewinnerradiobutton() {
    $('input:radio[name=radioclic]').prop("checked", false );
}

function disablecheckbox() {
    $('input[type="checkbox"]').prop('checked', false);
}


function performwinnerfilter() {
    var val = d3.select('input[name="radioclic"]:checked').property("value");

    if (val == "republican") {
        winnerupdatedstatelist = globalstates.filter(function (d) {
            winner = "R" ;
            return d.winner == "Republican";

        });
    }
    else if(val == "democratic") {
        winnerupdatedstatelist = globalstates.filter(function (d){
            winner = "D" ;
            return d.winner == "Democrat";
        });
    }
    else {
        winnerupdatedstatelist = [];
    }
}

function performpovertyfilter() {

    var value = [];
    var CBOne = 12, CBTwo = 15, CBThree = 18;
    var RangeMin = [0,CBOne,CBTwo,CBThree];
    var RangeMax = [CBOne,CBTwo,CBThree,100];
    var povertyupdatedlist = [];

    if(d3.select("#one").property("checked")){
        value[0] = "true";
    } else {
        value[0] = "false";
    }

     if(d3.select("#two").property("checked")) {
         value[1] = "true";
     } else {
         value[1] = "false";
     }

     if(d3.select("#three").property("checked")){
         value[2] = "true";
    } else {
         value[2] = "false";
     }

    if(d3.select("#four").property("checked")){
        value[3] = "true";
    }
    else {
        value[3] = "false"
    }

    value.forEach(function(d,i) {
        if (d == "true") {
            povertyupdatedlist = povertyupdatedlist.concat(globalstates.filter(function (d) {
                return d.personsBelowPoverty >= RangeMin[i] && d.personsBelowPoverty < RangeMax[i];
            }));
        }
    })

    return povertyupdatedlist;
}

var slideRange = ["Change Slider for Per Capita Income","$20,000 to $25,000","$25,000 to $30,000","$30,000 to $35,000","$35,000 to $40,000","$40,000 to $45,000"];
function performSliderFilter() {
    document.getElementById("range").innerHTML = slideRange[slideValue];
    inputValue = slideRange[slideValue];
   sliderUpdatedStatesList = globalstates.filter(function (d) {
        return d.perCapitaCategory == slideValue;
    });
}

function dropdownfilter() {

   var div = d3.select("body")
        .append("div");

   div.selectAll("p").remove();

   div.attr("class", "tooltipbox")
       .attr("id","tooltipbox")
       .style("opacity", 5)
       .append("p")
       .style("font-weight", "bold")
       .style("font-size", "14px")
       .text("State: " + dropboxselectedrow.stateName);

            if(dropdownselectedValue == 1){
                var ageString = ["Number of persons below 5 years: ", "Number of persons below 18 years: ", "Number of persons above 65: "];
                var ageData = [dropboxselectedrow.popBelow5, dropboxselectedrow.popBelow18, dropboxselectedrow.popAbove65];

                for (var idx = 0; idx < ageString.length; idx++)
                {
                    div.append("p")
                        .text(ageString[idx] + ageData[idx] + " million");
                }
            }
            else if(dropdownselectedValue == 2){
                var raceString = ["African American Population: ", "Caucasian Population: ", "Native American Population: ", "Asian Population: ", "Hawaiian Population: ", "Latin American Population: ", "Foreign Born Population: "];
                var raceData = [dropboxselectedrow.popBlack, dropboxselectedrow.popWhite, dropboxselectedrow.popNative, dropboxselectedrow.popAsian, dropboxselectedrow.popHawaiian, dropboxselectedrow.popLatino, dropboxselectedrow.popForeignBorn];

                for (var idx = 0; idx < raceString.length; idx++) {
                    div.append("p")
                        .text(raceString[idx] + raceData[idx] + "%");
                }
            }
            else if(dropdownselectedValue == 3) {
                var educationString = ["Number of persons completed High School: ", "Number of persons graduated with Bachelors degree: "];
                var educationData = [dropboxselectedrow.highSchoolHigher, dropboxselectedrow.bachelorHigher];

                for (var idx = 0; idx < educationString.length; idx++) {

                    div.append("p")
                        .text(educationString[idx] + educationData[idx] + "%");
                }
            }
            else if(dropdownselectedValue == 4) {
                var householdString = ["Number of Housing units: ", "Number of Households: ", "Home ownership rate: ", "Average persons per household: "];
                var householdData = [dropboxselectedrow.housingUnits, dropboxselectedrow.households, dropboxselectedrow.homeownRate, dropboxselectedrow.personsPerHousehold];

                for (var idx = 0; idx < householdString.length; idx++) {
                    div.append("p")
                        .text(householdString[idx] + householdData[idx]);
                }
            }
   }


function addflagstowinner(statesvg,projection) {

    var center_coordinates = projection([-112.0785,33.46764]);
    var circle = statesvg.selectAll("statepath")
        .data(winnerupdatedstatelist);

    statesvg.selectAll("circle").remove();

    circle.enter().append("circle");
        circle.attr("cx", function(d) { var x = projection([d.xcoordinates, d.ycoordinates]); return x[0] })
        .attr("cy", function(d) { var x = projection([d.xcoordinates, d.ycoordinates]); return x[1] })
        .attr("fill", function(d){
            if(winner == "R")
                return "red";
            else
                return "blue";
        })
        .attr("r", 5);
}

function drawvisforpoverty(newlist,statesvg) {
    var loopcount = 0;
    d3.json("us-states.json", function (json) {

        for (var i = 0; i < globalstates.length; i++) {
            // Grab State Name
            var dataState = globalstates[i].stateName;
            // Grab data value
            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {
                    // Copy the data value into the JSON
                    json.features[j].properties.winner = globalstates[i].winner;
                    json.features[j].properties.population = globalstates[i].population;
                }
            }
        }

        statesvg.selectAll("path")
            .data(json.features)
            .style("fill", function (d) {
                for (var j = 0; j < newlist.length; j++) {
                    if (newlist[j].id == d.id) {
                        return "#D12525";
                    }
                }

                if (state == "0") {
                    return "#808080";
                }
                else {
                    return ramp(d.properties.population);
                }
            })

    });
}


function drawvisforslider(statesvg) {

    d3.json("us-states.json", function (json) {

        statesvg.selectAll("path")
            .data(json.features)
            .style("stroke-width", "2")
            .style("stroke", function (d) {
                for (var j = 0; j < sliderUpdatedStatesList.length; j++) {
                        if (sliderUpdatedStatesList[j].id == d.id) {
                           return "#000000";
                        }
                    }
                });
    });
}



function loaddata() {
    // Assign csv to a local variable
    d3.csv("state_facts.csv", function (states) {
        states.forEach(function(d) {
            d.stateName = d.stateName;
            d.stateAbbr = d.stateAbbr;
            d.winner = d.winner;
            d.id = +d.id;
            d.population = +d.population;
            d.popBelow5 = +d.popBelow5;
            d.popBelow18 = +d.popBelow18;
            d.popAbove65 = +d.popAbove65;
            d.popFemale = +d.popFemale;
            d.popWhite = +d.popWhite;
            d.popBlack = +d.popBlack;
            d.popNative = +d.popNative;
            d.popAsian = +d.popAsian;
            d.popHawaiian = +d.popHawaiian;
            d.popLatino = +d.popLatino;
            d.popForeignBorn = +d.popForeignBorn;
            d.highSchoolHigher = +d.highSchoolHigher;
            d.bachelorHigher = +d.bachelorHigher;
            d.housingUnits = +d.housingUnits;
            d.homeownRate = +d.homeownRate;
            d.households = +d.households;
            d.personsPerHousehold = +d.personsPerHousehold;
            d.perCapita = +d.perCapita;
            d.medianHouseholdIncome = +d.medianHouseholdIncome;
            d.personsBelowPoverty = +d.personsBelowPoverty;
            d.landArea = +d.landArea;
            d.popPerSqMile = +d.popPerSqMile;
            d.xcoordinates = +d.xcoordinates;
            d.ycoordinates = +d.ycoordinates;
            d.perCapitaCategory = +d.perCapitaCategory;
        });
        globalstates = states;
     });
}

function  mapStates() {
        width = 960;
        height = 500;

// D3 Projection
        projection = d3.geo.albersUsa()
            .translate([width / 2, height / 2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US

// Define path generator
        path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
            .projection(projection);  // tell path generator to use albersUsa projection


//Create SVG element and append map to the SVG
        svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

// Append Div for tooltip to SVG
        div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

// Defining Color scales

     lowColor = '#f9f9f9';
     highColor = '#0000ff';
     ramp = d3.scale.linear()
         .domain([584153, 41802500])
         .range([lowColor, highColor]);


// Load in my states data!
        d3.csv("state_facts.csv", function (data) {

// Load GeoJSON data and merge with states data
            d3.json("us-states.json", function (json) {

// Loop through each state data value in the .csv file
                for (var i = 0; i < data.length; i++) {

                    // Grab State Name
                    var dataState = data[i].stateName;
                    // Grab data value
                    // Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++) {
                        var jsonState = json.features[j].properties.name;

                        if (dataState == jsonState) {
                            // Copy the data value into the JSON
                            json.features[j].properties.stateAbbr = data[i].stateAbbr;
                            json.features[j].properties.winner = data[i].winner;
                            json.features[j].properties.population = data[i].population;
                            json.features[j].properties.popBelow5 = data[i].popBelow5;
                            json.features[j].properties.popBelow18 = data[i].popBelow18;
                            json.features[j].properties.popAbove65 = data[i].popAbove65;
                            json.features[j].properties.popFemale = data[i].popFemale;
                            json.features[j].properties.popWhite = data[i].popWhite;
                            json.features[j].properties.popBlack = data[i].popBlack;
                            json.features[j].properties.popNative = data[i].popNative;
                            json.features[j].properties.popAsian = data[i].popAsian;
                            json.features[j].properties.popHawaiian = data[i].popHawaiian;
                            json.features[j].properties.popLatino = data[i].popLatino;
                            json.features[j].properties.popForeignBorn = data[i].popForeignBorn;
                            json.features[j].properties.highSchoolHigher = data[i].highSchoolHigher;
                            json.features[j].properties.bachelorHigher = data[i].bachelorHigher;
                            json.features[j].properties.housingUnits = data[i].housingUnits;
                            json.features[j].properties.homeownRate = data[i].homeownRate;
                            json.features[j].properties.households = data[i].households;
                            json.features[j].properties.personsPerHousehold = data[i].personsPerHousehold;
                            json.features[j].properties.perCapita = data[i].perCapita;
                            json.features[j].properties.medianHouseholdIncome = data[i].medianHouseholdIncome;
                            json.features[j].properties.personsBelowPoverty = data[i].personsBelowPoverty;
                            json.features[j].properties.landArea = data[i].landArea;
                            json.features[j].properties.popPerSqMile = data[i].popPerSqMile;
                            json.features[j].properties.perCapitaCategory = data[i].perCapitaCategory;
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
                    .style("fill", function (d) {

                        if (state == 0)
                            return  "#808080";
                         else {
                            // mapChoroPop();
                            return ramp(d.properties.population);

                        }
                    })

                    .on("click", function (d){
                        enableDropDown();

                        for(var i = 0; i < globalstates.length; i++){
                            if(globalstates[i].stateName == d.properties.name) {
                                dropboxselectedrow = globalstates[i];
                            }
                        }
                        if(dropdownselectedValue != "0") {
                            dropdownfilter();
                       }

                    })


                    .on("mouseover", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 1);
                        div.text(d.properties.name)
                            //div.append("p").text("Population: " + parseFloat(+d.properties.population/1000000) +"m")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })

                    // fade out tooltip on mouse out
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });


                svg.selectAll('.state-label')
                    .data(json.features)
                    .enter()
                    .append('text')
                    .each(function (d) {
                        d3.select(this)
                            .attr("transform", function (d) {
                                return "translate(" + path.centroid(d) + ")";
                            })
                            // .attr("dx", "-3em")
                            // .attr("dy", "-0.5em")
                            .attr("fill", "black")
                            .style("text-anchor", "end")
                            .text(function (d) {
                                return d.properties.stateAbbr;
                            });


                    });
            });
        });
    }


 function mapChoroPop() {

         d3.json("us-states.json", function (json) {

                 // add a legend
                 var w = 140, h = 300;

                 var key = d3.select("body")
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

                 var y = d3.scale.linear()
                     .range([h, 0])
                     .domain([584153, 41802500]);

                 var yAxis = d3.svg.axis()
                     .scale(y)
                     .orient("right");

                 key.append("g")
                     .attr("class", "y axis")
                     .attr("transform", "translate(41,10)")
                     .call(yAxis);
             });
 }



function init() {
    loaddata();
    disableDropDown();
    //Default Map of the US
    mapStates();

    //Invoked when a radio button for choropleth is selected or unselected
    d3.select("#choro-select").on("change", function(){
        d3.selectAll("svg").remove();

        var val = d3.select('input[name="radioclic2"]:checked').property("value");

        if (val == "usmap") {
            state = 0;
            mapStates();
        }
        else{
            state = 1;
            mapStates();
            mapChoroPop();
        }

        disableDropDown();
        disablewinnerradiobutton();
        disablecheckbox();
        $(".tooltipbox").remove();
        dropdownselectedValue = "0";
        slideValue = 0;
        $("#percapitaslide").val(0).slider("refresh");
        $('select option[value = "0"]').attr("selected",true);

    });


//Invoked when a radio button is selected or unselected
    d3.select("#winner-select").on("change", function(){
        performwinnerfilter();
        addflagstowinner(svg,projection);

    });

//Invoked when a checkbox is selected or unselected
    d3.select("#check-select").on("change", function(){
        var newlist =  performpovertyfilter();
        drawvisforpoverty(newlist,svg);
    });

//Invoked when a drop down option is selected
    d3.select("#dropdown-select").on("change", function(){
        var selectedOption = $("#dropdown-select option:selected");
        dropdownselectedValue = selectedOption.val();  // gets the selected value
        dropdownfilter();
    });

//Invoked when a slider is changed
    d3.select("#percapitaslide").on("input", function(){

        slideValue = this.value;
        performSliderFilter();
        drawvisforslider(svg);
    });
}

