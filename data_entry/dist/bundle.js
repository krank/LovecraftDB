!function o(l,i,c){function m(t,e){if(!i[t]){if(!l[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(u)return u(t,!0);var a=new Error("Cannot find module '"+t+"'");throw a.code="MODULE_NOT_FOUND",a}var r=i[t]={exports:{}};l[t][0].call(r.exports,function(e){return m(l[t][1][e]||e)},r,r.exports,o,l,i,c)}return i[t].exports}for(var u="function"==typeof require&&require,e=0;e<c.length;e++)m(c[e]);return m}({1:[function(e,t,n){"use strict";n.__esModule=!0;var a=e("./modules/interfaces");n.dataBlobs=[{name:"Title",type:a.BlobType.generalMetaData,documentElementType:a.DocumentNodeType.input,documentElementClass:"title",xmlElementName:"title"},{name:"Author",type:a.BlobType.generalMetaData,documentElementType:a.DocumentNodeType.input,documentElementClass:"author",xmlElementName:"author"},{name:"Written",type:a.BlobType.generalMetaData,documentElementType:a.DocumentNodeType.input,documentElementClass:"written",xmlElementName:"written"},{name:"Published",type:a.BlobType.generalMetaData,documentElementType:a.DocumentNodeType.input,documentElementClass:"published",xmlElementName:"published"},{name:"Tags",type:a.BlobType.list,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"tags",xmlElementName:"tags",xmlElementChildrenName:"tag"},{name:"Characters",type:a.BlobType.list,containsNames:!0,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"characters",xmlElementName:"characters",xmlElementChildrenName:"character",attributePairs:[{text:"m",xml:{attribute:"gender",value:"male"}},{text:"f",xml:{attribute:"gender",value:"female"}},{text:"o",xml:{attribute:"gender",value:"other"}},{text:"u",xml:{attribute:"gender",value:"unknown"}},{text:"1",xml:{attribute:"type",value:"main"}},{text:"2",xml:{attribute:"type",value:"interacted"}},{text:"3",xml:{attribute:"type",value:"mentioned"}}]},{name:"Mythos entities",type:a.BlobType.list,containsNames:!0,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"entities",xmlElementName:"entities",xmlElementChildrenName:"entity"},{name:"Books",type:a.BlobType.list,containsNames:!0,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"books",xmlElementName:"books",xmlElementChildrenName:"book"},{name:"Locations",type:a.BlobType.list,containsNames:!0,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"locations",xmlElementName:"locations",xmlElementChildrenName:"location"},{name:"Phobias",type:a.BlobType.list,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"phobias",xmlElementName:"phobias",xmlElementChildrenName:"phobia"},{name:"Notes",type:a.BlobType.list,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"notes",xmlElementName:"notes",xmlElementChildrenName:"note"},{name:"Related reading",type:a.BlobType.list,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"related",xmlElementName:"related",xmlElementChildrenName:"item"},{name:"Full text",type:a.BlobType.main,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"fulltext",xmlElementName:"body"},{name:"Summary",type:a.BlobType.main,documentElementType:a.DocumentNodeType.textarea,documentElementClass:"summary",xmlElementName:"summary"}]},{"./modules/interfaces":8}],2:[function(e,t,n){"use strict";n.__esModule=!0;var m=e("./formhandling");n.setupDialog=function(e,t,n){var a,r,o,l,i=document.querySelector(".big.dialog"),c=document.importNode(i,!0).content.querySelector("dialog");return document.querySelector("body").appendChild(c),c.querySelector("header h2").innerHTML=e,c.querySelector("form.search-box").classList.toggle("hidden",!t),c.querySelector("input.query").value="",c.querySelector("section.results ul").innerHTML="",c.querySelector("section.buttons").innerHTML="",c.querySelectorAll("section.buttons button").forEach(function(e){e.disabled=!0}),r=n,o=(a=c).querySelector("template.submit-button"),l=a.querySelector(".buttons"),r.forEach(function(e){var t=document.importNode(o.content,!0),n=t.querySelector("button");n.value=e.value,n.title=e.title,n.textContent=e.text,n.disabled=!0,l.appendChild(t)}),m.addValidation(c.querySelector("form.search-box")),m.addValidation(c.querySelector("form.search-results")),c}},{"./formhandling":6}],3:[function(e,t,n){"use strict";n.__esModule=!0,n.displayDialog=function(e,t,n,a){var r=document.querySelector("dialog.decision"),o=r.querySelector("h2"),l=r.querySelector("p");r.dataString=n,o.textContent=e,l.textContent=t,r.closeListener=function(e){e.preventDefault();var t=this;t.removeEventListener("close",t.closeListener),"yes"==this.returnValue&&a(t.dataString)},r.addEventListener("close",r.closeListener),r.showModal()}},{}],4:[function(e,t,n){"use strict";n.__esModule=!0;var r=e("./interfaces");n.getHtmlElementOf=function(e,t){var n="",a="";switch(e.type){case r.BlobType.generalMetaData:n=".metadata label."+e.documentElementClass+" input",a=".metadata label."+e.documentElementClass+" span";break;case r.BlobType.list:n=".metadata section."+e.documentElementClass+" textarea",a=".metadata section."+e.documentElementClass+" h2";break;case r.BlobType.main:n="main section."+e.documentElementClass+" textarea",a="main section."+e.documentElementClass+" h2"}return{element:document.querySelector(n),warningElement:t?document.querySelector(a):null}},n.unwrapElement=function(e){for(var t=e.parentNode;e.firstChild;)t.insertBefore(e.firstChild,e);t.removeChild(e)}},{"./interfaces":8}],5:[function(e,t,n){"use strict";n.__esModule=!0,n.saveFile=function(e,t,n){if(null!=n&&navigator.msSaveBlob)return navigator.msSaveBlob(new Blob([n],{type:t}),e);var a=document.createElement("a");a.setAttribute("style","display:none");var r=window.URL.createObjectURL(new Blob([n],{type:t}));a.setAttribute("href",r),a.setAttribute("download",e),a.click(),window.URL.revokeObjectURL(r),a.remove()},n.loadFile=function(a,r){var e=document.createElement("input");e.type="file",e.addEventListener("change",function(e){var t=e.target.files[0],n=new FileReader;n.readAsText(t,"utf-8"),n.addEventListener("load",function(e){var t=e.target;0==t.result.length&&console.log("Uh-oh, spaghetti-o's! That file seems empty, just like my soul."),a(t.result,r)})}),e.click()}},{}],6:[function(e,t,n){"use strict";function a(e,t){e.querySelectorAll("button[type=submit]").forEach(function(e){e.disabled=!t})}n.__esModule=!0,n.addValidation=function(e){e.addEventListener("input",function(){a(this,this.checkValidity())})},n.SetSubmitButtonEnabled=a},{}],7:[function(e,t,n){"use strict";n.__esModule=!0;var a=e("./decisiondialog");n.SetTextBody=function(e,t){void 0===t&&(t=!0);var n=document.querySelector("main textarea.textcode");t?0!=n.value.length?a.displayDialog("Replace","Are you sure? This will mean losing the current text body.",e,function(e){n.value=e}):n.value=e:n.value+="\n\n"+e,n.dispatchEvent(new Event("input",{bubbles:!0})),document.querySelector("input#code").click()},n.GetTextBody=function(){return document.querySelector("main textarea.textcode").value}},{"./decisiondialog":3}],8:[function(e,t,n){"use strict";var a,r;n.__esModule=!0,(a=n.DocumentNodeType||(n.DocumentNodeType={}))[a.input=0]="input",a[a.textarea=1]="textarea",(r=n.BlobType||(n.BlobType={}))[r.generalMetaData=0]="generalMetaData",r[r.list=1]="list",r[r.main=2]="main"},{}],9:[function(e,t,n){"use strict";n.__esModule=!0;var o=e("./bigdialog"),m=e("./formhandling"),c=e("./metadatamanagement");function l(e,t,l,i){fetch(t+"/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&rvslots=main&titles="+e).then(function(e){return e.json()}).then(function(e){var t,n,a=e.query.pages,r=a[Object.keys(a)[0]];if(r.revisions){var o=r.revisions[0].slots.main["*"];l&&(n=o,[{fieldName:"title",regex:/title *= (.*)/g},{fieldName:"author",regex:/author *= (.*)/g},{fieldName:"published",regex:/year *= (.*)/g}].forEach(function(e){var t=e.regex.exec(n);t&&c.setMetadataField(e.fieldName,t[1])})),i((t=o,[{description:"Remove noinclude",regexp:/<noinclude>([\S\s]*?)<\/noinclude>/g,replacement:"$1"},{description:"Remove drop initial",regexp:/{{2}drop *initial\|(.)}{2}/g,replacement:"$1"},{description:"Remove small caps",regexp:/{{2}sc\|(.*?)}{2}/g,replacement:"$1"},{description:"Remove end notes",regexp:/==Endnotes==[\S\s]*$/g,replacement:""},{description:"Remove tooltips",regexp:/{{2}tooltip\|(.*?)\|.*?\}{2}/g,replacement:"$1"},{description:"Remove references",regexp:/<ref>.*?<\/ref>/g,replacement:""},{description:"Remove indentations",regexp:/\n[ \t]+/g,replacement:"\n"},{description:"Remove links",regexp:/\[{2}.*?\|(.*?)\]{2}/g,replacement:"$1"},{description:"Remove right-aligning",regexp:/{{2}right.*?\|(.*?)\}{2}/g,replacement:"$1"},{description:"Remove centering",regexp:/{{2}c.*?\|(.*?)}{2}/g,replacement:"$1"},{description:"Remove blocks",regexp:/{{2}block.*?\|(.*?)}{2}/gs,replacement:"$1"},{description:"Fix attributes without quotes",regexp:/<(.*?) (.*?)=([^"].*?)([ >])/,replacement:'<$1 $2="$3"$4',exhaust:!0},{description:"Heading",regexp:/{{2}xx-larger\|(.*?)}{2}\n* /g,replacement:"<h1>$1</h1>\n\n"},{description:"Chapter title",regexp:/==(.*?)==\n*/g,replacement:"<h2>$1</h2>\n\n"},{description:"Poem lines with 2 indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line)::(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line indent=2>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines with 1 indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line):(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line indent=1>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines without indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line)(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines using br tag",regexp:/\n(.*)<br\/>/g,replacement:"\n<line>$1</line>"},{description:"Add paragraph </p><p>tags",regexp:/\n\n/g,replacement:"</p>\n\n<p>"},{description:"Remove last paragraph start tag (b/c logic)",regexp:/([\S\s]*)<p>/g,replacement:"$1"},{description:"Remove first paragraph end tag (b/ logic)",regexp:/<\/p>([\S\s]*)/g,replacement:"$1"},{description:"Remove line breaks after paragraph start",regexp:/<p>\n+/g,replacement:"<p>"},{description:"Reverse poem and paragraph start tags",regexp:/<p>\n*<poem>/g,replacement:"<poem>\n<p>"},{description:"Reverse poem and paragraph end tags",regexp:/<\/poem>\n*<\/p>/g,replacement:"</p>\n</poem>"},{description:"Separate first line of poem pagagraph from paragraph start tag",regexp:/<p><line>/g,replacement:"<p>\n<line>"},{description:"Separate last line of poem paragraph from paragraph end tag",regexp:/<\/line><\/p>/g,replacement:"</line>\n</p>"},{description:"Remove paragraph tags around headings",regexp:/<p><(h[0-5])>(.*?)<\/\1><\/p>/g,replacement:"<$1>$2</$1>\n\n"},{description:"'' to emph",regexp:/\'{2}(.*?)\'{2}/g,replacement:"<emph>$1</emph>"},{description:"Remove triple newlines",regexp:/\n\n\n/g,replacement:"\n\n",exhaust:!0},{description:"Remove double spaces",regexp:/  /g,replacement:" ",exhaust:!0},{description:"&nbsp; to space",regexp:/&nbsp;/g,replacement:" "},{description:"Ellipsis",regexp:/\. ?\. ?\./g,replacement:"…"}].forEach(function(e){if(e.exhaust)for(;0<=t.search(e.regexp);)t=t.replace(e.regexp,e.replacement);else t=t.replace(e.regexp,e.replacement)}),t),l)}})}n.displayDialog=function(e,t,n){var a=o.setupDialog("Download from Wikisource",!0,[{title:"Download and append to text",text:"Append",value:"append"},{title:"Download and replace current text",text:"Download",value:"replace"}]),r=a.querySelector("form.search-box");(r.wikiDialog=a).wikiUrl=t,a.callback=n,a.resultRowTemplate=a.querySelector(".result-row"),r.querySelector("input[type=text]").value=e,r.dispatchEvent(new Event("input")),r.addEventListener("submit",function(e){e.preventDefault();var t,c,n,a=this.wikiDialog,r=this.querySelector("input.query").value;a.query=r,t=r,n=(c=a).wikiUrl+"/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=15&srsearch="+t,fetch(n).then(function(e){return e.json()}).then(function(e){var t,n,a,r,o,l=e.query.search,i=[];l.forEach(function(e){i.push(e.title)}),t=i,a=(n=c).resultRowTemplate.content,r=n.querySelector(".results ul"),o=n.querySelector("form.search-results"),r.innerHTML="",0==t.length?(r.innerHTML="No results found for "+n.query+".",m.SetSubmitButtonEnabled(o,!1)):(t.forEach(function(e){var t=a.cloneNode(!0);t.querySelector(".text").innerHTML=e,t.querySelector("input[name=title]").value=e,r.appendChild(t)}),o.dispatchEvent(new Event("input")))})}),a.addEventListener("close",function(){var e=this;if("cancel"!=e.returnValue){var t=e.querySelector(".results input[type=radio][name=title]:checked");if(t){var n=t.value,a=e.wikiUrl;"replace"==e.returnValue?l(n,a,!0,e.callback):"append"==e.returnValue?l(n,a,!1,e.callback):alert("Whatcho talkin bout Willis?")}}e.remove()}),a.showModal()}},{"./bigdialog":2,"./formhandling":6,"./metadatamanagement":10}],10:[function(e,t,n){"use strict";n.__esModule=!0;var c=e("./dommanagement"),m=e("./decisiondialog");function a(e){var t=e.value,n=[];t.split("\n").forEach(function(e){var t=e.split("|",2);n.push({content:2==t.length?t[1]:t[0],metaData:2==t.length?t[0]:null})});var a=(n=(n=(n=n.filter(function(e,t,n){return n.map(function(e){return e.content}).indexOf(e.content)===t})).filter(function(e){return 0<e.content.length})).sort(function(e,t){return e.content>t.content?1:-1})).map(function(e){return e.metaData?e.metaData+"|"+e.content:e.content});e.value=a.join("\n")}n.addToListelement=function t(n,a,e){void 0===e&&(e=!1);var r=c.getHtmlElementOf(n,!1).element,o=r.value,l=""==o?[]:o.split("\n");if(!e&&0<l.filter(function(e){return-1!==a.indexOf(e)}).length)return void m.displayDialog("Duplicates","Some of the items you're trying to add to "+n.name+" are duplicates. Add them anyway?","",function(e){t(n,a,!0)});var i=l.concat(a);r.value=i.join("\n")},n.setMetadataField=function(e,t){var n=document.querySelector('section.metadata input[name="'+e+'"]');console.log(n),n&&(n.value=t)},n.setupLists=function(){document.querySelectorAll(".metadata section header button[value='clean'").forEach(function(t){t.addEventListener("click",function(){var e=t.parentElement.parentElement;e.matches("section")&&a(e.querySelector("textarea"))})})},n.cleanList=a},{"./decisiondialog":3,"./dommanagement":4}],11:[function(e,t,o){"use strict";o.__esModule=!0;var l=e("./bigdialog"),i=e("./metadatamanagement");o.nameRegex=/(?<![\.;:!?] *) (?:<emph>)?((?:[A-Z][\wéáà]+ ?)+),?/g,o.displayDialog=function(e,t){var n,a,r=l.setupDialog("Detected names",!1,[{title:"Append names to lists",text:"Append",value:"append"},{title:"Cancel",text:"Cancel",value:"cancel"}]);!function(e,p,t,g){var f=t.querySelector(".results ul");if(f.innerHTML="",0<e.length){var h=t.querySelector(".complex-result-row"),v=t.querySelector(".complex-result-row.option");e.forEach(function(e){var t,n,a,r,o,l,i,c,m,u=document.importNode(h.content,!0),s=u.querySelector(".description"),d=u.querySelector(".details");s.innerText=e.matchText,d.innerHTML=(t=e,a="…"+(n=p).substring(Math.max(t.indexStart-24,0),t.indexStart),r=" <strong>"+t.matchText+"</strong> ",o=n.substring(t.indexEnd,Math.max(t.indexEnd+24,0))+"…",a=a.replace(/</g,"&lt;").replace(/>/g,"&gt;"),o=o.replace(/</g,"&lt;").replace(/>/g,"&gt;"),a+r+o),l=e.matchText,i=g,c=v,(m=u.querySelector(".item-options")).innerHTML="",i.forEach(function(e){var t=document.importNode(c.content,!0),n=t.querySelector("input"),a=t.querySelector("span");n.value=e.value,n.setAttribute("name",l),n.checked=e.checked,a.textContent=e.text,m.appendChild(t)}),f.appendChild(u)})}}(function(e,t){var n,a=[],r=[];for(;null!==(n=t.exec(e));){var o=n[1].trim();r.indexOf(o)<0&&(r.push(o),a.push({matchText:n[1].trim(),indexStart:n.index,indexEnd:t.lastIndex}))}return t.lastIndex=0,a}(e,o.nameRegex),e,r,(n=t.filter(function(e){return 1==e.containsNames}),a=[],n.forEach(function(e){a.push({text:e.xmlElementChildrenName.charAt(0).toUpperCase()+e.xmlElementChildrenName.slice(1),value:e.xmlElementChildrenName})}),a.push({text:"Ignore",value:"ignore",checked:!0}),a)),r.addEventListener("close",function(){if("append"==this.returnValue){var n={};t.filter(function(e){return 1==e.containsNames}).forEach(function(e){n[e.xmlElementChildrenName]={dataBlob:e,content:[]}}),this.querySelectorAll("input[type=radio]:checked:not([value=ignore])").forEach(function(e){0<=Object.keys(n).indexOf(e.value)&&n[e.value].content.push(e.name)}),Object.keys(n).forEach(function(e){var t=n[e];i.addToListelement(t.dataBlob,t.content)})}this.remove()}),r.showModal()}},{"./bigdialog":2,"./metadatamanagement":10}],12:[function(e,t,n){"use strict";n.__esModule=!0;var o,u=e("./namesearch"),l=e("./metadatamanagement"),s=e("./xmlhandling"),i=e("./dommanagement"),a=!1;function r(e){var t=document.querySelector("div.htmltext");a?(t.removeEventListener("mouseup",c),t.addEventListener("mouseup",c)):c()}function c(){var e=document.getSelection();if(0==e.rangeCount||e.getRangeAt(0).collapsed)m();else{var t=e.getRangeAt(0),n=document.querySelector("div.htmltext");if(n.contains(t.startContainer)&&n.contains(t.endContainer)){var a=d(!0),r=t.getBoundingClientRect(),o=r.x,l=r.y+r.height;a.style.left=o+"px",a.style.top=l+"px",document.removeEventListener("click",m),document.addEventListener("click",m)}}}function m(){var e=document.getSelection();if(0==e.rangeCount||e.getRangeAt(0).collapsed){var t=d(!1);t&&t.remove(),document.removeEventListener("click",m)}}function d(e){var t=document.querySelector("div.selection-toolbar");if(null==t&&e){var n=document.querySelector("template.selection-toolbar"),a=document.importNode(n.content,!0);t=a.querySelector("div.selection-toolbar"),document.querySelector("div.html-panel").appendChild(a),t.querySelectorAll(".name-categories button").forEach(function(e){e.addEventListener("click",function(e){!function(t){var e=document.getSelection(),n=0<e.rangeCount?e.getRangeAt(0):null;if(null==n)return;var a=o.filter(function(e){return e.xmlElementChildrenName==t});if(0<a.length){var r=a[0];l.addToListelement(r,[n.toString().trim()])}}(e.target.value)})}),t.querySelectorAll(".gendering button").forEach(function(e){e.addEventListener("click",function(e){!function(e){var t=document.getSelection(),n=0<t.rangeCount?t.getRangeAt(0):null;if(null==n)return;var a=n.startContainer.parentNode;if("MARK"==a.tagName&&a.classList.contains("gendered"))return i.unwrapElement(a);document.querySelectorAll("div.htmltext mark.gendered").forEach(function(e){n.intersectsNode(e)&&i.unwrapElement(e)});var r=document.createElement("mark");r.className="gendered "+e;try{n.surroundContents(r)}catch(e){console.log("Can't add mark there.")}}(e.target.value)})})}return t}n.setupRichText=function(e){o=e,document.querySelectorAll("input#html, input#code").forEach(function(e){e.addEventListener("change",function(e){var t=e.target.id,n=new DOMParser,a=document.querySelector("textarea.textcode"),r=document.querySelector("div.htmltext");if("html"==t){var o="<body>"+a.value+"</body>",l=n.parseFromString(o,"text/xml"),i=s.transformXml(l,s.xslCodeToHTML),c=i.querySelector("div.body").innerHTML.replace(u.nameRegex,' <mark class="potential-name">$1</mark>');r.innerHTML=c}else if("code"==t){o="<work>"+r.innerHTML+"</work>",l=n.parseFromString(o,"text/xml"),i=s.transformXml(l,s.xslHTMLToCode);i=s.transformXml(i,s.xslPrettyXML);var m=s.unwrapXml(i);a.value=m}})}),document.addEventListener("mousedown",function(){a=!0}),document.addEventListener("mouseup",function(){a=!1}),document.addEventListener("selectionchange",r)}},{"./dommanagement":4,"./metadatamanagement":10,"./namesearch":11,"./xmlhandling":13}],13:[function(e,t,i){"use strict";i.__esModule=!0;var n=e("./decisiondialog"),c=e("./interfaces"),m=e("./dommanagement");function r(e){var t=new XMLHttpRequest;return t.open("GET",e,!1),t.send(null),t.responseXML}function u(e){var t=e.documentElement.innerHTML;return t=(t=t.replace(/^  /gm,"")).replace(/^\n|\n$/g,"")}function s(e,t){var n=new XSLTProcessor;return n.importStylesheet(t),n.transformToDocument(e)}i.setupXML=function(e){i.xslCodeToHTML=r("dist/xsl/codetohtml.xsl"),i.xslPrettyXML=r("dist/xsl/prettyxml.xsl"),i.xslHTMLToCode=r("dist/xsl/htmltocode.xsl");var a=new DOMParser;e.forEach(function(e){var t=m.getHtmlElementOf(e,!0),n=t.element;n.warningElement=t.warningElement,n.addEventListener("input",function(e){var t="<body>"+this.value+"</body>",n=a.parseFromString(t,"text/xml");this.warningElement.classList.toggle("xmlwarning",!!n.querySelector("parsererror")),document.querySelector(".toolbar button[value='export']").disabled=!!n.querySelector("parsererror")})})},i.makeXML=function(e){var l=document.implementation.createDocument("","",null),t=l.createElement("work");return l.appendChild(t),e.forEach(function(r){var o=l.createElement(r.xmlElementName),e=m.getHtmlElementOf(r,!1).element.value;r.xmlElementChildrenName?e.split(/[\r\n]+/).forEach(function(e){if(0<(e=e.trim()).length){var t=l.createElement(r.xmlElementChildrenName);if(r.attributePairs&&-1!==e.indexOf("|")){var n=e.split("|",2),a=n[0].toLowerCase();r.attributePairs.forEach(function(e){-1!==a.indexOf(e.text)&&t.setAttribute(e.xml.attribute,e.xml.value)}),e=n[1]}0<e.length&&(t.textContent=e,o.appendChild(t))}}):o.innerHTML=e;t.appendChild(o)}),l=s(l,i.xslPrettyXML),(new XMLSerializer).serializeToString(l)},i.loadXml=function(e,t){var l=(new DOMParser).parseFromString(e,"text/xml");t.forEach(function(e){var t=l.querySelector(e.xmlElementName);if(t){var n=m.getHtmlElementOf(e,!1).element;if(e.xmlElementChildrenName){var a=t.querySelectorAll(e.xmlElementChildrenName),r=[];a.forEach(function(t){var n="";e.attributePairs&&(e.attributePairs.forEach(function(e){t.getAttribute(e.xml.attribute)==e.xml.value&&(n+=e.text)}),n+="|"),r.push(n+t.innerHTML)}),n.value=r.join("\n")}else if(e.type==c.BlobType.main){var o=document.implementation.createDocument(null,"tmp",null);o.replaceChild(t,o.documentElement),o=s(o,i.xslPrettyXML),n.value=u(o)}else n.value=t.innerHTML}})},i.unwrapXml=u,i.clear=function(t){n.displayDialog("Clear all fields","Are you sure? This will clear all fields and give you a clean slate.","yes",function(e){"yes"==e&&t.forEach(function(e){m.getHtmlElementOf(e,!1).element.value=""})})},i.transformXml=s},{"./decisiondialog":3,"./dommanagement":4,"./interfaces":8}],14:[function(e,t,n){"use strict";n.__esModule=!0;var r=e("./modules/xmlhandling"),o=e("./modules/filemanagement"),a=e("./modules/fulltextmanagement"),l=e("./modules/richtextmanagement"),i=e("./modules/metadatamanagement"),c=e("./modules/mediawikisearch"),m=e("./modules/namesearch"),u=e("./DataBlobConfig");document.querySelector("section.toolbar button.wikisource").addEventListener("click",function(e){e.preventDefault();var t=document.querySelector(".metadata input[name=title]").value;c.displayDialog(t,"https://en.wikisource.org",a.SetTextBody)}),document.querySelector("section.toolbar button[value='find-names']").addEventListener("click",function(e){e.preventDefault(),m.displayDialog(a.GetTextBody(),u.dataBlobs)}),document.querySelector("section.toolbar button[value='export']").addEventListener("click",function(e){e.preventDefault();var t=r.makeXML(u.dataBlobs),n=document.querySelector(".metadata input[name=title]").value;0==n.length&&(n="Unknown");var a=n+".xml";o.saveFile(a,"text/xml",t)}),document.querySelector("section.toolbar button[value='import']").addEventListener("click",function(e){e.preventDefault(),o.loadFile(r.loadXml,u.dataBlobs)}),document.querySelector("section.toolbar button[value='clear']").addEventListener("click",function(e){e.preventDefault(),r.clear(u.dataBlobs)}),l.setupRichText(u.dataBlobs),r.setupXML(u.dataBlobs),i.setupLists()},{"./DataBlobConfig":1,"./modules/filemanagement":5,"./modules/fulltextmanagement":7,"./modules/mediawikisearch":9,"./modules/metadatamanagement":10,"./modules/namesearch":11,"./modules/richtextmanagement":12,"./modules/xmlhandling":13}]},{},[14]);
//# sourceMappingURL=bundle.js.map
