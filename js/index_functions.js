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
	var sId = "idChart";
	var oSvg = $("<svg>", {
		id: sId
	});
	$("#idContent").append(oSvg);

	var sGraphType = getGraphType();
	var sStatFilter = getStatFilter();
	var aAttributeFilters = getAttributeFilters();

	var margin = {
		top: 20,
		right: 30,
		bottom: 30,
		left: 40
	},
		width = 960 - margin.left - margin.right;
		height = 500 - margin.top - margin.bottom;

	var x = d3.scaleBand().rangeRound([0, width], 0.1);
	var y = d3.scaleLinear().range([height, 0]);

	var xAxis = d3.axisBottom()
		.scale(x);

	var yAxis = d3.axisLeft()
		.scale(y);

	var oChart = d3.select("#idChart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var o
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