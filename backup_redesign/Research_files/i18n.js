/*
	I18N:
		requires /res/js/util/strftime.js

	I18N.load: (with param.mode != "preload")
		requires /res/js/util/scriptLoader.js

	I18N.setTextLabels:
		requires /res/prototype/prototype.js

*/

var __I18N_singletonMode = (typeof(I18N_singletonMode) != "undefined" && I18N_singletonMode === true);
if (!__I18N_singletonMode
 || typeof(I18N) == "undefined")
{
    I18N = {
			/* ======================================= */

			language  : getTopWindow().theLanguage || "en",
			country	  : getTopWindow().theCountry  || "US",
			useTopWnd : true,
			langObjects : new Object(),


			/* ======================================= */
			_DEBUG_ : false,

			_getNSObj : function(namespace, noautoload) {
				var topWnd = getTopWindow();

				if (!I18N.useTopWnd || !topWnd.I18N)
					topWnd = window;

				// Current language: local I18N object, __not__ topWnd.I18N !
				var language_namespace = I18N.language + "/" + I18N.country + "/" + namespace;

				// But cache is top level.
				if (!topWnd.I18N.langObjects)
					topWnd.I18N.langObjects = {};

				if (!topWnd.I18N.langObjects[language_namespace])
					topWnd.I18N.langObjects[language_namespace] = {};
				if(typeof(topWnd.I18N.langObjects[language_namespace][""]) == "unknown" && !noautoload){
					topWnd.I18N.load(namespace,{},topWnd.I18N.language,topWnd.I18N.country);
					return topWnd.I18N._getNSObj(namespace,true);
				}else{
					return topWnd.I18N.langObjects[language_namespace];
				}
			},

			/* ======================================= */
			/* plural generation stuff */
			/* ======================================= */

			rules	 : {
				"default" : function(num) {
					if (num==1)
						return "r1";
					return "r2";
				}
			},

			addRule : function(language, func) {
				I18N.rules[language] = func;
			},

			_getRule : function(numerus) {
				if (I18N.rules[I18N.language])
					return I18N.rules[I18N.language](numerus);
				return I18N.rules["default"](numerus);

			},

			/* ======================================= */



			load : function(namespaces, params, language, country) {
				if (language) I18N.language = language;
				if (country)  I18N.country  = country;

				params = params || {};
				namespaces = (namespaces instanceof Array ? namespaces : [ namespaces ]);

				var defs = [];

				for (var i = 0 ; i < namespaces.length ; i++) {
					var xRef = I18N.language + "/" + I18N.country + "/" + namespaces[i];

					if (!I18N._createXRefClosure(xRef)()) {

						var xUrl = "/res/generated/i18n/" + xRef + ".js";

						if (params.url) {
							if (typeof(params.url) == "function") {
								xUrl = params.url(xUrl);
							} else {
								xUrl = params.url + xUrl;
							}
						}

						defs.push({
							url  : xUrl,
							test : I18N._createXRefClosure(xRef)
						});
					}
				}

				if (params.mode == "preload") {
					var def;
					while (defs.length > 0) {
						def = defs.shift();
						document.write('<SCRIPT src="' + def.url + '"></SCRIPT>');
					}
				} else {
					if(typeof (ScriptLoader) != "undefined" ){
						ScriptLoader.load(defs, {
							onSuccess : function() { if (params.onSuccess instanceof Function) { params.onSuccess(); } },
							onError   : function() { if (params.onError   instanceof Function) { params.onError(); } }
						});
					}
				}
			},

			_createXRefClosure : function(xRef) {
				return function() { return typeof I18N.langObjects[xRef] != 'undefined'; };
			},

			/* ======================================= */

			setTextObject : function(namespace, obj, force) {
				var ns = I18N._getNSObj(namespace);

				for (var variable in obj) {
					if (I18N._DEBUG_ && getTopWindow().I18N) {
						var wnd = getTopWindow().I18N.logWindow;
						var doc = wnd.document;
						var div = doc.createElement("div");
						var id = namespace + " " + variable;
						div.setAttribute("id", id);
						div.innerHTML = namespace + " | " + variable + " | " + obj[variable] + "<br><br>";
						if (doc.body)
							doc.body.appendChild(div);
					}
					if(typeof ns[variable] == "undefined" || typeof ns[variable]  == "unknown" || (typeof force != 'undefined' && force == true)){
						ns[variable] = obj[variable];
					}
				}
			},

			/* ======================================= */

			xlate : function(namespace, key, variables) {

				var ns 		= I18N._getNSObj(namespace);

				var ret 	= null;
				var numerus = null;

				if (I18N._DEBUG_ && getTopWindow().I18N) {
					var wnd = getTopWindow().I18N.logWindow;
					var doc = wnd.document;
					if (doc ) {
						var id = namespace + " " + key;
						var div = doc.getElementById(id);
						if (div != null)
							div.parentNode.removeChild(div);
					}
				}

				variables = (variables || {});

				if (typeof(ns[key]) != "undefined" && typeof(ns[key]) != "unknown") {
					ret = ns[key];

					var numerusIdx = key.indexOf("${#");
					if (numerusIdx != -1) {
						numerus = variables[key.substring(numerusIdx + 3, key.indexOf("}", numerusIdx + 3))];
					}

					if (numerus != null) {
						var rule = I18N._getRule(numerus);

						if (typeof(ns[key][rule]) != "undefined")
							ret = ns[key][rule];
					}
				}

				if (!ret) {
					ret = key;
					if (I18N._DEBUG_) {
						ret = "|" + namespace + "." + key + "|";
						ret = "|" + key + "|";
					}
				} else if (I18N._DEBUG_)
					ret = "#" + ret + "#";


				for (var variable in variables) {
					try {
						ret = ret.replace(new RegExp("\\$\\{\\#?" + variable + "(%T:[^}]*)?\\}", "g"),
							function(m, g) {
								if (g && g.length > 3) {
									return Strftime.format(g.substring(3), variables[variable], I18N.language, I18N.country);
								}
								return variables[variable];
							}
						);
					} catch (e) {
						alert(ret+"\n"+key+"\n"+namespace)
					}
				}

				return ret;
			},

			_xlate : function(namespace, key, variables) {
				return this.xlate(namespace, key, variables);
			},

			setTextLabels : function(namespace, doc) {
				namespace = (namespace || "");
				doc = (doc || document);
				this._translateElements(namespace, doc.getElementsByTagName("span"));
				this._translateElements(namespace, doc.getElementsByTagName("option"));
			},
			_translateElements : function (namespace, nodes) {
				for (var i=0; i<nodes.length; i++) {
					var node = nodes.item(i);
					if (node.getAttribute("type") == "text") {
						var id = node.getAttribute("xlate_id") || node.getAttribute("id");
						var ns = node.getAttribute("ns") || namespace || "unknown_ns";
						var html = I18N.xlate(ns, id);
						if (html) {
							Element.update(node, html);
						}
					} else {
						var langAttribute = node.getAttribute("lang");
						if (langAttribute && langAttribute.startsWith("x-late")) {
							var ns = langAttribute.substring(7).replace(/-/g, ".") || "unknown_ns";
							var html = I18N.xlate(ns, this._extractId(node));
							if (html){
								node.setAttribute("lang",this.language+"_"+this.country);
								Element.update(node, html);
							}
						}
					}
				}
			},
			_extractId : function (node){
				return this._removeComments(node.cloneNode(true)).innerHTML;
			},
			_removeComments : function (node){
				var children = node.childNodes;
				for( var i = children.length - 1 ; i >= 0 ; i-- ){
					this._removeComments(children.item(i));
				}
				if( node.nodeType == 8 /* comment */ ){
					node.parentNode.removeChild(node);
				}
				return node;
			}		
		};

    I18N.loaded = I18N.useTopWnd && getTopWindow().I18N && getTopWindow().I18N.loaded ? getTopWindow().I18N.loaded : {};

    if (I18N._DEBUG_ && getTopWindow().I18N && !getTopWindow().I18N.logWindow) {
	    getTopWindow().I18N.logWindow = window.open("/app/static/html/blank.html", "I18N_DEBUG");
    }
}
