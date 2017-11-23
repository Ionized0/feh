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

var aDefaultSelectedStats = ["HP"];

var attributes = {
	"Name": sNameParam,
	"Weapon Type": sWeaponParam,
	"Movement Type": sMovementParam
};

var filterTypes = [
	"Stats",
	"Attributes"
];

var oFetchedInfo;

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
			checked: checked
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
			oInfo = simplifyInfo(oData.query.results);
			oFetchedInfo = oInfo;
			createGraph(oFetchedInfo);
		}
	});
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
	if (!oInfo) {
		return 0;
	}
	var oContent = $("#idContent");

	var sGraphType = getGraphType();
	var aStatFilters = getStatFilters();
	var aAttributeFilters = getAttributeFilters();

	var margin = {
		top: 20,
		right: 60,		// 30
		bottom: 50,		// 30
		left: 60		// 40
	},
		width = oContent[0].clientWidth - margin.left - margin.right;
		height = oContent[0].clientHeight - margin.top - margin.bottom;

	var x = d3.scaleBand().range([0, width])
		.padding(0.1);
	var y = d3.scaleLinear().range([height, 0]);

	var oChart = d3.select("#idContent").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var oDataset = configureDataset(oInfo, sGraphType, aStatFilters, aAttributeFilters);

	var xDomain = getXDomain(oDataset);
	var yDomain = getYDomain(oDataset);
	x.domain(xDomain);
	y.domain(yDomain);

	var iNumStatFilters = aStatFilters.length;
	var oBarLength = x.bandwidth() / iNumStatFilters;
	var oBars = oChart.selectAll(".bar")
		.data(oDataset);
	aStatFilters.forEach(function (sStatFilter, index) {
		var dx = index * oBarLength;
		oBars.enter().append("rect")
			.attr("class", "bar " + sStatFilter)
			.style("fill", oColours[sStatFilter])
			.attr("x", function (d) { return x(d.x) + dx; })
			.attr("y", function (d) { return y(d.y[sStatFilter]); })
			.attr("height", function (d) { return height - y(d.y[sStatFilter]); })
			.attr("width", oBarLength)
	});

	var xAxisText = getXAxisString(aStatFilters);
	var axisFontSize = $(".axisHeading").css("font-size");
	oChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.append("text")
		.attr("class", "axisHeading")
		.attr("x", (width) / 2)
		.attr("dy", margin.bottom / 2 + 18 / 2)		// TODO: Un-hardcode
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
		x: oInfo[0]["Stats"][sStatFilter],
		y: {
			"HP": 1
		}
	});
	switch(sGraphType) {
		case "Bar":
			oInfo.forEach(function (character) {
				Object.keys(character["Stats"]).forEach(function (stat) {
					if (aStatFilters.indexOf(stat) >= 0) {
						for (var i = 0; i < oDataset.length; i++) {
							// If xValue exists and yValue exists
							if (character["Stats"][stat] == oDataset[i].x && oDataset[i].y[stat]) {
								oDataset[i].y[stat]++;
								break;
							}
							// If xValue exists but yValue does not exist
							else if (character["Stats"][stat] == oDataset[i].x) {
								oDataset[i].y[stat] = 1;
								break;
							}
							// If xValue does not exist and at the end of loop
							else if (!(oDataset[i].x == character["Stats"][stat]) && i == oDataset.length - 1) {
								oNewObj = {
									x: character["Stats"][stat],
									y: {}
								};
								oNewObj.y[stat] = 1;
								oDataset.push(oNewObj);
								break;
							}
						}
					}
				});
			});
			return oDataset;
	}
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

function changeAttribute() {

}

function getXDomain(oDataset) {
	var aMap = [];
	oDataset.forEach(function (entry) {
		aMap.push(entry.x);
	});
	return aMap.sort();
}

function getYDomain(oDataset) {
	var minValue = 0;
	var maxValue = 0;
	oDataset.forEach(function (stat) {
		Object.keys(stat.y).forEach(function (sStatFilter) {
			if (stat.y[sStatFilter] > maxValue) {
				maxValue = stat.y[sStatFilter];
			}
		});
	})
	return [minValue, maxValue];
}

function redraw() {
	$("svg").remove();
	createGraph(oFetchedInfo);
	getStatFilters();
}

$(window).resize(function() {
	$("svg").remove();
	createGraph(oFetchedInfo);
});