!function o(l,i,c){function m(t,e){if(!i[t]){if(!l[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(u)return u(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var a=i[t]={exports:{}};l[t][0].call(a.exports,function(e){return m(l[t][1][e]||e)},a,a.exports,o,l,i,c)}return i[t].exports}for(var u="function"==typeof require&&require,e=0;e<c.length;e++)m(c[e]);return m}({1:[function(e,t,n){"use strict";n.__esModule=!0;var m=e("./formhandling");n.setupDialog=function(e,t,n){var r,a,o,l,i=document.querySelector(".big.dialog"),c=document.importNode(i,!0).content.querySelector("dialog");return document.querySelector("body").appendChild(c),c.querySelector("header h2").innerHTML=e,c.querySelector("form.search-box").classList.toggle("hidden",!t),c.querySelector("input.query").value="",c.querySelector("section.results ul").innerHTML="",c.querySelector("section.buttons").innerHTML="",c.querySelectorAll("section.buttons button").forEach(function(e){e.disabled=!0}),a=n,o=(r=c).querySelector("template.submit-button"),l=r.querySelector(".buttons"),a.forEach(function(e){var t=document.importNode(o.content,!0),n=t.querySelector("button");n.value=e.value,n.title=e.title,n.textContent=e.text,e.classes.forEach(function(e){n.classList.add(e)}),n.disabled=!0,l.appendChild(t)}),m.addValidation(c.querySelector("form.search-box")),m.addValidation(c.querySelector("form.search-results")),c}},{"./formhandling":4}],2:[function(e,t,n){"use strict";n.__esModule=!0,n.displayDialog=function(e,t,n,r){var a=document.querySelector("dialog.decision"),o=a.querySelector("h2"),l=a.querySelector("p");a.dataString=n,o.textContent=e,l.textContent=t,a.addEventListener("close",function(e){e.preventDefault();"yes"==this.returnValue&&r(this.dataString)}),a.showModal()}},{}],3:[function(e,t,n){"use strict";n.__esModule=!0,n.saveFile=function(e,t,n){if(null!=n&&navigator.msSaveBlob)return navigator.msSaveBlob(new Blob([n],{type:t}),e);var r=document.createElement("a");r.setAttribute("style","display:none");var a=window.URL.createObjectURL(new Blob([n],{type:t}));r.setAttribute("href",a),r.setAttribute("download",e),r.click(),window.URL.revokeObjectURL(a),r.remove()},n.loadFile=function(r){var e=document.createElement("input");e.type="file",e.addEventListener("change",function(e){var t=e.target.files[0],n=new FileReader;n.readAsText(t,"utf-8"),n.addEventListener("load",function(e){var t=e.target;0==t.result.length&&console.log("Uh-oh, spaghetti-o's! That file seems empty, just like my soul."),r(t.result)})}),e.click()}},{}],4:[function(e,t,n){"use strict";function r(e,t){e.querySelectorAll("button[type=submit]").forEach(function(e){e.disabled=!t})}n.__esModule=!0,n.addValidation=function(e){e.addEventListener("input",function(){r(this,this.checkValidity())})},n.SetSubmitButtonEnabled=r},{}],5:[function(e,t,n){"use strict";n.__esModule=!0;var r=e("./decisiondialog");n.SetTextBody=function(e,t){void 0===t&&(t=!0);var n=document.querySelector("main textarea.textcode");t?0!=n.value.length?r.displayDialog("Replace","Are you sure? This will mean losing the current text body.",e,function(e){n.value=e}):n.value=e:n.value+="\n\n"+e,n.dispatchEvent(new Event("input",{bubbles:!0})),document.querySelector("input#code").click()},n.GetTextBody=function(){return document.querySelector("main textarea.textcode").value}},{"./decisiondialog":2}],6:[function(e,t,n){"use strict";n.__esModule=!0;var o=e("./bigdialog"),m=e("./formhandling");function l(e){var t=e;return[{description:"Remove noinclude",regexp:/<noinclude>([\S\s]*?)<\/noinclude>/g,replacement:"$1"},{description:"Remove drop initial",regexp:/{{2}drop *initial\|(.)}{2}/g,replacement:"$1"},{description:"Remove small caps",regexp:/{{2}sc\|(.*?)}{2}/g,replacement:"$1"},{description:"Remove end notes",regexp:/==Endnotes==[\S\s]*$/g,replacement:""},{description:"Remove tooltips",regexp:/{{2}tooltip\|(.*?)\|.*?\}{2}/g,replacement:"$1"},{description:"Remove references",regexp:/<ref>.*?<\/ref>/g,replacement:""},{description:"Remove indentations",regexp:/\n[ \t]+/g,replacement:"\n"},{description:"Remove links",regexp:/\[{2}.*?\|(.*?)\]{2}/g,replacement:"$1"},{description:"Remove right-aligning",regexp:/{{2}right.*?\|(.*?)\}{2}/g,replacement:"$1"},{description:"Remove centering",regexp:/{{2}c.*?\|(.*?)}{2}/g,replacement:"$1"},{description:"Remove blocks",regexp:/{{2}block.*?\|(.*?)}{2}/gs,replacement:"$1"},{description:"Fix attributes without quotes",regexp:/<(.*?) (.*?)=([^"].*?)([ >])/,replacement:'<$1 $2="$3"$4',exhaust:!0},{description:"Heading",regexp:/{{2}xx-larger\|(.*?)}{2}\n* /g,replacement:"<h1>$1</h1>\n\n"},{description:"Chapter title",regexp:/==(.*?)==\n*/g,replacement:"<h2>$1</h2>\n\n"},{description:"Poem lines with 2 indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line)::(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line indent=2>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines with 1 indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line):(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line indent=1>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines without indent | EXHAUST",regexp:/<poem>([\S\s]*?)\n(?!<line)(.+?)\n([\S\s]*?)<\/poem>/g,replacement:"<poem>$1\n<line>$2</line>\n$3</poem>",exhaust:!0},{description:"Poem lines using br tag",regexp:/\n(.*)<br\/>/g,replacement:"\n<line>$1</line>"},{description:"Add paragraph </p><p>tags",regexp:/\n\n/g,replacement:"</p>\n\n<p>"},{description:"Remove last paragraph start tag (b/c logic)",regexp:/([\S\s]*)<p>/g,replacement:"$1"},{description:"Remove first paragraph end tag (b/ logic)",regexp:/<\/p>([\S\s]*)/g,replacement:"$1"},{description:"Remove line breaks after paragraph start",regexp:/<p>\n+/g,replacement:"<p>"},{description:"Reverse poem and paragraph start tags",regexp:/<p>\n*<poem>/g,replacement:"<poem>\n<p>"},{description:"Reverse poem and paragraph end tags",regexp:/<\/poem>\n*<\/p>/g,replacement:"</p>\n</poem>"},{description:"Separate first line of poem pagagraph from paragraph start tag",regexp:/<p><line>/g,replacement:"<p>\n<line>"},{description:"Separate last line of poem paragraph from paragraph end tag",regexp:/<\/line><\/p>/g,replacement:"</line>\n</p>"},{description:"Remove paragraph tags around headings",regexp:/<p><(h[0-5])>(.*?)<\/\1><\/p>/g,replacement:"<$1>$2</$1>\n\n"},{description:"'' to emph",regexp:/\'{2}(.*?)\'{2}/g,replacement:"<emph>$1</emph>"},{description:"Remove triple newlines",regexp:/\n\n\n/g,replacement:"\n\n",exhaust:!0},{description:"Remove double spaces",regexp:/  /g,replacement:" ",exhaust:!0},{description:"&nbsp; to space",regexp:/&nbsp;/g,replacement:" "},{description:"Ellipsis",regexp:/\. ?\. ?\./g,replacement:"…"}].forEach(function(e){if(e.exhaust)for(;0<=t.search(e.regexp);)t=t.replace(e.regexp,e.replacement);else t=t.replace(e.regexp,e.replacement)}),t}function i(e,t,a,o){fetch(t+"/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&rvslots=main&titles="+e).then(function(e){return e.json()}).then(function(e){var t=e.query.pages,n=t[Object.keys(t)[0]];if(n.revisions){var r=n.revisions[0].slots.main["*"];l(r);o(l(r),a)}})}n.displayDialog=function(e,t,n){var r=o.setupDialog("Download from Wikisource",!0,[{title:"Download and append to text",text:"Append",value:"append",classes:["fas","fa-file-medical"]},{title:"Download and replace current text",text:"Download",value:"replace",classes:["fas","fa-file-alt"]}]),a=r.querySelector("form.search-box");(a.wikiDialog=r).wikiUrl=t,r.callback=n,r.resultRowTemplate=r.querySelector(".result-row"),a.querySelector("input[type=text]").value=e,a.dispatchEvent(new Event("input")),a.addEventListener("submit",function(e){e.preventDefault();var t,c,n,r=this.wikiDialog,a=this.querySelector("input.query").value;r.query=a,t=a,n=(c=r).wikiUrl+"/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=15&srsearch="+t,fetch(n).then(function(e){return e.json()}).then(function(e){var t,n,r,a,o,l=e.query.search,i=[];l.forEach(function(e){i.push(e.title)}),t=i,r=(n=c).resultRowTemplate.content,a=n.querySelector(".results ul"),o=n.querySelector("form.search-results"),a.innerHTML="",0==t.length?(a.innerHTML="No results found for "+n.query+".",m.SetSubmitButtonEnabled(o,!1)):(t.forEach(function(e){var t=r.cloneNode(!0);t.querySelector(".text").innerHTML=e,t.querySelector("input[name=title]").value=e,a.appendChild(t)}),o.dispatchEvent(new Event("input")))})}),r.addEventListener("close",function(){var e=this;if("cancel"!=e.returnValue){var t=e.querySelector(".results input[type=radio][name=title]:checked");if(t){var n=t.value,r=e.wikiUrl;"replace"==e.returnValue?i(n,r,!0,e.callback):"append"==e.returnValue?i(n,r,!1,e.callback):alert("Whatcho talkin bout Willis?")}}e.remove()}),r.showModal()}},{"./bigdialog":1,"./formhandling":4}],7:[function(e,t,n){"use strict";n.__esModule=!0;var r=e("./bigdialog"),o=e("./xmlhandling"),l=e("./textareamanagement"),f=[{text:"Character",value:"character"},{text:"Creature",value:"creature"},{text:"Location",value:"location"},{text:"Book",value:"book"},{text:"Ignore",value:"ignore",checked:!0}];n.displayDialog=function(e){var t=r.setupDialog("Detected names",!1,[{title:"Append names to lists",text:"Append",value:"append",classes:["fas","fa-list"]},{title:"Cancel",text:"Cancel",value:"cancel",classes:["fas","fa-ban"]}]);!function(e,p,t){var g=t.querySelector(".results ul");if(g.innerHTML="",0<e.length){var x=t.querySelector(".complex-result-row"),h=t.querySelector(".complex-result-row.option");e.forEach(function(e){var t,n,r,a,o,l,i,c,m,u=document.importNode(x.content,!0),s=u.querySelector(".description"),d=u.querySelector(".details");s.innerText=e.matchText,d.innerHTML=(t=e,r="…"+(n=p).substring(Math.max(t.indexStart-24,0),t.indexStart),a=" <strong>"+t.matchText+"</strong> ",o=n.substring(t.indexEnd,Math.max(t.indexEnd+24,0))+"…",r=r.replace(/</g,"&lt;").replace(/>/g,"&gt;"),o=o.replace(/</g,"&lt;").replace(/>/g,"&gt;"),r+a+o),l=e.matchText,i=f,c=h,(m=u.querySelector(".item-options")).innerHTML="",i.forEach(function(e){var t=document.importNode(c.content,!0),n=t.querySelector("input"),r=t.querySelector("span");n.value=e.value,n.setAttribute("name",l),n.checked=e.checked,r.textContent=e.text,m.appendChild(t)}),g.appendChild(u)})}}(function(e,t){var n,r=[],a=[];for(;null!==(n=t.exec(e));){var o=n[1].trim();a.indexOf(o)<0&&(a.push(o),r.push({matchText:n[1].trim(),indexStart:n.index,indexEnd:t.lastIndex}))}return t.lastIndex=0,r}(e,/(?<![\.;:!?] *) (?:<emph>)?((?:[A-Z][\wéáà]+ ?)+),?/g),e,t),t.addEventListener("close",function(){if("append"==this.returnValue){var a={};o.dataPairs.filter(function(e){return 1==e.containsNames}).forEach(function(e){a[e.xmlElementChildrenName]={dataPair:e,content:[]}}),this.querySelectorAll("input[type=radio]:checked:not([value=ignore])").forEach(function(e){0<=Object.keys(a).indexOf(e.value)&&a[e.value].content.push(e.name)}),console.log(a),Object.keys(a).forEach(function(e){var t=a[e],n=l.getTextareaContents(t.dataPair.documentElementSelector),r=t.content.join("\n");0==n.length?l.setTextareaContents(t.dataPair.documentElementSelector,r,!1):l.setTextareaContents(t.dataPair.documentElementSelector,n+"\n"+r,!1)})}this.remove()}),t.showModal()}},{"./bigdialog":1,"./textareamanagement":8,"./xmlhandling":9}],8:[function(e,t,n){"use strict";n.__esModule=!0,n.getTextareaContents=function(e){return document.querySelector(e).textContent},n.setTextareaContents=function(e,t,n){document.querySelector(e).textContent=t}},{}],9:[function(e,t,n){"use strict";n.__esModule=!0;var r,a,o=e("./decisiondialog"),i=new DOMParser;(a=r=r||{})[a.input=0]="input",a[a.textarea=1]="textarea",n.dataPairs=[{name:"Title",xmlElementSelector:"title",documentElementSelector:".metadata input[name=title]",documentElementType:r.input,documentElementXmlWarningSelector:".metadata label.title span"},{name:"Author",xmlElementSelector:"author",documentElementSelector:".metadata input[name=author]",documentElementType:r.input,documentElementXmlWarningSelector:".metadata label.author span"},{name:"Written",xmlElementSelector:"written",documentElementSelector:".metadata input[name=written]",documentElementType:r.input,documentElementXmlWarningSelector:".metadata label.written span"},{name:"Published",xmlElementSelector:"published",documentElementSelector:".metadata input[name=published]",documentElementType:r.input,documentElementXmlWarningSelector:".metadata label.published span"},{name:"Summary",xmlElementSelector:"summary",documentElementSelector:"main .summary",documentElementType:r.textarea,documentElementXmlWarningSelector:"main .summary-heading"},{name:"Full text",xmlElementSelector:"body",documentElementSelector:"main .textcode",documentElementType:r.textarea,documentElementXmlWarningSelector:"main .text-heading"},{name:"Tags",xmlElementSelector:"tags",documentElementSelector:".metadata section.tags textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.tags h2",xmlElementChildrenName:"tag"},{name:"Characters",containsNames:!0,xmlElementSelector:"characters",documentElementSelector:".metadata section.characters textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.characters h2",xmlElementChildrenName:"character",xmlElementAttributes:[{text:"m",xml:{attribute:"gender",value:"male"}},{text:"f",xml:{attribute:"gender",value:"female"}},{text:"o",xml:{attribute:"gender",value:"other"}},{text:"u",xml:{attribute:"gender",value:"unknown"}},{text:"1",xml:{attribute:"type",value:"main"}},{text:"2",xml:{attribute:"type",value:"interacted"}},{text:"3",xml:{attribute:"type",value:"mentioned"}}]},{name:"Creatures",containsNames:!0,xmlElementSelector:"creatures",documentElementSelector:".metadata section.creatures textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.creatures h2",xmlElementChildrenName:"creature"},{name:"Books",containsNames:!0,xmlElementSelector:"books",documentElementSelector:".metadata section.books textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.books h2",xmlElementChildrenName:"book"},{name:"Locations",containsNames:!0,xmlElementSelector:"locations",documentElementSelector:".metadata section.locations textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.locations h2",xmlElementChildrenName:"location"},{name:"Phobias",xmlElementSelector:"phobias",documentElementSelector:".metadata section.phobias textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.phobias h2",xmlElementChildrenName:"phobia"},{name:"Notes",xmlElementSelector:"notes",documentElementSelector:".metadata section.notes textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.notes h2",xmlElementChildrenName:"note"},{name:"Related reading",xmlElementSelector:"relatedreading",documentElementSelector:".metadata section.related-links textarea",documentElementType:r.textarea,documentElementXmlWarningSelector:".metadata section.related-links h2",xmlElementChildrenName:"link"}],n.setupXMLValidation=function(){n.dataPairs.forEach(function(e){var t=document.querySelector(e.documentElementSelector);t.warningElement=document.querySelector(e.documentElementXmlWarningSelector),t.addEventListener("input",function(e){var t="<body>"+this.value+"</body>",n=i.parseFromString(t,"text/xml");this.warningElement.classList.toggle("xmlwarning",!!n.querySelector("parsererror")),document.querySelector(".toolbar button.export").disabled=!!n.querySelector("parsererror")})})},n.makeXML=function(){var l=i.parseFromString('<?xml version = "1.0"?>\n      <work>\n          <title/>\n          <author/>\n          <written/>\n          <published/>\n          <tags/>\n          <body/>\n          <summary/>\n          <characters/>\n          <creatures/>\n          <books/>\n          <locations/>\n          <phobias/>\n          <notes/>\n          <relatedreading/>\n      </work>\n      ',"text/xml");return n.dataPairs.forEach(function(a){var e,o=l.querySelector(a.xmlElementSelector);a.documentElementType==r.input?e=document.querySelector(a.documentElementSelector).value:e=document.querySelector(a.documentElementSelector).value;a.xmlElementChildrenName?e.split(/[\r\n]+/).forEach(function(e){if(0<(e=e.trim()).length){var t=l.createElement(a.xmlElementChildrenName);if(a.xmlElementAttributes&&-1!==e.indexOf("|")){var n=e.split("|",2),r=n[0].toLowerCase();a.xmlElementAttributes.forEach(function(e){-1!==r.indexOf(e.text)&&t.setAttribute(e.xml.attribute,e.xml.value)}),e=n[1]}0<e.length&&(t.textContent=e,o.appendChild(t))}}):o.innerHTML=e}),(new XMLSerializer).serializeToString(l)},n.LoadXml=function(e){var o=i.parseFromString(e,"text/xml");n.dataPairs.forEach(function(e){var t=o.querySelector(e.xmlElementSelector),n=document.querySelector(e.documentElementSelector);if(e.xmlElementChildrenName){var r=t.querySelectorAll(e.xmlElementChildrenName),a=[];r.forEach(function(t){var n="";e.xmlElementAttributes&&(e.xmlElementAttributes.forEach(function(e){t.getAttribute(e.xml.attribute)==e.xml.value&&(n+=e.text)}),n+="|"),a.push(n+t.innerHTML)}),n.value=a.join("\n")}else n.value=t.innerHTML})},n.Clear=function(){o.displayDialog("Cear all fields","Are you sure? This will clear all fields and give you a clean slate.","yes",function(e){"yes"==e&&n.dataPairs.forEach(function(e){document.querySelectorAll(e.documentElementSelector).forEach(function(e){e.value=""})})})}},{"./decisiondialog":2}],10:[function(e,t,n){"use strict";n.__esModule=!0;var a=e("./modules/xmlhandling"),o=e("./modules/filemanagement"),r=e("./modules/fulltextmanagement"),l=e("./modules/mediawikisearch"),i=e("./modules/namesearch");document.querySelector("section.toolbar button.wikisource").addEventListener("click",function(e){e.preventDefault();var t=document.querySelector(".metadata input[name=title]").value;l.displayDialog(t,"https://en.wikisource.org",r.SetTextBody)}),document.querySelector("section.toolbar button.find-names").addEventListener("click",function(e){e.preventDefault(),i.displayDialog(r.GetTextBody())}),document.querySelector("section.toolbar button.export").addEventListener("click",function(e){e.preventDefault();var t=a.makeXML(),n=document.querySelector(".metadata input[name=title]").value;0==n.length&&(n="Unknown");var r=n+".xml";o.saveFile(r,"text/xml",t)}),document.querySelector("section.toolbar button.import").addEventListener("click",function(e){e.preventDefault(),o.loadFile(a.LoadXml)}),document.querySelector("section.toolbar button.clear").addEventListener("click",function(e){e.preventDefault(),a.Clear()}),a.setupXMLValidation()},{"./modules/filemanagement":3,"./modules/fulltextmanagement":5,"./modules/mediawikisearch":6,"./modules/namesearch":7,"./modules/xmlhandling":9}]},{},[10]);
//# sourceMappingURL=bundle.js.map
