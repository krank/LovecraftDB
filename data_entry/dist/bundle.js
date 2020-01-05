!function o(l,i,c){function u(t,e){if(!i[t]){if(!l[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(s)return s(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var a=i[t]={exports:{}};l[t][0].call(a.exports,function(e){return u(l[t][1][e]||e)},a,a.exports,o,l,i,c)}return i[t].exports}for(var s="function"==typeof require&&require,e=0;e<c.length;e++)u(c[e]);return u}({1:[function(e,t,n){"use strict";n.__esModule=!0;var r=e("./modules/interfaces");n.dataBlobs=[{name:"Title",type:r.BlobType.generalMetaData,documentElementType:r.DocumentNodeType.input,documentElementClass:"title",xmlElementName:"title"},{name:"Author",type:r.BlobType.generalMetaData,documentElementType:r.DocumentNodeType.input,documentElementClass:"author",xmlElementName:"author"},{name:"Written",type:r.BlobType.generalMetaData,documentElementType:r.DocumentNodeType.input,documentElementClass:"written",xmlElementName:"written"},{name:"Published",type:r.BlobType.generalMetaData,documentElementType:r.DocumentNodeType.input,documentElementClass:"published",xmlElementName:"published"},{name:"Tags",type:r.BlobType.list,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"tags",xmlElementName:"tags",xmlElementChildrenName:"tag"},{name:"Characters",type:r.BlobType.list,containsNames:!0,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"characters",xmlElementName:"characters",xmlElementChildrenName:"character",attributePairs:[{text:"m",xml:{attribute:"gender",value:"male"}},{text:"f",xml:{attribute:"gender",value:"female"}},{text:"o",xml:{attribute:"gender",value:"other"}},{text:"u",xml:{attribute:"gender",value:"unknown"}},{text:"1",xml:{attribute:"type",value:"main"}},{text:"2",xml:{attribute:"type",value:"interacted"}},{text:"3",xml:{attribute:"type",value:"mentioned"}}]},{name:"Mythos entities",type:r.BlobType.list,containsNames:!0,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"entities",xmlElementName:"entities",xmlElementChildrenName:"entity"},{name:"Books",type:r.BlobType.list,containsNames:!0,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"books",xmlElementName:"books",xmlElementChildrenName:"book"},{name:"Locations",type:r.BlobType.list,containsNames:!0,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"locations",xmlElementName:"locations",xmlElementChildrenName:"location"},{name:"Phobias",type:r.BlobType.list,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"phobias",xmlElementName:"phobias",xmlElementChildrenName:"phobia"},{name:"Notes",type:r.BlobType.list,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"notes",xmlElementName:"notes",xmlElementChildrenName:"note"},{name:"Related reading",type:r.BlobType.list,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"related",xmlElementName:"related",xmlElementChildrenName:"item"},{name:"Full text",type:r.BlobType.fulltext,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"fulltext",xmlElementName:"body"},{name:"Summary",type:r.BlobType.summary,documentElementType:r.DocumentNodeType.textarea,documentElementClass:"summary",xmlElementName:"summary"}]},{"./modules/interfaces":9}],2:[function(e,t,n){"use strict";n.__esModule=!0;var u=e("./forms");n.setupDialog=function(e,t,n){var r,a,o,l,i=document.querySelector(".big.dialog"),c=document.importNode(i,!0).content.querySelector("dialog");return document.querySelector("body").appendChild(c),c.querySelector("header h2").innerHTML=e,c.querySelector("form.search-box").classList.toggle("hidden",!t),c.querySelector("input.query").value="",c.querySelector("section.results ul").innerHTML="",c.querySelector("section.buttons").innerHTML="",c.querySelectorAll("section.buttons button").forEach(function(e){e.disabled=!0}),a=n,o=(r=c).querySelector("template.submit-button"),l=r.querySelector(".buttons"),a.forEach(function(e){var t=document.importNode(o.content,!0),n=t.querySelector("button");n.value=e.value,n.title=e.title,n.textContent=e.text,n.disabled=!0,l.appendChild(t)}),u.addValidation(c.querySelector("form.search-box")),u.addValidation(c.querySelector("form.search-results")),c}},{"./forms":7}],3:[function(e,t,n){"use strict";n.__esModule=!0;var a=e("./decisiondialog");n.SetTextBody=function(e,t,n){void 0===t&&(t=!0),void 0===n&&(n=!1);var r=document.querySelector("main textarea.textcode");e=e.replace(/\>\n\<(?!\/)/g,">\n\n<"),t?0==r.value.length||n?r.value=e:a.displayDialog("Replace","Are you sure? This will mean losing the current text body.",e,function(e){r.value=e}):r.value+="\n\n"+e,r.dispatchEvent(new Event("input",{bubbles:!0})),document.querySelector("input#code").click()},n.GetTextBody=function(){return document.querySelector("main textarea.textcode").value}},{"./decisiondialog":4}],4:[function(e,t,n){"use strict";n.__esModule=!0,n.displayDialog=function(e,t,n,r){var a=document.querySelector("dialog.decision"),o=a.querySelector("h2"),l=a.querySelector("p");a.dataString=n,o.textContent=e,l.textContent=t,a.closeListener=function(e){e.preventDefault();this.removeEventListener("close",this.closeListener),"yes"==this.returnValue&&r(this.dataString)},a.addEventListener("close",a.closeListener),a.showModal()}},{}],5:[function(e,t,n){"use strict";n.__esModule=!0;var a=e("./interfaces");n.getHtmlElementOf=function(e,t){var n="",r="";switch(e.type){case a.BlobType.generalMetaData:n=".metadata label."+e.documentElementClass+" input",r=".metadata label."+e.documentElementClass+" span";break;case a.BlobType.list:n=".metadata section."+e.documentElementClass+" textarea",r=".metadata section."+e.documentElementClass+" h2";break;case a.BlobType.fulltext:case a.BlobType.summary:n="main section."+e.documentElementClass+" textarea",r="main section."+e.documentElementClass+" h2"}return{element:document.querySelector(n),warningElement:t?document.querySelector(r):null}},n.unwrapElement=function(e){for(var t=e.parentNode;e.firstChild;)t.insertBefore(e.firstChild,e);t.removeChild(e)}},{"./interfaces":9}],6:[function(e,t,n){"use strict";n.__esModule=!0,n.saveFile=function(e,t,n){if(null!=n&&navigator.msSaveBlob)return navigator.msSaveBlob(new Blob([n],{type:t}),e);var r=document.createElement("a");r.setAttribute("style","display:none");var a=window.URL.createObjectURL(new Blob([n],{type:t}));r.setAttribute("href",a),r.setAttribute("download",e),r.click(),window.URL.revokeObjectURL(a),r.remove()},n.loadFile=function(r,a){var e=document.createElement("input");e.type="file",e.addEventListener("change",function(e){var t=e.target.files[0],n=new FileReader;n.readAsText(t,"utf-8"),n.addEventListener("load",function(e){var t=e.target;0==t.result.length&&console.log("Uh-oh, spaghetti-o's! That file seems empty, just like my soul."),r(t.result,a)})}),e.click()}},{}],7:[function(e,t,n){"use strict";function r(e,t){e.querySelectorAll("button[type=submit]").forEach(function(e){e.disabled=!t})}n.__esModule=!0,n.addValidation=function(e){e.addEventListener("input",function(){r(this,this.checkValidity())})},n.SetSubmitButtonEnabled=r},{}],8:[function(e,t,n){"use strict";n.__esModule=!0;var o,s=e("./namesearch"),l=e("./metadata"),m=e("./xml"),i=e("./dom"),d=e("./codeview"),r=!1;function a(e){var t=document.querySelector("div.htmltext");r?(t.removeEventListener("mouseup",c),t.addEventListener("mouseup",c)):c()}function c(){var e=document.getSelection();if(0==e.rangeCount||e.getRangeAt(0).collapsed)u();else{var t=e.getRangeAt(0),n=document.querySelector("div.htmltext");if(n.contains(t.startContainer)&&n.contains(t.endContainer)){var r=p(!0),a=t.getBoundingClientRect(),o=a.x,l=a.y+a.height;r.style.left=o+"px",r.style.top=l+"px",document.removeEventListener("click",u),document.addEventListener("click",u)}}}function u(){var e=document.getSelection();if(0==e.rangeCount||e.getRangeAt(0).collapsed){var t=p(!1);t&&t.remove(),document.removeEventListener("click",u)}}function p(e){var t=document.querySelector("div.selection-toolbar");if(null==t&&e){var n=document.querySelector("template.selection-toolbar"),r=document.importNode(n.content,!0);t=r.querySelector("div.selection-toolbar"),document.querySelector("div.html-panel").appendChild(r),t.querySelectorAll(".name-categories button").forEach(function(e){e.addEventListener("click",function(e){!function(t){var e=document.getSelection(),n=0<e.rangeCount?e.getRangeAt(0):null;if(null==n)return;var r=o.filter(function(e){return e.xmlElementChildrenName==t});if(0<r.length){var a=r[0];l.addToListelement(a,[n.toString().trim()])}}(e.target.value)})}),t.querySelectorAll(".gendering button").forEach(function(e){e.addEventListener("click",function(e){!function(e){var t=document.getSelection(),n=0<t.rangeCount?t.getRangeAt(0):null;if(null==n)return;var r=n.startContainer.parentNode;if("MARK"==r.tagName&&r.classList.contains("gendered"))return i.unwrapElement(r);document.querySelectorAll("div.htmltext mark.gendered").forEach(function(e){n.intersectsNode(e)&&i.unwrapElement(e)});var a=document.createElement("mark");a.className="gendered "+e;try{n.surroundContents(a)}catch(e){console.log("Can't add mark there.")}}(e.target.value)})})}return t}n.setup=function(e){o=e,document.querySelectorAll("input#html, input#code").forEach(function(e){e.addEventListener("change",function(e){var t=e.target.id,n=new DOMParser,r=document.querySelector("textarea.textcode"),a=document.querySelector("div.htmltext");if("html"==t){var o="<body>"+r.value+"</body>",l=n.parseFromString(o,"text/xml"),i=m.transformXml(l,m.xslCodeToHTML),c=i.querySelector("div.body").innerHTML.replace(s.nameRegex,' <mark class="potential-name">$1</mark>');a.innerHTML=c}else if("code"==t){o="<work>"+a.innerHTML+"</work>",l=n.parseFromString(o,"text/xml"),i=m.transformXml(l,m.xslHTMLToCode);i=m.transformXml(i,m.xslPrettyXML);var u=m.unwrapXml(i);d.SetTextBody(u,!0,!0)}})}),document.addEventListener("mousedown",function(){r=!0}),document.addEventListener("mouseup",function(){r=!1}),document.addEventListener("selectionchange",a)}},{"./codeview":3,"./dom":5,"./metadata":11,"./namesearch":12,"./xml":13}],9:[function(e,t,n){"use strict";var r,a;n.__esModule=!0,(r=n.DocumentNodeType||(n.DocumentNodeType={}))[r.input=0]="input",r[r.textarea=1]="textarea",(a=n.BlobType||(n.BlobType={}))[a.generalMetaData=0]="generalMetaData",a[a.list=1]="list",a[a.fulltext=2]="fulltext",a[a.summary=3]="summary"},{}],10:[function(e,t,n){"use strict";n.__esModule=!0;var o=e("./bigdialog"),u=e("./forms"),c=e("./metadata");function l(e,t,l,i){fetch(t+"/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&rvslots=main&titles="+e).then(function(e){return e.json()}).then(function(e){var t,n,r=e.query.pages,a=r[Object.keys(r)[0]];if(a.revisions){var o=a.revisions[0].slots.main["*"];l&&(n=o,[{fieldName:"title",regex:/title *= (.*)/g},{fieldName:"author",regex:/author *= (.*)/g},{fieldName:"published",regex:/year *= (.*)/g}].forEach(function(e){var t=e.regex.exec(n);t&&c.setMetadataField(e.fieldName,t[1])})),i((t=o,[{description:"Remove noinclude",regexp:/<noinclude>([\S\s]*?)<\/noinclude>/g,replacement:"$1"},{description:"Remove drop initial",regexp:/{{2}drop *initial\|(.)}{2}/g,replacement:"$1"},{description:"Remove small caps",regexp:/{{2}sc\|(.*?)}{2}/g,replacement:"$1"},{description:"Remove end notes",regexp:/==Endnotes==[\S\s]*$/g,replacement:""},{description:"Remove tooltips",regexp:/{{2}tooltip\|(.*?)\|.*?\}{2}/g,replacement:"$1"},{description:"Remove references",regexp:/<ref>.*?<\/ref>/g,replacement:""},{description:"Remove indentations",regexp:/\n[ \t]+/g,replacement:"\n"},{description:"Remove links",regexp:/\[{2}.*?\|(.*?)\]{2}/g,replacement:"$1"},{description:"Remove right-aligning",regexp:/{{2}right.*?\|(.*?)\}{2}/g,replacement:"$1"},{description:"Remove centering",regexp:/{{2}c.*?\|(.*?)}{2}/g,replacement:"$1"},{description:"Remove blocks",regexp:/{{2}block.*?\|(.*?)}{2}/gs,replacement:"$1"},{description:"Fix attributes without quotes",regexp:/<(.*?) (.*?)=([^"].*?)([ >])/,replacement:'<$1 $2="$3"$4',exhaust:!0},{description:"Heading",regexp:/{{2}xx-larger\|(.*?)}{2}\n* /g,replacement:"<h1>$1</h1>\n\n"},{description:"Chapter title",regexp:/==(.*?)==\n*/g,replacement:"<h2>$1</h2>\n\n"},{description:"Poem lines with 2 indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line)::(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line indent=2>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines with 1 indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line):(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line indent=1>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines without indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line)(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines using br tag",regexp:/\n(.*)<br\/>/g,replacement:"\n<line>$1</line>"},{description:"Add paragraph </p><p>tags",regexp:/\n\n/g,replacement:"</p>\n\n<p>"},{description:"Remove last paragraph start tag (b/c logic)",regexp:/([\S\s]*)<p>/g,replacement:"$1"},{description:"Remove first paragraph end tag (b/ logic)",regexp:/<\/p>([\S\s]*)/g,replacement:"$1"},{description:"Remove line breaks after paragraph start",regexp:/<p>\n+/g,replacement:"<p>"},{description:"Reverse poem and paragraph start tags",regexp:/<p>\n*<poem>/g,replacement:"<poem>\n<p>"},{description:"Reverse poem and paragraph end tags",regexp:/<\/poem>\n*<\/p>/g,replacement:"</p>\n</poem>"},{description:"Separate first line of poem pagagraph from paragraph start tag",regexp:/<p><line>/g,replacement:"<p>\n<line>"},{description:"Separate last line of poem paragraph from paragraph end tag",regexp:/<\/line><\/p>/g,replacement:"</line>\n</p>"},{description:"Remove paragraph tags around headings",regexp:/<p><(h[0-5])>(.*?)<\/\1><\/p>/g,replacement:"<$1>$2</$1>\n\n"},{description:"'' to emph",regexp:/\'{2}(.*?)\'{2}/g,replacement:"<emph>$1</emph>"},{description:"Remove triple newlines",regexp:/\n\n\n/g,replacement:"\n\n",exhaust:!0},{description:"Remove double spaces",regexp:/  /g,replacement:" ",exhaust:!0},{description:"&nbsp; to space",regexp:/&nbsp;/g,replacement:" "},{description:"Ellipsis",regexp:/\. ?\. ?\./g,replacement:"…"}].forEach(function(e){if(e.exhaust)for(;0<=t.search(e.regexp);)t=t.replace(e.regexp,e.replacement);else t=t.replace(e.regexp,e.replacement)}),t),l)}})}n.displayDialog=function(e,t,n){var r=o.setupDialog("Download from Wikisource",!0,[{title:"Download and append to text",text:"Append",value:"append"},{title:"Download and replace current text",text:"Download",value:"replace"}]),a=r.querySelector("form.search-box");(a.wikiDialog=r).wikiUrl=t,r.callback=n,r.resultRowTemplate=r.querySelector(".result-row"),a.querySelector("input[type=text]").value=e,a.dispatchEvent(new Event("input")),a.addEventListener("submit",function(e){e.preventDefault();var t,c,n,r=this.wikiDialog,a=this.querySelector("input.query").value;r.query=a,t=a,n=(c=r).wikiUrl+"/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=15&srsearch="+t,fetch(n).then(function(e){return e.json()}).then(function(e){var t,n,r,a,o,l=e.query.search,i=[];l.forEach(function(e){i.push(e.title)}),t=i,r=(n=c).resultRowTemplate.content,a=n.querySelector(".results ul"),o=n.querySelector("form.search-results"),a.innerHTML="",0==t.length?(a.innerHTML="No results found for "+n.query+".",u.SetSubmitButtonEnabled(o,!1)):(t.forEach(function(e){var t=r.cloneNode(!0);t.querySelector(".text").innerHTML=e,t.querySelector("input[name=title]").value=e,a.appendChild(t)}),o.dispatchEvent(new Event("input")))})}),r.addEventListener("close",function(){var e=this;if("cancel"!=e.returnValue){var t=e.querySelector(".results input[type=radio][name=title]:checked");if(t){var n=t.value,r=e.wikiUrl;"replace"==e.returnValue?l(n,r,!0,e.callback):"append"==e.returnValue?l(n,r,!1,e.callback):alert("Whatcho talkin bout Willis?")}}e.remove()}),r.showModal()}},{"./bigdialog":2,"./forms":7,"./metadata":11}],11:[function(e,t,n){"use strict";n.__esModule=!0;var c=e("./dom"),u=e("./decisiondialog");function r(e){var t=e.value,n=[];t.split("\n").forEach(function(e){var t=e.split("|",2);n.push({content:2==t.length?t[1]:t[0],metaData:2==t.length?t[0]:null})});var r=(n=(n=(n=n.filter(function(e,t,n){return n.map(function(e){return e.content}).indexOf(e.content)===t})).filter(function(e){return 0<e.content.length})).sort(function(e,t){return e.content>t.content?1:-1})).map(function(e){return e.metaData?e.metaData+"|"+e.content:e.content});e.value=r.join("\n")}n.addToListelement=function t(n,r,e){void 0===e&&(e=!1);var a=c.getHtmlElementOf(n,!1).element,o=a.value,l=""==o?[]:o.split("\n");if(!e&&0<l.filter(function(e){return-1!==r.indexOf(e)}).length)return void u.displayDialog("Duplicates","Some of the items you're trying to add to "+n.name+" are duplicates. Add them anyway?","",function(e){t(n,r,!0)});var i=l.concat(r);a.value=i.join("\n")},n.setMetadataField=function(e,t){var n=document.querySelector('section.metadata input[name="'+e+'"]');console.log(n),n&&(n.value=t)},n.setupLists=function(){document.querySelectorAll(".metadata section header button[value='clean'").forEach(function(t){t.addEventListener("click",function(){var e=t.parentElement.parentElement;e.matches("section")&&r(e.querySelector("textarea"))})})},n.cleanList=r},{"./decisiondialog":4,"./dom":5}],12:[function(e,t,o){"use strict";o.__esModule=!0;var l=e("./bigdialog"),i=e("./metadata");o.nameRegex=/(?<![\.;:!?] *) (?:<emph>)?((?:[A-Z][\wéáà]+ ?)+),?/g,o.displayDialog=function(e,t){var n,r,a=l.setupDialog("Detected names",!1,[{title:"Append names to lists",text:"Append",value:"append"},{title:"Cancel",text:"Cancel",value:"cancel"}]);!function(e,p,t,f){var g=t.querySelector(".results ul");if(g.innerHTML="",0<e.length){var v=t.querySelector(".complex-result-row"),x=t.querySelector(".complex-result-row.option");e.forEach(function(e){var t,n,r,a,o,l,i,c,u,s=document.importNode(v.content,!0),m=s.querySelector(".description"),d=s.querySelector(".details");m.innerText=e.matchText,d.innerHTML=(t=e,r="…"+(n=p).substring(Math.max(t.indexStart-24,0),t.indexStart),a=" <strong>"+t.matchText+"</strong> ",o=n.substring(t.indexEnd,Math.max(t.indexEnd+24,0))+"…",r=r.replace(/</g,"&lt;").replace(/>/g,"&gt;"),o=o.replace(/</g,"&lt;").replace(/>/g,"&gt;"),r+a+o),l=e.matchText,i=f,c=x,(u=s.querySelector(".item-options")).innerHTML="",i.forEach(function(e){var t=document.importNode(c.content,!0),n=t.querySelector("input"),r=t.querySelector("span");n.value=e.value,n.setAttribute("name",l),n.checked=e.checked,r.textContent=e.text,u.appendChild(t)}),g.appendChild(s)})}}(function(e,t){var n,r=[],a=[];for(;null!==(n=t.exec(e));){var o=n[1].trim();a.indexOf(o)<0&&(a.push(o),r.push({matchText:n[1].trim(),indexStart:n.index,indexEnd:t.lastIndex}))}return t.lastIndex=0,r}(e,o.nameRegex),e,a,(n=t.filter(function(e){return 1==e.containsNames}),r=[],n.forEach(function(e){r.push({text:e.xmlElementChildrenName.charAt(0).toUpperCase()+e.xmlElementChildrenName.slice(1),value:e.xmlElementChildrenName})}),r.push({text:"Ignore",value:"ignore",checked:!0}),r)),a.addEventListener("close",function(){if("append"==this.returnValue){var n={};t.filter(function(e){return 1==e.containsNames}).forEach(function(e){n[e.xmlElementChildrenName]={dataBlob:e,content:[]}}),this.querySelectorAll("input[type=radio]:checked:not([value=ignore])").forEach(function(e){0<=Object.keys(n).indexOf(e.value)&&n[e.value].content.push(e.name)}),Object.keys(n).forEach(function(e){var t=n[e];i.addToListelement(t.dataBlob,t.content)})}this.remove()}),a.showModal()}},{"./bigdialog":2,"./metadata":11}],13:[function(e,t,i){"use strict";i.__esModule=!0;var n=e("./decisiondialog"),c=e("./interfaces"),u=e("./dom"),s=e("./codeview");function m(e){var t=e.documentElement.innerHTML;return t=(t=t.replace(/^  /gm,"")).replace(/^\n|\n$/g,"")}function d(e,t){if(!t)return console.log("XSL stylesheet not loaded yet"),null;var n=new XSLTProcessor;return n.importStylesheet(t),n.transformToDocument(e)}i.setup=function(e){fetch("dist/xsl/codetohtml.xsl").then(function(e){return e.text()}).then(function(e){i.xslCodeToHTML=(new DOMParser).parseFromString(e,"text/xml")}),fetch("dist/xsl/prettyxml.xsl").then(function(e){return e.text()}).then(function(e){i.xslPrettyXML=(new DOMParser).parseFromString(e,"text/xml")}),fetch("dist/xsl/htmltocode.xsl").then(function(e){return e.text()}).then(function(e){i.xslHTMLToCode=(new DOMParser).parseFromString(e,"text/xml")});var r=new DOMParser;e.forEach(function(e){var t=u.getHtmlElementOf(e,!0),n=t.element;n.warningElement=t.warningElement,n.addEventListener("input",function(e){var t="<body>"+this.value+"</body>",n=r.parseFromString(t,"text/xml");this.warningElement.classList.toggle("xmlwarning",!!n.querySelector("parsererror")),document.querySelector(".toolbar button[value='export']").disabled=!!n.querySelector("parsererror")})})},i.makeXML=function(e){var l=document.implementation.createDocument("","",null),t=l.createElement("work");return l.appendChild(t),e.forEach(function(a){var o=l.createElement(a.xmlElementName),e=u.getHtmlElementOf(a,!1).element.value;a.xmlElementChildrenName?e.split(/[\r\n]+/).forEach(function(e){if(0<(e=e.trim()).length){var t=l.createElement(a.xmlElementChildrenName);if(a.attributePairs&&-1!==e.indexOf("|")){var n=e.split("|",2),r=n[0].toLowerCase();a.attributePairs.forEach(function(e){-1!==r.indexOf(e.text)&&t.setAttribute(e.xml.attribute,e.xml.value)}),e=n[1]}0<e.length&&(t.textContent=e,o.appendChild(t))}}):o.innerHTML=e;t.appendChild(o)}),l=d(l,i.xslPrettyXML),(new XMLSerializer).serializeToString(l)},i.loadXml=function(e,t){var l=(new DOMParser).parseFromString(e,"text/xml");t.forEach(function(e){var t=l.querySelector(e.xmlElementName);if(t){var n=u.getHtmlElementOf(e,!1).element;if(e.type==c.BlobType.list){var r=t.querySelectorAll(e.xmlElementChildrenName),a=[];r.forEach(function(t){var n="";e.attributePairs&&(e.attributePairs.forEach(function(e){t.getAttribute(e.xml.attribute)==e.xml.value&&(n+=e.text)}),n+="|"),a.push(n+t.innerHTML)}),n.value=a.join("\n")}else if(0<=[c.BlobType.fulltext,c.BlobType.summary].indexOf(e.type)){var o=document.implementation.createDocument(null,"tmp",null);o.replaceChild(t,o.documentElement),o=d(o,i.xslPrettyXML),e.type==c.BlobType.fulltext?s.SetTextBody(m(o),!0,!0):n.value=m(o)}else console.log(e.name),n.value=t.innerHTML}})},i.unwrapXml=m,i.clear=function(t){n.displayDialog("Clear all fields","Are you sure? This will clear all fields and give you a clean slate.","yes",function(e){"yes"==e&&t.forEach(function(e){u.getHtmlElementOf(e,!1).element.value=""})})},i.transformXml=d},{"./codeview":3,"./decisiondialog":4,"./dom":5,"./interfaces":9}],14:[function(e,t,n){"use strict";n.__esModule=!0;var a=e("./modules/xml"),o=e("./modules/filemanagement"),r=e("./modules/codeview"),l=e("./modules/htmlview"),i=e("./modules/metadata"),c=e("./modules/mediawikisearch"),u=e("./modules/namesearch"),s=e("./DataBlobConfig");document.querySelector("section.toolbar button.wikisource").addEventListener("click",function(e){e.preventDefault();var t=document.querySelector(".metadata input[name=title]").value;c.displayDialog(t,"https://en.wikisource.org",r.SetTextBody)}),document.querySelector("section.toolbar button[value='find-names']").addEventListener("click",function(e){e.preventDefault(),u.displayDialog(r.GetTextBody(),s.dataBlobs)}),document.querySelector("section.toolbar button[value='export']").addEventListener("click",function(e){e.preventDefault();var t=a.makeXML(s.dataBlobs),n=document.querySelector(".metadata input[name=title]").value;0==n.length&&(n="Unknown");var r=n+".xml";o.saveFile(r,"text/xml",t)}),document.querySelector("section.toolbar button[value='import']").addEventListener("click",function(e){e.preventDefault(),o.loadFile(a.loadXml,s.dataBlobs)}),document.querySelector("section.toolbar button[value='clear']").addEventListener("click",function(e){e.preventDefault(),a.clear(s.dataBlobs)}),l.setup(s.dataBlobs),a.setup(s.dataBlobs),i.setupLists()},{"./DataBlobConfig":1,"./modules/codeview":3,"./modules/filemanagement":6,"./modules/htmlview":8,"./modules/mediawikisearch":10,"./modules/metadata":11,"./modules/namesearch":12,"./modules/xml":13}]},{},[14]);
//# sourceMappingURL=bundle.js.map
