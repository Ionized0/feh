var sHpParam = "Has Lv40 R5 HP Neut",
	sAtkParam = "Has Lv40 R5 ATK Neut",
	sSpdParam = "Has Lv40 R5 SPD Neut",
	sDefParam = "Has Lv40 R5 DEF Neut",
	sResParam = "Has Lv40 R5 RES Neut";

function createContent() {
	getInfo();
}

function changeDivText(div_id, text) {
	$(div_id).html(text);
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
			// TODO: Pass this to another function to visualise data
			createGraph(oInfo);
		}
	});
}

function simplifyInfo(oInfo) {
	var oInfo = oInfo ? oInfo : [];
	var oSimplifiedInfo = [];
	Object.keys(oInfo).forEach(function (name) {
		var oTemplate = resetTemplate();
		var oCharacterInfo = oTemplate;
		oCharacterInfo.Attributes.Name = name;
		oCharacterInfo.HP = parseInt(oInfo[name]['printouts'][sHpParam][0]);
		oCharacterInfo.ATK = parseInt(oInfo[name]['printouts'][sAtkParam][0]);
		oCharacterInfo.SPD = parseInt(oInfo[name]['printouts'][sSpdParam][0]);
		oCharacterInfo.DEF = parseInt(oInfo[name]['printouts'][sDefParam][0]);
		oCharacterInfo.RES = parseInt(oInfo[name]['printouts'][sResParam][0]);
		oCharacterInfo.BST = oCharacterInfo.HP + oCharacterInfo.ATK + oCharacterInfo.SPD + oCharacterInfo.DEF + oCharacterInfo.RES;
		if (oCharacterInfo.RES) {
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
		"HP": 0,
		"ATK": 0,
		"SPD": 0,
		"DEF": 0,
		"RES": 0,
		"BST": 0
	};
	return oTemplate;
}

// Visualises Stat vs. Number of Characters
function createGraph(oInfo, sGraphType, sStatFilter, aAttributeFilters) {
	console.log(oInfo);
	var oContent = $("#idContent");

	var sGraphType = getGraphType();
	var sStatFilter = getStatFilter();
	var aAttributeFilters = getAttributeFilters();

	var margin = {
		top: 20,
		right: 30,
		bottom: 30,
		left: 40
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

	var oDataset = configureDataset(oInfo, sGraphType, sStatFilter, aAttributeFilters);
	console.log(oDataset);

	var xDomain = getXDomain(oDataset);
	x.domain(xDomain);
	y.domain([0, d3.max(oDataset, function (d) { return d.y; })]);

	oChart.selectAll(".bar")
		.data(oDataset)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function (d) { return x(d.x); })
		.attr("y", function (d) { return y(d.y); })
		.attr("height", function (d) { return height - y(d.y); })
		.attr("width", x.bandwidth());

	oChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	oChart.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("class", "axisHeading")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.style("text-anchor", "end")
		.text("Number of Heroes");
}

function getGraphType() {
	return "Bar";
}

function getStatFilter() {
	return "HP";
}

function getAttributeFilters() {
	return [];
}

function configureDataset(oInfo, sGraphType, sStatFilter, aAttributeFilters) {
	var oDataset = [];
	oDataset.push({
		x: oInfo[0][sStatFilter],
		y: 0
	});
	switch(sGraphType) {
		case "Bar":
			oInfo.forEach(function (character) {
				for (var i = 0; i < oDataset.length; i++) {
					if(oDataset[i].x == character[sStatFilter]) {
						oDataset[i].y++;
						break;
					} else if(i == oDataset.length - 1) {	// If not exists AND at end of loop
						oDataset.push({
							x: character[sStatFilter].toString(),
							y: 0
						});
					}
				}
			});
			return oDataset;
		default:
			break;
	}
}

function getXDomain(oDataset) {
	var aMap = [];
	oDataset.forEach(function (entry) {
		aMap.push(entry.x);
	});
	return aMap.sort();
}