var sHpParam = "Has Lv40 R5 HP Neut",
	sAtkParam = "Has Lv40 R5 ATK Neut",
	sSpdParam = "Has Lv40 R5 SPD Neut",
	sDefParam = "Has Lv40 R5 DEF Neut",
	sResParam = "Has Lv40 R5 RES Neut";

var sNameParam = "HeroName",
	sWeaponParam = "WeaponType",
	sMovementParam = "MoveType";

var oColours = {	// Red, Orange, Green, Yellow, Blue
	"HP": "#FF2C0D",
	"ATK": "#E8950C",
	"SPD": "#0CE827",
	"DEF": "#FFFA00",
	"RES": "#00E2FF"
};

var stats = {
	"HP": sHpParam,
	"ATK": sAtkParam,
	"SPD": sSpdParam,
	"DEF": sDefParam,
	"RES": sResParam
};

var aChartTypes = [
	"Bar",
	"Scatterplot"
];

aUniqueStats = [];

var aDefaultSelectedStats = ["HP"];
var sDefaultSelectedChart = "Bar";

var attributes = {
	"Name": sNameParam,
	"Weapon Type": sWeaponParam,
	"Movement Type": sMovementParam
};

var oFetchedInfo;

var iTransitionTime = 500,	// Milliseconds
	iTransitionDelay = 50;	// Milliseconds

function createContent() {
	createFilterArea();
	getInfo();
}

function createFilterArea() {
	// Add both filter areas to content
	var sFilterAreaClass = "row";
	var oFilterHeading = $("<h2>", {
		html: "Filters",
		class: "row"
	});
	var oStatFilterArea = $("<div>", {
		id: "idStatFilters",
		class: "row",
	});
	var oAttributeFilterArea = $("<div>", {
		id: "idAttributeFilters",
		class: "row"
	});
	var oContentArea = $("#idContent");
	var oContent = $("<div>", {
		class: "container"
	});
	oContent.append(oFilterHeading);
	oContent.append(oStatFilterArea);
	oContent.append(oAttributeFilterArea);
	oContentArea.append(oContent);

	// Chart filter
	var oChartFilterContainer = $("<div>", {
		class: "container"
	});
	var oChartContainerHeading = $("<h4>", {
		html: "Chart Type",
		class: "row"
	});
	var oChartFilters = $("<div>", {
		class: "row"
	});

	aChartTypes.forEach(function (chart) {
		var checked = false;
		if (sDefaultSelectedChart == chart) {
			var checked = true;
		}
		var oRadioButtonContainer = $("<div>");
		var oChartTypeRadioButton = $("<input>", {
			class: "radiobutton",
			type: "radio",
			name: "chart",
			value: chart,
			checked: checked,
			disabled: true
		}).click(function () {
			changeChart(chart);
		});
	});

	// Stat filter
	var oStatFilterContainer = $("<div>", {
		class: "container"
	});
	var oStatHeading = $("<h4>", {
		html: "Stats",
		class: "row"
	});
	var oStatFilters = $("<div>", {
		class: "row"
	});
	Object.keys(stats).forEach(function (stat) {
		// Create checkboxes and labels
		var checked = false;
		if (aDefaultSelectedStats.indexOf(stat) >= 0) {
			checked = true;
		}
		var oContainer = $("<div>");
		var oStatCheckbox = $("<input>", {
			class: "checkbox stat",
			type: "checkbox",
			name: "stat",
			value: stat,
			checked: checked,
			disabled: true
		}).click(function () {
			changeStat(stat);
		});
		var oLabel = $("<span>", {
			html: stat,
			class: "label",
		});

		oContainer.append(oStatCheckbox)
			.append(oLabel);
		oStatFilters.append(oContainer);
	});
	oStatFilterContainer.append(oStatHeading);
	oStatFilterContainer.append(oStatFilters);
	oStatFilterArea.append(oStatFilterContainer);
}

function getInfo() {
	var oInfo;

	var sBaseUrl = "https://feheroes.gamepedia.com/api.php?action=ask&query=[[Category:Heroes]]";
	var sParams = "|?" + sHpParam + "|?" + sAtkParam + "|?" + sSpdParam + "|?" + sDefParam + "|?" + sResParam + "|limit=300&format=json";
	var sUrl = sBaseUrl + sParams;
	$.ajax({
		type: "GET",
		url: sUrl,
		crossDomain: true,
		dataType: "jsonp",
		success: function(oData) {
			oData.query.results = validateInfo(oData.query.results);
			oInfo = simplifyInfo(oData.query.results);
			oFetchedInfo = oInfo;
			createGraph(oFetchedInfo);
		},
		error: function() {
			showError();
		}
	});
}

function showError() {
	var oContent = d3.select("#idContent");

	var oErrorDiv = $("<div>", {
		innerHTML: "Error: Failed to make data request. Please check to see if https://feheroes.gamepedia.com responds."
	});
	oContent.append(oErrorDiv);
}

function simplifyInfo(oInfo) {
	var oInfo = oInfo ? oInfo : [];
	var oSimplifiedInfo = [];
	Object.keys(oInfo).forEach(function (name) {
		var oTemplate = resetTemplate();
		var oCharacterInfo = oTemplate;
		var sPrintoutPath = oInfo[name]['printouts'];
		oCharacterInfo.Attributes.Name = name;
		// Add stats to oCharacterInfo
		Object.keys(stats).forEach(function (stat) {
			oCharacterInfo["Stats"][stat] = parseInt(sPrintoutPath[stats[stat]][0]);
		});
		oCharacterInfo.BST = oCharacterInfo.Stats.HP + oCharacterInfo.Stats.ATK + oCharacterInfo.Stats.SPD + oCharacterInfo.Stats.DEF + oCharacterInfo.Stats.RES;
		if (oCharacterInfo.Stats.RES) {
			oSimplifiedInfo.push(oCharacterInfo);
		}
	});
	return oSimplifiedInfo;
}

function resetTemplate() {
	var oTemplate = {
		"Attributes": {
			"Name": ""
		},
		"Stats": {
			"HP": 0,
			"ATK": 0,
			"SPD": 0,
			"DEF": 0,
			"RES": 0
		},
		"BST": 0
	};
	return oTemplate;
}

// Visualises Stat vs. Number of Characters
function createGraph(oInfo) {
	var sGraphType = getGraphType();
	var aStatFilters = getStatFilters();
	var aAttributeFilters = getAttributeFilters();
	var oDataset = configureDataset(oInfo, sGraphType, aStatFilters, aAttributeFilters);

	var iTimeToDisable = (oDataset.length + d3.selectAll(".Bars").size()) * iTransitionDelay;
	disableFilters(iTimeToDisable);
	if (!oInfo) {
		return 0;
	}
	var oContent = $("#idContent");

	var margin = {
		top: 20,
		right: 60,		// 30
		bottom: 50,		// 30
		left: 60		// 40
	},
	width,
	height,
	x,
	y;

	if (d3.select("#idContent svg g").empty()) {
		width = oContent[0].clientWidth - margin.left - margin.right;
		height = oContent[0].clientHeight - margin.top - margin.bottom;

		var oChart = d3.select("#idContent").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	} else {
		var oChart = d3.select("#idContent svg");
		width = oChart.attr("width") - margin.left - margin.right;
		height = oChart.attr("height") - margin.top - margin.bottom;
		oChart = oChart.select("g");
	}

	x = d3.scaleBand().range([0, width])
		.padding(0.1);
	y = d3.scaleLinear().range([height, 0]);

	var xDomain = getXDomain(oDataset);
	var yDomain = getYDomain(oDataset);
	x.domain(xDomain);
	y.domain(yDomain);
	
	var yTooltipOffset = 25;

	var iNumStatFilters = aStatFilters.length;
	var oBarLength = x.bandwidth() / iNumStatFilters;
	var oBars = oChart.selectAll(".Bar")
		.data(oDataset);

	aUniqueStats = [];

	// Move bars
	var oExistingBars = d3.selectAll(".Bar");
	oExistingBars
		.transition()
		.duration(iTransitionTime)
		.delay(function (d, i) {
			return i * iTransitionDelay;
		})
		.attr("class", function (d, i) {
			if (i > oDataset.length - 1) {
				return "Remove";
			}
			return "Bar " + d.stat;
		})
		.style("fill", function (d, i) {
			if (i > oDataset.length - 1) {
				return "white";
			}
			return oColours[d.stat]; 
		})
		.attr("x", function (d) { 
			var val = x(d.x) ? x(d.x) + (calcDx(d.stat, oBarLength)) : x(d3.max(xDomain));
			if (val) {
				return val;
			}
		})
		.attr("y", function (d, i) {
			if (i > oDataset.length - 1) {
				return height;
			}
			return d.characters ? y(d.characters.length) : 0;
		})
		.attr("height", function (d, i) {
			if (i > oDataset.length - 1) {
				return 0;
			}
			return d.characters ? height - y(d.characters.length) : 0;
		})
		.attr("width", function (d, i) {
			if (i > oDataset.length - 1) {
				return 0;
			}
			return oBarLength;
		})
		.filter(function (d, i) {
			return i > oDataset.length - 1;
		})
		.remove(function () {
		});

	// Add new bars
	oBars.enter().append("rect")
		.attr("class", function (d) { return "Bar " + d.stat; })
		.style("fill", function (d) { return oColours[d.stat]; })
		.attr("x", function (d) { return x(d.x) + (calcDx(d.stat, oBarLength)); })
		.attr("y", function (d) { return height; })
		.attr("width", oBarLength)
		.on("mouseover", function (d) {
			var oTooltip = d3.select("#idContent").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);
			oTooltip.transition()
				.duration(200)
				.style("opacity", 0.9);
			var sHtmlCharacterString = getHtmlCharacterString(d);
			oTooltip.html("<b>" + d.characters.length + " character(s) with " + d.x + " " + d.stat + "</b><br/>" + sHtmlCharacterString)
				.style("left", x(d.x) + margin.left + (0.7 * $(".tooltip")[0].clientWidth) + "px")	// Tooltip offset calculated on the fly
				.style("top", y(d.characters.length) + margin.top + $("#idStatFilters")[0].clientHeight + $("#idHeader")[0].clientHeight
					+ yTooltipOffset + "px");
		})
		.on("mouseout", function (d) {
			var oTooltip = d3.selectAll(".tooltip");
			oTooltip.transition()
				.duration(500)
				.style("opacity", 0)
				.remove();
		})
		.transition()
		.duration(function (d) {
			return iTransitionTime;
		})
		.delay(function (d, i) {
			return i * iTransitionDelay;
		})
		.attr("y", function (d) { return d.characters ? y(d.characters.length) : 0; })
		.attr("height", function (d) { return d.characters ? height - y(d.characters.length) : 0; })

	var xAxisText = getXAxisString(aStatFilters);
	var axisFontSize = 18;	// TODO: Un-hardcode

	oChart.selectAll("g .axis").remove();
	oChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.append("text")
		.attr("class", "axisHeading")
		.attr("x", (width) / 2)
		.attr("dy", margin.bottom / 2 + axisFontSize / 2)
		.text(xAxisText);

	oChart.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("class", "axisHeading")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Number of Heroes");
}

function calcDx(stat, oBarLength) {
	var index = aUniqueStats.indexOf(stat);
	if (index >= 0) {
		return index * oBarLength;
	} else {
		aUniqueStats.push(stat);
		return (aUniqueStats.length - 1) * oBarLength;
	}
}

function getHtmlCharacterString(object) {
	var sHtmlCharacterString = "";
	var stat = object.stat;

	object.characters.forEach(function (name) {
		sHtmlCharacterString += name + "<br/>";
	});

	return sHtmlCharacterString;
}

function getXAxisString(aStatFilters) {
	var sAxisString = "";
	for (var i = 0; i < aStatFilters.length; i++) {
		switch(i) {
			case 0:
				sAxisString += aStatFilters[i];
				break;
			case (aStatFilters.length - 1):
				sAxisString += " and " + aStatFilters[i];
				break;
			default:
				sAxisString += ", " + aStatFilters[i];
				break;
		}
	}
	return sAxisString;
}

function getStatFilters() {
	var aStatFilters = [];
	var aStatCheckboxes = $(".stat");
	for (var i = 0; i < aStatCheckboxes.length; i++) {
		if (aStatCheckboxes[i].checked) {
			aStatFilters.push(aStatCheckboxes[i].value);
		}
	}
	return aStatFilters;
}

function getGraphType() {
	return "Bar";
}

function getAttributeFilters() {
	return [];
}

function configureDataset(oInfo, sGraphType, aStatFilters, aAttributeFilters) {
	var sStatFilter = aStatFilters[0];
	var oDataset = [];
	// Populate dataset to begin
	oDataset.push({
		stat: sStatFilter,
		x: oInfo[0]["Stats"][sStatFilter],
		characters: [oInfo[0]["Attributes"]["Name"]]
	});
	switch(sGraphType) {
		case "Bar":
			oInfo.forEach(function (character) {
				Object.keys(character["Stats"]).forEach(function (stat) {
					// If stat exists in StatFilters
					if (aStatFilters.indexOf(stat) >= 0) {
						for (var i = 0; i < oDataset.length; i++) {
							// If xValue exists and is correct stat
							if (character["Stats"][stat] == oDataset[i].x && stat == oDataset[i].stat) {
								oDataset[i].characters.push(character["Attributes"]["Name"]);
								break;
							}
							// If xValue does not exist and at the end of loop
							else if (!(oDataset[i].x == character["Stats"][stat]) && i == oDataset.length - 1) {
								oNewObj = {
									stat: stat,
									x: character["Stats"][stat],
									characters: [character["Attributes"]["Name"]]
								};
								oDataset.push(oNewObj);
								break;
							}
						}
					}
				});
			});
			oDataset = sortDataset(oDataset);
			return oDataset;
	}
}

function sortDataset(oDataset) {
	for (var i = 0; i < oDataset.length - 1; i++) {
		for (var j = 0; j < oDataset.length -1; j++) {
			if (oDataset[j].x > oDataset[j + 1].x) {
				var prev = oDataset[j];
				var next = oDataset[j + 1];
				oDataset[j] = next;
				oDataset[j + 1] = prev;
			}
		}
	}
	return oDataset;
}

function changeStat(sStat) {
	var aStatFilters = getStatFilters();
	if (aStatFilters.length == 0) {
		var oStatCheckboxes = $(".stat");
		for (var i = 0; i < oStatCheckboxes.length; i++) {
			if (oStatCheckboxes[i].value == sStat) {
				oStatCheckboxes[i].checked = true;
			}
		}
	}
	redraw();
}

function changeChart(sChart) {
	
}

function changeAttribute() {

}

function getXDomain(oDataset) {
	var aMap = [];
	var highestX = 0;
	oDataset.forEach(function (entry) {
		aMap.push(entry.x);
		if(entry.x > highestX) {
			highestX = entry.x;
		}
	});
	return aMap.sort();
}

function getYDomain(oDataset) {
	var minValue = 0;
	var maxValue = 0;
	oDataset.forEach(function (stat) {
		if (stat.characters.length > maxValue) {
			maxValue = stat.characters.length;
		}
	})
	return [minValue, maxValue];
}

function redraw() {
	if (oFetchedInfo) {
		createGraph(oFetchedInfo);
	}
}

$(window).resize(function() {
	$("svg").remove();
	if (oFetchedInfo) {
		createGraph(oFetchedInfo);
	}
});

function disableFilters(iTimeToDisable) {
	d3.selectAll("input")
		.attr("disabled", true);
	setTimeout(function () {
		d3.selectAll("input")
			.attr("disabled", null);
	}, iTimeToDisable);
}

function validateInfo(oResults) {
	if (!oResults.Abel.printouts["Has Lv40 R5 HP Neut"][0]) {
		// Create dummy data
		Object.keys(oResults).forEach(function (hero) {
			Object.keys(oResults[hero].printouts).forEach(function (stat) {
				oResults[hero].printouts[stat] = [Math.floor((Math.random() * 40) + 30)];
			});
		});
		// Display info disclaimer
		displayDisclaimer();
	}
	return oResults;
}

function displayDisclaimer() {
	var oDisclaimerHeading = $("<h5>", {
		html: "Disclaimer: The information below is dummy data created on the fly because the wiki APIs are either unresponsive or sending back blank data. This is not real data.",
		class: "mx-auto"
	});
	$("#idHeader").append($("<br/>")).append(oDisclaimerHeading);
}