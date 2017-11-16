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

// Maps Stat vs. Number of Characters
function createGraph(oInfo) {
	var sDefaultStatFilter = "HP";
	var aAttributeFilters = [];
}