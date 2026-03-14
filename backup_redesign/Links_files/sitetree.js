/* [nodename, id, name, navigationtext, href, isnavigation, childs[], templatename] */

if (typeof(decodeURIComponent) == 'undefined') {
  decodeURIComponent = function(s) {
    return unescape(s);
  }
}

function jdecode(s) {
    s = s.replace(/\+/g, "%20")
    return decodeURIComponent(s);
}

var POS_NODENAME=0;
var POS_ID=1;
var POS_NAME=2;
var POS_NAVIGATIONTEXT=3;
var POS_HREF=4;
var POS_ISNAVIGATION=5;
var POS_CHILDS=6;
var POS_TEMPLATENAME=7;
var theSitetree=[];
var siteelementCount=0;
theSitetree.topTemplateName='Fields';
theSitetree.paletteFamily='0D0D0D';
theSitetree.keyvisualId='11289';
theSitetree.keyvisualName='kv_11289.jpg';
theSitetree.fontsetId='31968';
theSitetree.graphicsetId='13806';
theSitetree.contentColor='F5F3F3';
theSitetree.contentBGColor='0D0D0D';
var localeDef={
  language: 'en',
  country: 'US'
};
var theTemplate={
				name: 			'Fields',
				paletteFamily: 	'0D0D0D',
				keyvisualId: 	'11289',
				keyvisualName: 	'kv_11289.jpg',
				fontsetId: 		'31968',
				graphicsetId: 	'13806',
				contentColor: 	'F5F3F3',
				contentBGColor: '0D0D0D',
				hasFlashNavigation: 'false',
				hasFlashLogo: 	'false',
				hasFlashCompanyname: 'false',
				hasFlashElements: 'false',
				hasCompanyname: 'false',
				a_color: 		'000000',
				b_color: 		'000000',
				c_color: 		'000000',
				d_color: 		'000000',
				e_color: 		'000000',
				f_color: 		'000000',
				hasCustomLogo: 	'false',
				contentFontFace:'Arial, Helvetica, sans-serif',
				contentFontSize:'12',
				useFavicon:     'false'
			  };
var webappMappings = {};
var canonHostname = 'wsc1.brinkster.com';
var accountId     = 'ABR330INZ01N';
var companyName   = 'Ziyan+Wu';
var htmlTitle	  = '';
var metaKeywords  = '';
var metaContents  = '';
theSitetree.getById = function(id, ar) {
	if (typeof(ar) == 'undefined'){
		ar = this;
	}
	for (var i=0; i < ar.length; i++) {
		if (ar[i][POS_ID] == id){
			return ar[i];
		}
		if (ar[i][POS_CHILDS].length > 0) {
			var result=this.getById(id, ar[i][POS_CHILDS]);
			if (result != null){
				return result;
			}
		}
	}
	return null;
};

theSitetree.getParentById = function(id, ar) {
	if (typeof(ar) == 'undefined'){
		ar = this;
	}
	for (var i=0; i < ar.length; i++) {
		for (var j = 0; j < ar[i][POS_CHILDS].length; j++) {
			if (ar[i][POS_CHILDS][j][POS_ID] == id) {
				// child found
				return ar[i];
			}
			var result=this.getParentById(id, ar[i][POS_CHILDS]);
			if (result != null){
				return result;
			}
		}
	}
	return null;
};

theSitetree.getName = function(id) {
	var elem = this.getById(id);
	if (elem != null){
		return elem[POS_NAME];
	}
	return null;
};

theSitetree.getNavigationText = function(id) {
	var elem = this.getById(id);
	if (elem != null){
		return elem[POS_NAVIGATIONTEXT];
	}
	return null;
};

theSitetree.getHREF = function(id) {
	var elem = this.getById(id);
	if (elem != null){
		return elem[POS_HREF];
	}
	return null;
};

theSitetree.getIsNavigation = function(id) {
	var elem = this.getById(id);
	if (elem != null){
		return elem[POS_ISNAVIGATION];
	}
	return null;
};

theSitetree.getTemplateName = function(id, lastTemplateName, ar) {
	if (typeof(lastTemplateName) == 'undefined'){
		lastTemplateName = this.topTemplateName;
	}
	if (typeof(ar) == 'undefined'){
		ar = this;
	}
	for (var i=0; i < ar.length; i++) {
		var actTemplateName = ar[i][POS_TEMPLATENAME];
		if (actTemplateName == ''){
			actTemplateName = lastTemplateName;
		}
		if (ar[i][POS_ID] == id) {
			return actTemplateName;
		}
		if (ar[i][POS_CHILDS].length > 0) {
			var result=this.getTemplateName(id, actTemplateName, ar[i][POS_CHILDS]);
			if (result != null){
				return result;
			}
		}
	}
	return null;
};

theSitetree.getByXx = function(lookup, xx, ar) {
    if (typeof(ar) == 'undefined'){
    	ar = this;
    }
    for (var i=0; i < ar.length; i++) {
        if (ar[i][xx] == lookup){
        	return ar[i];
        }
        if (ar[i][POS_CHILDS].length > 0) {
        	var result=this.getByXx(lookup, xx, ar[i][POS_CHILDS]);
            if (result != null){
                return result;
               }
        }
    }
    return null;
};

function gotoPage(lookup) {
	if(__path_prefix__ == "/servlet/CMServeRES" && typeof (changePage) == 'function'){
		changePage(lookup);
		return;
	}
	var page = theSitetree.getHREF(lookup);
	if (!page) {
		var testFor = [ POS_NAME, POS_NAVIGATIONTEXT ];
		for (var i=0 ; i < testFor.length ; i++) {
			var p = theSitetree.getByXx(lookup, testFor[i]);
			if (p != null) {
				page = p[POS_HREF];
				break;
			}
		}
	}
	document.location.href = (new URL(__path_prefix__ + page, true, true)).toString();
};
