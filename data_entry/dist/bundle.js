(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var FormHandling = require("./formhandling");
function setupDialog(title, useSearchForm, submitButtons) {
    var dialogTemplate = document.querySelector(".big.dialog");
    var dialogFragment = document.importNode(dialogTemplate, true).content;
    var dialog = dialogFragment.querySelector("dialog");
    document.querySelector("body").appendChild(dialog);
    dialog.querySelector("header h2").innerHTML = title;
    dialog.querySelector("form.search-box").classList.toggle("hidden", !useSearchForm);
    dialog.querySelector("input.query").value = "";
    dialog.querySelector("section.results ul").innerHTML = "";
    dialog.querySelector("section.buttons").innerHTML = "";
    dialog.querySelectorAll("section.buttons button").forEach(function (button) {
        button.disabled = true;
    });
    setupSubmitButtons(dialog, submitButtons);
    FormHandling.addValidation(dialog.querySelector("form.search-box"));
    FormHandling.addValidation(dialog.querySelector("form.search-results"));
    return dialog;
}
exports.setupDialog = setupDialog;
function setupSubmitButtons(dialog, submitButtons) {
    var submitButtonTemplate = dialog.querySelector("template.submit-button");
    var submitButtonContainer = dialog.querySelector(".buttons");
    submitButtons.forEach(function (buttonInfo) {
        var submitButtonFragment = document.importNode(submitButtonTemplate.content, true);
        var submitButtonElement = submitButtonFragment.querySelector("button");
        submitButtonElement.value = buttonInfo.value;
        submitButtonElement.title = buttonInfo.title;
        submitButtonElement.textContent = buttonInfo.text;
        buttonInfo.classes.forEach(function (buttonClass) {
            submitButtonElement.classList.add(buttonClass);
        });
        submitButtonElement.disabled = true;
        submitButtonContainer.appendChild(submitButtonFragment);
    });
}
},{"./formhandling":4}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function displayDialog(title, description, dataString, callback) {
    var dialog = document.querySelector("dialog.decision");
    var dialogTitle = dialog.querySelector("h2");
    var dialogDescription = dialog.querySelector("p");
    dialog.dataString = dataString;
    dialogTitle.textContent = title;
    dialogDescription.textContent = description;
    dialog.addEventListener("close", function (event) {
        event.preventDefault();
        var dialog = this;
        if (this.returnValue == "yes") {
            callback(dialog.dataString);
        }
    });
    dialog.showModal();
}
exports.displayDialog = displayDialog;
},{}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function saveFile(name, mime, data) {
    if (data != null && navigator.msSaveBlob)
        return navigator.msSaveBlob(new Blob([data], { type: mime }), name);
    var linkElement = document.createElement("a");
    linkElement.setAttribute("style", "display:none");
    var url = window.URL.createObjectURL(new Blob([data], { type: mime }));
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", name);
    linkElement.click();
    window.URL.revokeObjectURL(url);
    linkElement.remove();
}
exports.saveFile = saveFile;
function loadFile(callback) {
    var inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.addEventListener("change", function (event) {
        var eventTarget = event.target;
        var file = eventTarget.files[0];
        var fileReader = new FileReader();
        fileReader.readAsText(file, "utf-8");
        fileReader.addEventListener("load", function (event) {
            var fileReader = event.target;
            if (fileReader.result.length == 0) {
                console.log("Uh-oh, spaghetti-o's! That file seems empty, just like my soul.");
            }
            callback(fileReader.result);
        });
    });
    inputElement.click();
}
exports.loadFile = loadFile;
},{}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function addValidation(form) {
    form.addEventListener("input", function () {
        var form = this;
        SetSubmitButtonEnabled(form, form.checkValidity());
    });
}
exports.addValidation = addValidation;
function SetSubmitButtonEnabled(form, state) {
    form.querySelectorAll("button[type=submit]").forEach(function (button) {
        button.disabled = !state;
    });
}
exports.SetSubmitButtonEnabled = SetSubmitButtonEnabled;
},{}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var BigDialog = require("./bigdialog");
var FormHandling = require("./formhandling");
function displayDialog(defaultSearch, wikiUrl, callback) {
    var dialog = BigDialog.setupDialog("Download from Wikisource", true, [
        {
            title: "Download and append to text",
            text: "Append",
            value: "append",
            classes: ["fas", "fa-file-medical"]
        },
        {
            title: "Download and replace current text",
            text: "Download",
            value: "replace",
            classes: ["fas", "fa-file-alt"]
        }
    ]);
    var searchForm = dialog.querySelector("form.search-box");
    searchForm.wikiDialog = dialog;
    dialog.wikiUrl = wikiUrl;
    dialog.callback = callback;
    dialog.resultRowTemplate = dialog.querySelector(".result-row");
    var searchBox = searchForm.querySelector("input[type=text]");
    searchBox.value = defaultSearch;
    searchForm.dispatchEvent(new Event("input"));
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var dialog = this.wikiDialog;
        var query = this.querySelector("input.query").value;
        dialog.query = query;
        searchMediaWiki(query, dialog);
    });
    dialog.addEventListener("close", function () {
        var dialog = this;
        if (dialog.returnValue != "cancel") {
            var selectedItem = dialog.querySelector(".results input[type=radio][name=title]:checked");
            if (selectedItem) {
                var title = selectedItem.value;
                var wikiUrl_1 = dialog.wikiUrl;
                if (dialog.returnValue == "replace") {
                    getMediaWikiText(title, wikiUrl_1, true, dialog.callback);
                }
                else if (dialog.returnValue == "append") {
                    getMediaWikiText(title, wikiUrl_1, false, dialog.callback);
                }
                else {
                    alert("Whatcho talkin bout Willis?");
                }
            }
        }
        dialog.remove();
    });
    dialog.showModal();
}
exports.displayDialog = displayDialog;
function searchMediaWiki(query, dialog) {
    var endpoint = dialog.wikiUrl + "/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=15&srsearch=" + query;
    fetch(endpoint)
        .then(function (response) { return response.json(); })
        .then(function (data) {
        var searchResults = data.query.search;
        var titles = [];
        searchResults.forEach(function (result) {
            titles.push(result.title);
        });
        displaySearchResults(titles, dialog);
    });
}
function displaySearchResults(titles, dialog) {
    var template = dialog.resultRowTemplate.content;
    var container = dialog.querySelector(".results ul");
    var resultsForm = dialog.querySelector("form.search-results");
    container.innerHTML = "";
    if (titles.length == 0) {
        container.innerHTML = "No results found for " + dialog.query + ".";
        FormHandling.SetSubmitButtonEnabled(resultsForm, false);
    }
    else {
        titles.forEach(function (title) {
            var row = template.cloneNode(true);
            row.querySelector(".text").innerHTML = title;
            row.querySelector("input[name=title]").value = title;
            container.appendChild(row);
        });
        resultsForm.dispatchEvent(new Event("input"));
    }
}
function wikiToXML(text) {
    var replacements = [
        {
            description: "Remove noinclude",
            regexp: /<noinclude>([\S\s]*?)<\/noinclude>/g,
            replacement: "$1"
        },
        {
            description: "Remove drop initial",
            regexp: /{{2}drop *initial\|(.)}{2}/g,
            replacement: "$1"
        },
        {
            description: "Remove small caps",
            regexp: /{{2}sc\|(.*?)}{2}/g,
            replacement: "$1"
        },
        {
            description: "Remove end notes",
            regexp: /==Endnotes==[\S\s]*$/g,
            replacement: ""
        },
        {
            description: "Remove tooltips",
            regexp: /{{2}tooltip\|(.*?)\|.*?\}{2}/g,
            replacement: "$1"
        },
        {
            description: "Remove references",
            regexp: /<ref>.*?<\/ref>/g,
            replacement: ""
        },
        {
            description: "Remove indentations",
            regexp: /\n[ \t]+/g,
            replacement: "\n"
        },
        {
            description: "Remove links",
            regexp: /\[{2}.*?\|(.*?)\]{2}/g,
            replacement: "$1"
        },
        {
            description: "Remove right-aligning",
            regexp: /{{2}right.*?\|(.*?)\}{2}/g,
            replacement: "$1"
        },
        {
            description: "Remove centering",
            regexp: /{{2}c.*?\|(.*?)}{2}/g,
            replacement: "$1"
        },
        {
            description: "Remove blocks",
            regexp: /{{2}block.*?\|(.*?)}{2}/gs,
            replacement: "$1"
        },
        {
            description: "Fix attributes without quotes",
            regexp: /<(.*?) (.*?)=([^"].*?)([ >])/,
            replacement: '<$1 $2="$3"$4',
            exhaust: true
        },
        {
            description: "Heading",
            regexp: /{{2}xx-larger\|(.*?)}{2}\n* /g,
            replacement: "<h1>$1</h1>\n\n"
        },
        {
            description: "Chapter title",
            regexp: /==(.*?)==\n*/g,
            replacement: "<h2>$1</h2>\n\n"
        },
        {
            description: "Poem lines with 2 indent | EXHAUST",
            regexp: /<poem>([\S\s]*?)\n(?!<line)::(.+?)\n([\S\s]*?)<\/poem>/g,
            replacement: "<poem>$1\n<line indent=2>$2</line>\n$3</poem>",
            exhaust: true
        },
        {
            description: "Poem lines with 1 indent | EXHAUST",
            regexp: /<poem>([\S\s]*?)\n(?!<line):(.+?)\n([\S\s]*?)<\/poem>/g,
            replacement: "<poem>$1\n<line indent=1>$2</line>\n$3</poem>",
            exhaust: true
        },
        {
            description: "Poem lines without indent | EXHAUST",
            regexp: /<poem>([\S\s]*?)\n(?!<line)(.+?)\n([\S\s]*?)<\/poem>/g,
            replacement: "<poem>$1\n<line>$2</line>\n$3</poem>",
            exhaust: true
        },
        {
            description: "Poem lines using br tag",
            regexp: /\n(.*)<br\/>/g,
            replacement: "\n<line>$1</line>"
        },
        {
            description: "Add paragraph </p><p>tags",
            regexp: /\n\n/g,
            replacement: "</p>\n\n<p>"
        },
        {
            description: "Remove last paragraph start tag (b/c logic)",
            regexp: /([\S\s]*)<p>/g,
            replacement: "$1"
        },
        {
            description: "Remove first paragraph end tag (b/ logic)",
            regexp: /<\/p>([\S\s]*)/g,
            replacement: "$1"
        },
        {
            description: "Remove line breaks after paragraph start",
            regexp: /<p>\n+/g,
            replacement: "<p>"
        },
        {
            description: "Reverse poem and paragraph start tags",
            regexp: /<p>\n*<poem>/g,
            replacement: "<poem>\n<p>"
        },
        {
            description: "Reverse poem and paragraph end tags",
            regexp: /<\/poem>\n*<\/p>/g,
            replacement: "</p>\n</poem>"
        },
        {
            description: "Separate first line of poem pagagraph from paragraph start tag",
            regexp: /<p><line>/g,
            replacement: "<p>\n<line>"
        },
        {
            description: "Separate last line of poem paragraph from paragraph end tag",
            regexp: /<\/line><\/p>/g,
            replacement: "</line>\n</p>"
        },
        {
            description: "Remove paragraph tags around headings",
            regexp: /<p><(h[0-5])>(.*?)<\/\1><\/p>/g,
            replacement: "<$1>$2</$1>\n\n"
        },
        {
            description: "'' to emph",
            regexp: /\'{2}(.*?)\'{2}/g,
            replacement: "<emph>$1</emph>"
        },
        {
            description: "Remove triple newlines",
            regexp: /\n\n\n/g,
            replacement: "\n\n",
            exhaust: true
        },
        {
            description: "Remove double spaces",
            regexp: /  /g,
            replacement: " ",
            exhaust: true
        },
        {
            description: "&nbsp; to space",
            regexp: /&nbsp;/g,
            replacement: " "
        },
        {
            description: "Ellipsis",
            regexp: /\. ?\. ?\./g,
            replacement: "…"
        }
    ];
    var convertedText = text;
    replacements.forEach(function (replacement) {
        if (replacement.exhaust) {
            while (convertedText.search(replacement.regexp) >= 0) {
                convertedText = convertedText.replace(replacement.regexp, replacement.replacement);
            }
        }
        else {
            convertedText = convertedText.replace(replacement.regexp, replacement.replacement);
        }
    });
    return convertedText;
}
function getMediaWikiText(article, wikiUrl, replace, resultHandler) {
    var endpoint = wikiUrl + "/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&rvslots=main&titles=" + article;
    fetch(endpoint)
        .then(function (response) { return response.json(); })
        .then(function (data) {
        var pages = data.query.pages;
        var page = pages[Object.keys(pages)[0]];
        if (page.revisions) {
            var text = page.revisions[0].slots.main["*"];
            var convertedText = wikiToXML(text);
            resultHandler(wikiToXML(text), replace);
        }
    });
}
},{"./bigdialog":1,"./formhandling":4}],6:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var BigDialog = require("./bigdialog");
var XMLHandling = require("./xmlhandling");
var TextAreaManagement = require("./textareamanagement");
var itemOptions = [
    {
        text: "Character",
        value: "character"
    },
    {
        text: "Creature",
        value: "creature"
    },
    {
        text: "Location",
        value: "location"
    },
    {
        text: "Book",
        value: "book"
    },
    {
        text: "Ignore",
        value: "ignore",
        checked: true
    }
];
function displayDialog(text) {
    var dialog = BigDialog.setupDialog("Detected names", false, [
        {
            title: "Append names to lists",
            text: "Append",
            value: "append",
            classes: ["fas", "fa-list"]
        },
        {
            title: "Cancel",
            text: "Cancel",
            value: "cancel",
            classes: ["fas", "fa-ban"]
        }
    ]);
    var nameRegex = /(?<![\.;:!?] *) (?:<emph>)?((?:[A-Z][\wéáà]+ ?)+),?/g;
    var possibleNames = findUniqueMatches(text, nameRegex);
    displayMatches(possibleNames, text, dialog);
    dialog.addEventListener("close", function () {
        var dialog = this;
        if (dialog.returnValue == "append") {
            var categorized_1 = {};
            var dataPairs = XMLHandling.dataPairs.filter(function (pair) { return pair.containsNames == true; });
            dataPairs.forEach(function (pair) {
                categorized_1[pair.xmlElementChildrenName] = {
                    dataPair: pair,
                    content: []
                };
            });
            var checkedElements = dialog.querySelectorAll("input[type=radio]:checked:not([value=ignore])");
            checkedElements.forEach(function (element) {
                if (Object.keys(categorized_1).indexOf(element.value) >= 0) {
                    var category = categorized_1[element.value].content;
                    category.push(element.name);
                }
            });
            console.log(categorized_1);
            Object.keys(categorized_1).forEach(function (categoryName) {
                var category = categorized_1[categoryName];
                var currentTextContent = TextAreaManagement.getTextareaContents(category.dataPair.documentElementSelector);
                var newTextContent = category.content.join("\n");
                if (currentTextContent.length == 0) {
                    TextAreaManagement.setTextareaContents(category.dataPair.documentElementSelector, newTextContent, false);
                }
                else {
                    TextAreaManagement.setTextareaContents(category.dataPair.documentElementSelector, currentTextContent + "\n" + newTextContent, false);
                }
            });
        }
        dialog.remove();
    });
    dialog.showModal();
}
exports.displayDialog = displayDialog;
function displayMatches(matches, text, dialog) {
    var resultsContainer = dialog.querySelector(".results ul");
    resultsContainer.innerHTML = "";
    if (matches.length > 0) {
        var template_1 = dialog.querySelector(".complex-result-row");
        var optionTemplate_1 = dialog.querySelector(".complex-result-row.option");
        matches.forEach(function (match) {
            var rowElement = document.importNode(template_1.content, true);
            var textElement = rowElement.querySelector(".description");
            var detailsElement = rowElement.querySelector(".details");
            textElement.innerText = match.matchText;
            detailsElement.innerHTML = makeAbstract(match, text);
            makeOptionItems(match.matchText, itemOptions, rowElement, optionTemplate_1);
            resultsContainer.appendChild(rowElement);
        });
    }
}
function makeOptionItems(name, itemOptions, rowElement, optionTemplate) {
    var optionsContainer = rowElement.querySelector(".item-options");
    optionsContainer.innerHTML = "";
    itemOptions.forEach(function (itemOption) {
        var optionElement = document.importNode(optionTemplate.content, true);
        var inputElement = optionElement.querySelector("input");
        var spanElement = optionElement.querySelector("span");
        inputElement.value = itemOption.value;
        inputElement.setAttribute("name", name);
        inputElement.checked = itemOption.checked;
        spanElement.textContent = itemOption.text;
        optionsContainer.appendChild(optionElement);
    });
}
function makeAbstract(matchGroup, text) {
    var abstractStart = "…" + text.substring(Math.max(matchGroup.indexStart - 24, 0), matchGroup.indexStart);
    var abstractMain = " <strong>" + matchGroup.matchText + "</strong> ";
    var abstractEnd = text.substring(matchGroup.indexEnd, Math.max(matchGroup.indexEnd + 24, 0)) + "…";
    abstractStart = abstractStart.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    abstractEnd = abstractEnd.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return abstractStart + abstractMain + abstractEnd;
}
function findUniqueMatches(text, regExp) {
    var matches = [];
    var groups;
    var foundNames = [];
    while ((groups = regExp.exec(text)) !== null) {
        var match = groups[1].trim();
        if (foundNames.indexOf(match) < 0) {
            foundNames.push(match);
            matches.push({
                matchText: groups[1].trim(),
                indexStart: groups.index,
                indexEnd: regExp.lastIndex
            });
        }
    }
    regExp.lastIndex = 0;
    return matches;
}
},{"./bigdialog":1,"./textareamanagement":7,"./xmlhandling":8}],7:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function getTextareaContents(selector) {
    return document.querySelector(selector).textContent;
}
exports.getTextareaContents = getTextareaContents;
function setTextareaContents(selector, newContent, warnIfNotFull) {
    var textArea = document.querySelector(selector);
    textArea.textContent = newContent;
}
exports.setTextareaContents = setTextareaContents;
},{}],8:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var DecisionDialog = require("./decisiondialog");
var domParser = new DOMParser();
var DocNodeType;
(function (DocNodeType) {
    DocNodeType[DocNodeType["input"] = 0] = "input";
    DocNodeType[DocNodeType["textarea"] = 1] = "textarea";
})(DocNodeType || (DocNodeType = {}));
exports.dataPairs = [
    {
        name: "Title",
        xmlElementSelector: "title",
        documentElementSelector: ".metadata input[name=title]",
        documentElementType: DocNodeType.input,
        documentElementXmlWarningSelector: ".metadata label.title span"
    },
    {
        name: "Author",
        xmlElementSelector: "author",
        documentElementSelector: ".metadata input[name=author]",
        documentElementType: DocNodeType.input,
        documentElementXmlWarningSelector: ".metadata label.author span"
    },
    {
        name: "Written",
        xmlElementSelector: "written",
        documentElementSelector: ".metadata input[name=written]",
        documentElementType: DocNodeType.input,
        documentElementXmlWarningSelector: ".metadata label.written span"
    },
    {
        name: "Published",
        xmlElementSelector: "published",
        documentElementSelector: ".metadata input[name=published]",
        documentElementType: DocNodeType.input,
        documentElementXmlWarningSelector: ".metadata label.published span"
    },
    {
        name: "Summary",
        xmlElementSelector: "summary",
        documentElementSelector: "main .summary",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: "main .summary-heading"
    },
    {
        name: "Full text",
        xmlElementSelector: "body",
        documentElementSelector: "main .text",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: "main .text-heading"
    },
    {
        name: "Tags",
        xmlElementSelector: "tags",
        documentElementSelector: ".metadata section.tags textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.tags h2",
        xmlElementChildrenName: "tag"
    },
    {
        name: "Characters",
        containsNames: true,
        xmlElementSelector: "characters",
        documentElementSelector: ".metadata section.characters textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.characters h2",
        xmlElementChildrenName: "character",
        xmlElementAttributes: [
            {
                text: "m",
                xml: {
                    attribute: "gender",
                    value: "male"
                }
            },
            {
                text: "f",
                xml: {
                    attribute: "gender",
                    value: "female"
                }
            },
            {
                text: "o",
                xml: {
                    attribute: "gender",
                    value: "other"
                }
            },
            {
                text: "u",
                xml: {
                    attribute: "gender",
                    value: "unknown"
                }
            },
            {
                text: "1",
                xml: {
                    attribute: "type",
                    value: "main"
                }
            },
            {
                text: "2",
                xml: {
                    attribute: "type",
                    value: "interacted"
                }
            },
            {
                text: "3",
                xml: {
                    attribute: "type",
                    value: "mentioned"
                }
            }
        ]
    },
    {
        name: "Creatures",
        containsNames: true,
        xmlElementSelector: "creatures",
        documentElementSelector: ".metadata section.creatures textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.creatures h2",
        xmlElementChildrenName: "creature"
    },
    {
        name: "Books",
        containsNames: true,
        xmlElementSelector: "books",
        documentElementSelector: ".metadata section.books textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.books h2",
        xmlElementChildrenName: "book"
    },
    {
        name: "Locations",
        containsNames: true,
        xmlElementSelector: "locations",
        documentElementSelector: ".metadata section.locations textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.locations h2",
        xmlElementChildrenName: "location"
    },
    {
        name: "Phobias",
        xmlElementSelector: "phobias",
        documentElementSelector: ".metadata section.phobias textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.phobias h2",
        xmlElementChildrenName: "phobia"
    },
    {
        name: "Notes",
        xmlElementSelector: "notes",
        documentElementSelector: ".metadata section.notes textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.notes h2",
        xmlElementChildrenName: "note"
    },
    {
        name: "Related reading",
        xmlElementSelector: "relatedreading",
        documentElementSelector: ".metadata section.related-links textarea",
        documentElementType: DocNodeType.textarea,
        documentElementXmlWarningSelector: ".metadata section.related-links h2",
        xmlElementChildrenName: "link"
    }
];
function setupXMLValidation() {
    exports.dataPairs.forEach(function (pair) {
        var element = document.querySelector(pair.documentElementSelector);
        element.warningElement = document.querySelector(pair.documentElementXmlWarningSelector);
        element.addEventListener("input", function (event) {
            var element = this;
            var xmlString = "<body>" + element.value + "</body>";
            var testDom = domParser.parseFromString(xmlString, "text/xml");
            element.warningElement.classList.toggle("xmlwarning", !!testDom.querySelector("parsererror"));
            var exportButtonElement = document.querySelector(".toolbar button.export");
            exportButtonElement.disabled = !!testDom.querySelector("parsererror");
        });
    });
}
exports.setupXMLValidation = setupXMLValidation;
function makeXML() {
    var xmlTemplate = "<?xml version = \"1.0\"?>\n      <work>\n          <title/>\n          <author/>\n          <written/>\n          <published/>\n          <tags/>\n          <body/>\n          <summary/>\n          <characters/>\n          <creatures/>\n          <books/>\n          <locations/>\n          <phobias/>\n          <notes/>\n          <relatedreading/>\n      </work>\n      ";
    var xmlDocument = domParser.parseFromString(xmlTemplate, "text/xml");
    exports.dataPairs.forEach(function (pair) {
        var xmlElement = xmlDocument.querySelector(pair.xmlElementSelector);
        var text;
        if (pair.documentElementType == DocNodeType.input) {
            var documentElement = document.querySelector(pair.documentElementSelector);
            text = documentElement.value;
        }
        else {
            var documentElement = document.querySelector(pair.documentElementSelector);
            text = documentElement.value;
        }
        if (pair.xmlElementChildrenName) {
            var lines = text.split(/[\r\n]+/);
            lines.forEach(function (line) {
                line = line.trim();
                if (line.length > 0) {
                    var xmlChildElement_1 = xmlDocument.createElement(pair.xmlElementChildrenName);
                    if (pair.xmlElementAttributes && line.indexOf("|") !== -1) {
                        var parts = line.split("|", 2);
                        var attributes_1 = parts[0].toLowerCase();
                        pair.xmlElementAttributes.forEach(function (attributePair) {
                            if (attributes_1.indexOf(attributePair.text) !== -1) {
                                xmlChildElement_1.setAttribute(attributePair.xml.attribute, attributePair.xml.value);
                            }
                        });
                        line = parts[1];
                    }
                    if (line.length > 0) {
                        xmlChildElement_1.textContent = line;
                        xmlElement.appendChild(xmlChildElement_1);
                    }
                }
            });
        }
        else {
            xmlElement.innerHTML = text;
        }
    });
    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(xmlDocument);
    return xmlString;
}
exports.makeXML = makeXML;
function LoadXml(xmlText) {
    var XmlDocument = domParser.parseFromString(xmlText, "text/xml");
    exports.dataPairs.forEach(function (pair) {
        var xmlElement = XmlDocument.querySelector(pair.xmlElementSelector);
        var documentElement = document.querySelector(pair.documentElementSelector);
        if (pair.xmlElementChildrenName) {
            var xmlChildElements = xmlElement.querySelectorAll(pair.xmlElementChildrenName);
            var textElements_1 = [];
            xmlChildElements.forEach(function (childElement) {
                var attributePreamble = "";
                if (pair.xmlElementAttributes) {
                    pair.xmlElementAttributes.forEach(function (attributePair) {
                        if (childElement.getAttribute(attributePair.xml.attribute) == attributePair.xml.value) {
                            attributePreamble += attributePair.text;
                        }
                    });
                    attributePreamble += "|";
                }
                textElements_1.push(attributePreamble + childElement.innerHTML);
            });
            documentElement.value = textElements_1.join("\n");
        }
        else {
            documentElement.value = xmlElement.innerHTML;
        }
    });
}
exports.LoadXml = LoadXml;
function Clear() {
    DecisionDialog.displayDialog("Cear all fields", "Are you sure? This will clear all fields and give you a clean slate.", "yes", function (decision) {
        if (decision == "yes") {
            exports.dataPairs.forEach(function (dataPair) {
                var elements = document.querySelectorAll(dataPair.documentElementSelector);
                elements.forEach(function (element) {
                    element.value = "";
                });
            });
        }
    });
}
exports.Clear = Clear;
},{"./decisiondialog":2}],9:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var XMLHandling = require("./modules/xmlhandling");
var FileManagement = require("./modules/filemanagement");
var DecisionDialog = require("./modules/decisiondialog");
var MediaWikiSearch = require("./modules/mediawikisearch");
var NameSearch = require("./modules/namesearch");
function SetTextBody(text, replace) {
    if (replace === void 0) { replace = true; }
    var textBodyElement = document.querySelector("main textarea.text");
    if (replace) {
        if (textBodyElement.value.length != 0) {
            DecisionDialog.displayDialog("Replace", "Are you sure? This will mean losing the current text body.", text, function (text) {
                textBodyElement.value = text;
            });
        }
        else {
            textBodyElement.value = text;
        }
    }
    else {
        textBodyElement.value += "\n\n" + text;
    }
    textBodyElement.dispatchEvent(new Event("input", { bubbles: true }));
}
function setupToolbar() {
    document.querySelector("section.toolbar button.wikisource").addEventListener("click", function (event) {
        event.preventDefault();
        var title = document.querySelector(".metadata input[name=title]").value;
        MediaWikiSearch.displayDialog(title, "https://en.wikisource.org", SetTextBody);
    });
    document.querySelector("section.toolbar button.find-names").addEventListener("click", function (event) {
        event.preventDefault();
        var textBodyElement = document.querySelector("main textarea.text");
        NameSearch.displayDialog(textBodyElement.value);
    });
    document.querySelector("section.toolbar button.export").addEventListener("click", function (event) {
        event.preventDefault();
        var xmlString = XMLHandling.makeXML();
        var title = document.querySelector(".metadata input[name=title]").value;
        if (title.length == 0) {
            title = "Unknown";
        }
        var filename = title + ".xml";
        FileManagement.saveFile(filename, "text/xml", xmlString);
    });
    document.querySelector("section.toolbar button.import").addEventListener("click", function (event) {
        event.preventDefault();
        FileManagement.loadFile(XMLHandling.LoadXml);
    });
    document.querySelector("section.toolbar button.clear").addEventListener("click", function (event) {
        event.preventDefault();
        XMLHandling.Clear();
    });
}
setupToolbar();
XMLHandling.setupXMLValidation();
},{"./modules/decisiondialog":2,"./modules/filemanagement":3,"./modules/mediawikisearch":5,"./modules/namesearch":6,"./modules/xmlhandling":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvbW9kdWxlcy9iaWdkaWFsb2cudHMiLCJzcmMvdHMvbW9kdWxlcy9kZWNpc2lvbmRpYWxvZy50cyIsInNyYy90cy9tb2R1bGVzL2ZpbGVtYW5hZ2VtZW50LnRzIiwic3JjL3RzL21vZHVsZXMvZm9ybWhhbmRsaW5nLnRzIiwic3JjL3RzL21vZHVsZXMvbWVkaWF3aWtpc2VhcmNoLnRzIiwic3JjL3RzL21vZHVsZXMvbmFtZXNlYXJjaC50cyIsInNyYy90cy9tb2R1bGVzL3RleHRhcmVhbWFuYWdlbWVudC50cyIsInNyYy90cy9tb2R1bGVzL3htbGhhbmRsaW5nLnRzIiwic3JjL3RzL3NjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsNkNBQStDO0FBVS9DLFNBQWdCLFdBQVcsQ0FDekIsS0FBYSxFQUNiLGFBQXNCLEVBQ3RCLGFBQWtDO0lBR2xDLElBQU0sY0FBYyxHQUF3QixRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2xGLElBQU0sY0FBYyxHQUFxQixRQUFRLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDM0YsSUFBTSxNQUFNLEdBQXNCLGNBQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFzQixDQUFDO0lBQzlGLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBR25ELE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNwRCxNQUFNLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUdsRixNQUFNLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBc0IsQ0FB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LEVBQUUsVUFBQyxLQUFZO1FBQzNGLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV2QixJQUFJLFNBQVMsR0FBVyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFOUMsSUFBSSxLQUFLLEdBQVksUUFBUSxDQUFDLGFBQWEsQ0FBQyw2QkFBNkIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFFdEcsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNuQixLQUFLLEdBQUcsU0FBUyxDQUFDO1NBQ3JCO1FBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUU5QixjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsYUFBYSxDQUFDLCtCQUErQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBWTtRQUMzRixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdkIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsYUFBYSxDQUFDLDhCQUE4QixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBWTtRQUMxRixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdkIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdELFlBQVksRUFBRSxDQUFDO0FBRWYsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgKiBhcyBGb3JtSGFuZGxpbmcgZnJvbSBcIi4vZm9ybWhhbmRsaW5nXCI7XHJcblxyXG5cclxuaW50ZXJmYWNlIEJ1dHRvbkVsZW1lbnRJbmZvIHtcclxuICB0ZXh0OiBzdHJpbmc7XHJcbiAgdmFsdWU6IHN0cmluZztcclxuICB0aXRsZTogc3RyaW5nO1xyXG4gIGNsYXNzZXM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBEaWFsb2coXHJcbiAgdGl0bGU6IHN0cmluZyxcclxuICB1c2VTZWFyY2hGb3JtOiBib29sZWFuLFxyXG4gIHN1Ym1pdEJ1dHRvbnM6IEJ1dHRvbkVsZW1lbnRJbmZvW11cclxuKTogSFRNTERpYWxvZ0VsZW1lbnQge1xyXG4gIC8vIERpYWxvZyBlbGVtZW50IGNyZWF0aW9uXHJcbiAgY29uc3QgZGlhbG9nVGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJpZy5kaWFsb2dcIik7XHJcbiAgY29uc3QgZGlhbG9nRnJhZ21lbnQ6IERvY3VtZW50RnJhZ21lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKGRpYWxvZ1RlbXBsYXRlLCB0cnVlKS5jb250ZW50O1xyXG4gIGNvbnN0IGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQgPSBkaWFsb2dGcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiZGlhbG9nXCIpIGFzIEhUTUxEaWFsb2dFbGVtZW50O1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLmFwcGVuZENoaWxkKGRpYWxvZyk7XHJcblxyXG4gIC8vIENvbmZpZyBkaWFsb2dcclxuICBkaWFsb2cucXVlcnlTZWxlY3RvcihcImhlYWRlciBoMlwiKS5pbm5lckhUTUwgPSB0aXRsZTtcclxuICBkaWFsb2cucXVlcnlTZWxlY3RvcihcImZvcm0uc2VhcmNoLWJveFwiKS5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIsICF1c2VTZWFyY2hGb3JtKTtcclxuXHJcbiAgLy8gUmVzZXQgZGlhbG9nXHJcbiAgKGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiaW5wdXQucXVlcnlcIikgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUgPSBcIlwiO1xyXG4gIChkaWFsb2cucXVlcnlTZWxlY3RvcihcInNlY3Rpb24ucmVzdWx0cyB1bFwiKSBhcyBIVE1MRWxlbWVudCkuaW5uZXJIVE1MID0gXCJcIjtcclxuICAoZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXCJzZWN0aW9uLmJ1dHRvbnNcIikgYXMgSFRNTEVsZW1lbnQpLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gIChkaWFsb2cucXVlcnlTZWxlY3RvckFsbChcInNlY3Rpb24uYnV0dG9ucyBidXR0b25cIikgYXMgTm9kZUxpc3RPZjxIVE1MQnV0dG9uRWxlbWVudD4pLmZvckVhY2goYnV0dG9uID0+IHtcclxuICAgIGJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFN1Ym1pdCBidXR0b25zXHJcbiAgc2V0dXBTdWJtaXRCdXR0b25zKGRpYWxvZywgc3VibWl0QnV0dG9ucyk7XHJcblxyXG4gIC8vIFZhbGlkYXRpb24gZm9yIHNlYXJjaCBib3ggJiByZXN1bHRzXHJcbiAgRm9ybUhhbmRsaW5nLmFkZFZhbGlkYXRpb24oZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXCJmb3JtLnNlYXJjaC1ib3hcIikpO1xyXG4gIEZvcm1IYW5kbGluZy5hZGRWYWxpZGF0aW9uKGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiZm9ybS5zZWFyY2gtcmVzdWx0c1wiKSk7XHJcblxyXG4gIHJldHVybiBkaWFsb2c7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldHVwU3VibWl0QnV0dG9ucyhkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50LCBzdWJtaXRCdXR0b25zOiBCdXR0b25FbGVtZW50SW5mb1tdKSB7XHJcbiAgY29uc3Qgc3VibWl0QnV0dG9uVGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQgPSBkaWFsb2cucXVlcnlTZWxlY3RvcihcInRlbXBsYXRlLnN1Ym1pdC1idXR0b25cIik7XHJcbiAgY29uc3Qgc3VibWl0QnV0dG9uQ29udGFpbmVyOiBIVE1MRWxlbWVudCA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiLmJ1dHRvbnNcIik7XHJcblxyXG4gIHN1Ym1pdEJ1dHRvbnMuZm9yRWFjaChidXR0b25JbmZvID0+IHtcclxuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbkZyYWdtZW50OiBEb2N1bWVudEZyYWdtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShzdWJtaXRCdXR0b25UZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcclxuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbkVsZW1lbnQ6IEhUTUxCdXR0b25FbGVtZW50ID0gc3VibWl0QnV0dG9uRnJhZ21lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKTtcclxuXHJcbiAgICBzdWJtaXRCdXR0b25FbGVtZW50LnZhbHVlID0gYnV0dG9uSW5mby52YWx1ZTtcclxuICAgIHN1Ym1pdEJ1dHRvbkVsZW1lbnQudGl0bGUgPSBidXR0b25JbmZvLnRpdGxlO1xyXG4gICAgc3VibWl0QnV0dG9uRWxlbWVudC50ZXh0Q29udGVudCA9IGJ1dHRvbkluZm8udGV4dDtcclxuXHJcbiAgICBidXR0b25JbmZvLmNsYXNzZXMuZm9yRWFjaChidXR0b25DbGFzcyA9PiB7XHJcbiAgICAgIHN1Ym1pdEJ1dHRvbkVsZW1lbnQuY2xhc3NMaXN0LmFkZChidXR0b25DbGFzcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBzdWJtaXRCdXR0b25FbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcbiAgICBzdWJtaXRCdXR0b25Db250YWluZXIuYXBwZW5kQ2hpbGQoc3VibWl0QnV0dG9uRnJhZ21lbnQpO1xyXG4gIH0pO1xyXG59IiwiaW50ZXJmYWNlIERlY2lzaW9uRGlhbG9nIGV4dGVuZHMgSFRNTERpYWxvZ0VsZW1lbnQge1xyXG4gIGRhdGFTdHJpbmc/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5RGlhbG9nKFxyXG4gIHRpdGxlOiBzdHJpbmcsXHJcbiAgZGVzY3JpcHRpb246IHN0cmluZyxcclxuICBkYXRhU3RyaW5nOiBzdHJpbmcsXHJcbiAgY2FsbGJhY2s6IChkYXRhU3RyaW5nOiBzdHJpbmcpID0+IHZvaWRcclxuKSB7XHJcbiAgbGV0IGRpYWxvZzogRGVjaXNpb25EaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGlhbG9nLmRlY2lzaW9uXCIpO1xyXG5cclxuICBsZXQgZGlhbG9nVGl0bGU6IEhUTUxFbGVtZW50ID0gZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXCJoMlwiKTtcclxuICBsZXQgZGlhbG9nRGVzY3JpcHRpb246IEhUTUxFbGVtZW50ID0gZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXCJwXCIpO1xyXG5cclxuICBkaWFsb2cuZGF0YVN0cmluZyA9IGRhdGFTdHJpbmc7XHJcbiAgZGlhbG9nVGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZTtcclxuICBkaWFsb2dEZXNjcmlwdGlvbi50ZXh0Q29udGVudCA9IGRlc2NyaXB0aW9uO1xyXG5cclxuICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsIGZ1bmN0aW9uIChldmVudDogRXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgbGV0IGRpYWxvZzogRGVjaXNpb25EaWFsb2cgPSB0aGlzIGFzIERlY2lzaW9uRGlhbG9nO1xyXG5cclxuICAgIGlmICh0aGlzLnJldHVyblZhbHVlID09IFwieWVzXCIpIHtcclxuICAgICAgY2FsbGJhY2soZGlhbG9nLmRhdGFTdHJpbmcpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBkaWFsb2cuc2hvd01vZGFsKCk7XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gc2F2ZUZpbGUobmFtZTogc3RyaW5nLCBtaW1lOiBzdHJpbmcsIGRhdGE6IHN0cmluZykge1xyXG4gICAgaWYgKGRhdGEgIT0gbnVsbCAmJiBuYXZpZ2F0b3IubXNTYXZlQmxvYikgcmV0dXJuIG5hdmlnYXRvci5tc1NhdmVCbG9iKG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlOiBtaW1lIH0pLCBuYW1lKTtcclxuXHJcbiAgICBsZXQgbGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgIGxpbmtFbGVtZW50LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpub25lXCIpO1xyXG5cclxuICAgIGxldCB1cmwgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbZGF0YV0sIHsgdHlwZTogbWltZSB9KSk7XHJcblxyXG4gICAgbGlua0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCB1cmwpO1xyXG4gICAgbGlua0VsZW1lbnQuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgbmFtZSk7XHJcbiAgICAvL2RvY3VtZW50LmFwcGVuZENoaWxkKGxpbmtFbGVtZW50KTtcclxuICAgIGxpbmtFbGVtZW50LmNsaWNrKCk7XHJcbiAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgbGlua0VsZW1lbnQucmVtb3ZlKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2FkRmlsZShjYWxsYmFjazogKHRleHRDb250ZW50OiBzdHJpbmcpID0+IHZvaWQpIHtcclxuICAgIGxldCBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICBpbnB1dEVsZW1lbnQudHlwZSA9IFwiZmlsZVwiO1xyXG5cclxuICAgIGlucHV0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICBjb25zdCBldmVudFRhcmdldDogSFRNTElucHV0RWxlbWVudCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gZXZlbnRUYXJnZXQuZmlsZXNbMF07XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbGVSZWFkZXI6IEZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc1RleHQoZmlsZSwgXCJ1dGYtOFwiKTtcclxuXHJcbiAgICAgICAgZmlsZVJlYWRlci5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVSZWFkZXI6IEZpbGVSZWFkZXIgPSBldmVudC50YXJnZXQgYXMgRmlsZVJlYWRlcjtcclxuXHJcbiAgICAgICAgICAgIGlmICgoZmlsZVJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVaC1vaCwgc3BhZ2hldHRpLW8ncyEgVGhhdCBmaWxlIHNlZW1zIGVtcHR5LCBqdXN0IGxpa2UgbXkgc291bC5cIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGZpbGVSZWFkZXIucmVzdWx0IGFzIHN0cmluZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpbnB1dEVsZW1lbnQuY2xpY2soKTtcclxufSIsImV4cG9ydCBmdW5jdGlvbiBhZGRWYWxpZGF0aW9uKGZvcm06IEhUTUxGb3JtRWxlbWVudCkge1xyXG4gIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBmb3JtOiBIVE1MRm9ybUVsZW1lbnQgPSB0aGlzIGFzIEhUTUxGb3JtRWxlbWVudDtcclxuXHJcbiAgICBTZXRTdWJtaXRCdXR0b25FbmFibGVkKGZvcm0sIGZvcm0uY2hlY2tWYWxpZGl0eSgpKTtcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldFN1Ym1pdEJ1dHRvbkVuYWJsZWQoZm9ybTogSFRNTEZvcm1FbGVtZW50LCBzdGF0ZTogYm9vbGVhbikge1xyXG4gIChmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b25bdHlwZT1zdWJtaXRdXCIpIGFzIE5vZGVMaXN0T2Y8SFRNTEJ1dHRvbkVsZW1lbnQ+KS5mb3JFYWNoKGJ1dHRvbiA9PiB7XHJcbiAgICBidXR0b24uZGlzYWJsZWQgPSAhc3RhdGU7XHJcbiAgfSk7XHJcbn0iLCJpbXBvcnQgKiBhcyBCaWdEaWFsb2cgZnJvbSBcIi4vYmlnZGlhbG9nXCI7XHJcbmltcG9ydCAqIGFzIEZvcm1IYW5kbGluZyBmcm9tIFwiLi9mb3JtaGFuZGxpbmdcIjtcclxuXHJcblxyXG5pbnRlcmZhY2UgUmVnZXhwUmVwbGFjZW1lbnQge1xyXG4gICAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gICAgICByZWdleHA6IFJlZ0V4cDtcclxuICAgICAgcmVwbGFjZW1lbnQ6IHN0cmluZztcclxuICAgICAgZXhoYXVzdD86IGJvb2xlYW47XHJcbiAgfVxyXG5cclxuICBpbnRlcmZhY2UgTWVkaWF3aWtpUmVzdWx0IHtcclxuICAgICAgbnM6IG51bWJlcjtcclxuICAgICAgcGFnZWlkOiBudW1iZXI7XHJcbiAgICAgIHNpemU6IG51bWJlcjtcclxuICAgICAgc25pcHBldDogc3RyaW5nO1xyXG4gICAgICB0aW1lc3RhbXA6IHN0cmluZztcclxuICAgICAgdGl0bGU6IHN0cmluZztcclxuICAgICAgd29yZGNvdW50OiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICBpbnRlcmZhY2UgV2lraURpYWxvZyBleHRlbmRzIEhUTUxEaWFsb2dFbGVtZW50IHtcclxuICAgICAgd2lraVVybD86IHN0cmluZztcclxuICAgICAgcmVzdWx0Um93VGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XHJcbiAgICAgIHF1ZXJ5Pzogc3RyaW5nO1xyXG4gICAgICBjYWxsYmFjaz86ICh0ZXh0OiBzdHJpbmcsIHJlcGxhY2U6IGJvb2xlYW4pID0+IHZvaWQ7XHJcbiAgfVxyXG5cclxuICBpbnRlcmZhY2UgV2lraUZvcm0gZXh0ZW5kcyBIVE1MRm9ybUVsZW1lbnQge1xyXG4gICAgICB3aWtpRGlhbG9nPzogV2lraURpYWxvZztcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBSZWdleEdyb3VwIHtcclxuICAgICAgbWF0Y2hUZXh0OiBzdHJpbmc7XHJcbiAgICAgIGluZGV4U3RhcnQ6IG51bWJlcjtcclxuICAgICAgaW5kZXhFbmQ6IG51bWJlcjtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBJdGVtT3B0aW9uIHtcclxuICAgICAgdmFsdWU6IHN0cmluZztcclxuICAgICAgdGV4dDogc3RyaW5nO1xyXG4gICAgICBjaGVja2VkPzogYm9vbGVhbjtcclxuICB9XHJcblxyXG4gIGV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5RGlhbG9nKFxyXG4gICAgICBkZWZhdWx0U2VhcmNoOiBzdHJpbmcsXHJcbiAgICAgIHdpa2lVcmw6IHN0cmluZyxcclxuICAgICAgY2FsbGJhY2s6ICh0ZXh0OiBzdHJpbmcsIHJlcGxhY2U6IGJvb2xlYW4pID0+IHZvaWRcclxuICApIHtcclxuICAgICAgY29uc3QgZGlhbG9nOiBXaWtpRGlhbG9nID0gQmlnRGlhbG9nLnNldHVwRGlhbG9nKFwiRG93bmxvYWQgZnJvbSBXaWtpc291cmNlXCIsIHRydWUsIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB0aXRsZTogXCJEb3dubG9hZCBhbmQgYXBwZW5kIHRvIHRleHRcIixcclxuICAgICAgICAgICAgICB0ZXh0OiBcIkFwcGVuZFwiLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBcImFwcGVuZFwiLFxyXG4gICAgICAgICAgICAgIGNsYXNzZXM6IFtcImZhc1wiLCBcImZhLWZpbGUtbWVkaWNhbFwiXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB0aXRsZTogXCJEb3dubG9hZCBhbmQgcmVwbGFjZSBjdXJyZW50IHRleHRcIixcclxuICAgICAgICAgICAgICB0ZXh0OiBcIkRvd25sb2FkXCIsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IFwicmVwbGFjZVwiLFxyXG4gICAgICAgICAgICAgIGNsYXNzZXM6IFtcImZhc1wiLCBcImZhLWZpbGUtYWx0XCJdXHJcbiAgICAgICAgICB9XHJcbiAgICAgIF0pIGFzIFdpa2lEaWFsb2c7XHJcblxyXG4gICAgICAvLyBHZXQgcmVmZXJlbmNlc1xyXG4gICAgICBjb25zdCBzZWFyY2hGb3JtOiBXaWtpRm9ybSA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiZm9ybS5zZWFyY2gtYm94XCIpO1xyXG5cclxuICAgICAgLy8gU2F2ZSByZWZlcmVuY2VzIGZvciBsYXRlclxyXG4gICAgICBzZWFyY2hGb3JtLndpa2lEaWFsb2cgPSBkaWFsb2c7XHJcbiAgICAgIGRpYWxvZy53aWtpVXJsID0gd2lraVVybDtcclxuICAgICAgZGlhbG9nLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgIGRpYWxvZy5yZXN1bHRSb3dUZW1wbGF0ZSA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiLnJlc3VsdC1yb3dcIikgYXMgSFRNTFRlbXBsYXRlRWxlbWVudDtcclxuXHJcbiAgICAgIC8vIFNldHVwIGRlZmF1bHQgc2VhcmNoXHJcbiAgICAgIGNvbnN0IHNlYXJjaEJveDogSFRNTElucHV0RWxlbWVudCA9IHNlYXJjaEZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9dGV4dF1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgc2VhcmNoQm94LnZhbHVlID0gZGVmYXVsdFNlYXJjaDtcclxuICAgICAgc2VhcmNoRm9ybS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcclxuXHJcbiAgICAgIC8vIFNldHVwIHNlYXJjaCBhY3Rpb25cclxuICAgICAgc2VhcmNoRm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50OiBFdmVudCkge1xyXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICBsZXQgZGlhbG9nOiBXaWtpRGlhbG9nID0gKHRoaXMgYXMgV2lraUZvcm0pLndpa2lEaWFsb2c7XHJcblxyXG4gICAgICAgICAgbGV0IHF1ZXJ5OiBzdHJpbmcgPSAodGhpcy5xdWVyeVNlbGVjdG9yKFwiaW5wdXQucXVlcnlcIikgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU7XHJcblxyXG4gICAgICAgICAgZGlhbG9nLnF1ZXJ5ID0gcXVlcnk7XHJcblxyXG4gICAgICAgICAgc2VhcmNoTWVkaWFXaWtpKHF1ZXJ5LCBkaWFsb2cpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFNldHVwIGRpYWxvZyBjbG9zaW5nIGFjdGlvblxyXG4gICAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgbGV0IGRpYWxvZyA9IHRoaXMgYXMgV2lraURpYWxvZztcclxuXHJcbiAgICAgICAgICBpZiAoZGlhbG9nLnJldHVyblZhbHVlICE9IFwiY2FuY2VsXCIpIHtcclxuICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgIFwiLnJlc3VsdHMgaW5wdXRbdHlwZT1yYWRpb11bbmFtZT10aXRsZV06Y2hlY2tlZFwiXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gc2VsZWN0ZWRJdGVtLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgbGV0IHdpa2lVcmwgPSBkaWFsb2cud2lraVVybDtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmIChkaWFsb2cucmV0dXJuVmFsdWUgPT0gXCJyZXBsYWNlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGdldE1lZGlhV2lraVRleHQodGl0bGUsIHdpa2lVcmwsIHRydWUsIGRpYWxvZy5jYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlhbG9nLnJldHVyblZhbHVlID09IFwiYXBwZW5kXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGdldE1lZGlhV2lraVRleHQodGl0bGUsIHdpa2lVcmwsIGZhbHNlLCBkaWFsb2cuY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJXaGF0Y2hvIHRhbGtpbiBib3V0IFdpbGxpcz9cIik7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2VhcmNoTWVkaWFXaWtpKHF1ZXJ5OiBzdHJpbmcsIGRpYWxvZzogV2lraURpYWxvZykge1xyXG4gICAgICBjb25zdCBlbmRwb2ludCA9IGAke2RpYWxvZy53aWtpVXJsfS93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5Jmxpc3Q9c2VhcmNoJnByb3A9aW5mbyZpbnByb3A9dXJsJnV0Zjg9JmZvcm1hdD1qc29uJm9yaWdpbj0qJnNybGltaXQ9MTUmc3JzZWFyY2g9JHtxdWVyeX1gO1xyXG5cclxuICAgICAgZmV0Y2goZW5kcG9pbnQpXHJcbiAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXHJcbiAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBzZWFyY2hSZXN1bHRzOiBNZWRpYXdpa2lSZXN1bHRbXSA9IGRhdGEucXVlcnkuc2VhcmNoO1xyXG5cclxuICAgICAgICAgICAgICBsZXQgdGl0bGVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRzLmZvckVhY2gocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgICAgdGl0bGVzLnB1c2gocmVzdWx0LnRpdGxlKTtcclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgZGlzcGxheVNlYXJjaFJlc3VsdHModGl0bGVzLCBkaWFsb2cpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkaXNwbGF5U2VhcmNoUmVzdWx0cyh0aXRsZXM6IHN0cmluZ1tdLCBkaWFsb2c6IFdpa2lEaWFsb2cpIHtcclxuICAgICAgLy8gQ2FsbGJhY2sgZm9yIG1lZGlhd2lraSBzZWFyY2ggcmVzdWx0IHRpdGxlc1xyXG5cclxuICAgICAgY29uc3QgdGVtcGxhdGUgPSBkaWFsb2cucmVzdWx0Um93VGVtcGxhdGUuY29udGVudDtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXCIucmVzdWx0cyB1bFwiKTtcclxuXHJcbiAgICAgIGNvbnN0IHJlc3VsdHNGb3JtOiBIVE1MRm9ybUVsZW1lbnQgPSBkaWFsb2cucXVlcnlTZWxlY3RvcihcImZvcm0uc2VhcmNoLXJlc3VsdHNcIikgYXMgSFRNTEZvcm1FbGVtZW50O1xyXG5cclxuICAgICAgLy8gRW1wdHkgb2xkIHJlc3VsdHNcclxuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgICBpZiAodGl0bGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gYE5vIHJlc3VsdHMgZm91bmQgZm9yICR7ZGlhbG9nLnF1ZXJ5fS5gO1xyXG5cclxuICAgICAgICAgIEZvcm1IYW5kbGluZy5TZXRTdWJtaXRCdXR0b25FbmFibGVkKHJlc3VsdHNGb3JtLCBmYWxzZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aXRsZXMuZm9yRWFjaCh0aXRsZSA9PiB7XHJcbiAgICAgICAgICAgICAgbGV0IHJvdyA9IHRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MVGVtcGxhdGVFbGVtZW50O1xyXG5cclxuICAgICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcihcIi50ZXh0XCIpLmlubmVySFRNTCA9IHRpdGxlO1xyXG4gICAgICAgICAgICAgIChyb3cucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9dGl0bGVdXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlID0gdGl0bGU7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8gRGlzcGF0Y2ggaW5wdXQgZXZlbnQgdG8gZmlyZSB1cCB2YWxpZGF0aW9uXHJcbiAgICAgICAgICByZXN1bHRzRm9ybS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcclxuICAgICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gd2lraVRvWE1MKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgIGxldCByZXBsYWNlbWVudHM6IFJlZ2V4cFJlcGxhY2VtZW50W10gPSBbXHJcbiAgICAgICAgICAvLyNyZWdpb24gV2lraSBjbGVhbnVwXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUmVtb3ZlIG5vaW5jbHVkZVwiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogLzxub2luY2x1ZGU+KFtcXFNcXHNdKj8pPFxcL25vaW5jbHVkZT4vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIkMVwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSBkcm9wIGluaXRpYWxcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC97ezJ9ZHJvcCAqaW5pdGlhbFxcfCguKX17Mn0vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIkMVwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSBzbWFsbCBjYXBzXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAve3syfXNjXFx8KC4qPyl9ezJ9L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiJDFcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgZW5kIG5vdGVzXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPT1FbmRub3Rlcz09W1xcU1xcc10qJC9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIlwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSB0b29sdGlwc1wiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogL3t7Mn10b29sdGlwXFx8KC4qPylcXHwuKj9cXH17Mn0vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIkMVwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSByZWZlcmVuY2VzXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPHJlZj4uKj88XFwvcmVmPi9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIlwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSBpbmRlbnRhdGlvbnNcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC9cXG5bIFxcdF0rL2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiXFxuXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUmVtb3ZlIGxpbmtzXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvXFxbezJ9Lio/XFx8KC4qPylcXF17Mn0vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIkMVwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSByaWdodC1hbGlnbmluZ1wiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogL3t7Mn1yaWdodC4qP1xcfCguKj8pXFx9ezJ9L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiJDFcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgY2VudGVyaW5nXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAve3syfWMuKj9cXHwoLio/KX17Mn0vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIkMVwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSBibG9ja3NcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC97ezJ9YmxvY2suKj9cXHwoLio/KX17Mn0vZ3MsXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiJDFcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJGaXggYXR0cmlidXRlcyB3aXRob3V0IHF1b3Rlc1wiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogLzwoLio/KSAoLio/KT0oW15cIl0uKj8pKFsgPl0pLyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogJzwkMSAkMj1cIiQzXCIkNCcsXHJcbiAgICAgICAgICAgICAgZXhoYXVzdDogdHJ1ZVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgICAgICAgLy8jcmVnaW9uIEhlYWRpbmdzXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiSGVhZGluZ1wiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogL3t7Mn14eC1sYXJnZXJcXHwoLio/KX17Mn1cXG4qIC9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIjxoMT4kMTwvaDE+XFxuXFxuXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiQ2hhcHRlciB0aXRsZVwiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogLz09KC4qPyk9PVxcbiovZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCI8aDI+JDE8L2gyPlxcblxcblwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICAgICAgICAvLyNyZWdpb24gUG9lbXNcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJQb2VtIGxpbmVzIHdpdGggMiBpbmRlbnQgfCBFWEhBVVNUXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPHBvZW0+KFtcXFNcXHNdKj8pXFxuKD8hPGxpbmUpOjooLis/KVxcbihbXFxTXFxzXSo/KTxcXC9wb2VtPi9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIjxwb2VtPiQxXFxuPGxpbmUgaW5kZW50PTI+JDI8L2xpbmU+XFxuJDM8L3BvZW0+XCIsXHJcbiAgICAgICAgICAgICAgZXhoYXVzdDogdHJ1ZVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJQb2VtIGxpbmVzIHdpdGggMSBpbmRlbnQgfCBFWEhBVVNUXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPHBvZW0+KFtcXFNcXHNdKj8pXFxuKD8hPGxpbmUpOiguKz8pXFxuKFtcXFNcXHNdKj8pPFxcL3BvZW0+L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiPHBvZW0+JDFcXG48bGluZSBpbmRlbnQ9MT4kMjwvbGluZT5cXG4kMzwvcG9lbT5cIixcclxuICAgICAgICAgICAgICBleGhhdXN0OiB0cnVlXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlBvZW0gbGluZXMgd2l0aG91dCBpbmRlbnQgfCBFWEhBVVNUXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPHBvZW0+KFtcXFNcXHNdKj8pXFxuKD8hPGxpbmUpKC4rPylcXG4oW1xcU1xcc10qPyk8XFwvcG9lbT4vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCI8cG9lbT4kMVxcbjxsaW5lPiQyPC9saW5lPlxcbiQzPC9wb2VtPlwiLFxyXG4gICAgICAgICAgICAgIGV4aGF1c3Q6IHRydWVcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUG9lbSBsaW5lcyB1c2luZyBiciB0YWdcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC9cXG4oLiopPGJyXFwvPi9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIlxcbjxsaW5lPiQxPC9saW5lPlwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICAgICAgICAvLyNyZWdpb24gUGFyYWdyYXBoc1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBwYXJhZ3JhcGggPC9wPjxwPnRhZ3NcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC9cXG5cXG4vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCI8L3A+XFxuXFxuPHA+XCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUmVtb3ZlIGxhc3QgcGFyYWdyYXBoIHN0YXJ0IHRhZyAoYi9jIGxvZ2ljKVwiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogLyhbXFxTXFxzXSopPHA+L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiJDFcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgZmlyc3QgcGFyYWdyYXBoIGVuZCB0YWcgKGIvIGxvZ2ljKVwiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogLzxcXC9wPihbXFxTXFxzXSopL2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiJDFcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgbGluZSBicmVha3MgYWZ0ZXIgcGFyYWdyYXBoIHN0YXJ0XCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPHA+XFxuKy9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIjxwPlwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJldmVyc2UgcG9lbSBhbmQgcGFyYWdyYXBoIHN0YXJ0IHRhZ3NcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC88cD5cXG4qPHBvZW0+L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiPHBvZW0+XFxuPHA+XCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUmV2ZXJzZSBwb2VtIGFuZCBwYXJhZ3JhcGggZW5kIHRhZ3NcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC88XFwvcG9lbT5cXG4qPFxcL3A+L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiPC9wPlxcbjwvcG9lbT5cIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJTZXBhcmF0ZSBmaXJzdCBsaW5lIG9mIHBvZW0gcGFnYWdyYXBoIGZyb20gcGFyYWdyYXBoIHN0YXJ0IHRhZ1wiLFxyXG4gICAgICAgICAgICAgIHJlZ2V4cDogLzxwPjxsaW5lPi9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIjxwPlxcbjxsaW5lPlwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlNlcGFyYXRlIGxhc3QgbGluZSBvZiBwb2VtIHBhcmFncmFwaCBmcm9tIHBhcmFncmFwaCBlbmQgdGFnXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPFxcL2xpbmU+PFxcL3A+L2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwiPC9saW5lPlxcbjwvcD5cIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgcGFyYWdyYXBoIHRhZ3MgYXJvdW5kIGhlYWRpbmdzXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvPHA+PChoWzAtNV0pPiguKj8pPFxcL1xcMT48XFwvcD4vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCI8JDE+JDI8LyQxPlxcblxcblwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICAgICAgICAvLyNyZWdpb24gVGV4dCBmaXhlc1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIicnIHRvIGVtcGhcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC9cXCd7Mn0oLio/KVxcJ3syfS9nLFxyXG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBcIjxlbXBoPiQxPC9lbXBoPlwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSB0cmlwbGUgbmV3bGluZXNcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC9cXG5cXG5cXG4vZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCJcXG5cXG5cIixcclxuICAgICAgICAgICAgICBleGhhdXN0OiB0cnVlXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJlbW92ZSBkb3VibGUgc3BhY2VzXCIsXHJcbiAgICAgICAgICAgICAgcmVnZXhwOiAvICAvZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIgXCIsXHJcbiAgICAgICAgICAgICAgZXhoYXVzdDogdHJ1ZVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCImbmJzcDsgdG8gc3BhY2VcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC8mbmJzcDsvZyxcclxuICAgICAgICAgICAgICByZXBsYWNlbWVudDogXCIgXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiRWxsaXBzaXNcIixcclxuICAgICAgICAgICAgICByZWdleHA6IC9cXC4gP1xcLiA/XFwuL2csXHJcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQ6IFwi4oCmXCJcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgICBdO1xyXG5cclxuICAgICAgbGV0IGNvbnZlcnRlZFRleHQ6IHN0cmluZyA9IHRleHQ7XHJcblxyXG4gICAgICByZXBsYWNlbWVudHMuZm9yRWFjaChyZXBsYWNlbWVudCA9PiB7XHJcbiAgICAgICAgICBpZiAocmVwbGFjZW1lbnQuZXhoYXVzdCkge1xyXG4gICAgICAgICAgICAgIHdoaWxlIChjb252ZXJ0ZWRUZXh0LnNlYXJjaChyZXBsYWNlbWVudC5yZWdleHApID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgY29udmVydGVkVGV4dCA9IGNvbnZlcnRlZFRleHQucmVwbGFjZShyZXBsYWNlbWVudC5yZWdleHAsIHJlcGxhY2VtZW50LnJlcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNvbnZlcnRlZFRleHQgPSBjb252ZXJ0ZWRUZXh0LnJlcGxhY2UocmVwbGFjZW1lbnQucmVnZXhwLCByZXBsYWNlbWVudC5yZXBsYWNlbWVudCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIGNvbnZlcnRlZFRleHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRNZWRpYVdpa2lUZXh0KFxyXG4gICAgICBhcnRpY2xlOiBzdHJpbmcsXHJcbiAgICAgIHdpa2lVcmw6IHN0cmluZyxcclxuICAgICAgcmVwbGFjZTogYm9vbGVhbixcclxuICAgICAgcmVzdWx0SGFuZGxlcjogKHRleHQ6IHN0cmluZywgcmVwbGFjZTogYm9vbGVhbikgPT4gdm9pZFxyXG4gICkge1xyXG4gICAgICBjb25zdCBlbmRwb2ludCA9IGAke3dpa2lVcmx9L3cvYXBpLnBocD9hY3Rpb249cXVlcnkmcHJvcD1yZXZpc2lvbnMmcnZwcm9wPWNvbnRlbnQmZm9ybWF0PWpzb24mb3JpZ2luPSomcnZzbG90cz1tYWluJnRpdGxlcz0ke2FydGljbGV9YDtcclxuXHJcbiAgICAgIGZldGNoKGVuZHBvaW50KVxyXG4gICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxyXG4gICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcGFnZXMgPSBkYXRhLnF1ZXJ5LnBhZ2VzO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBwYWdlc1tPYmplY3Qua2V5cyhwYWdlcylbMF1dO1xyXG4gICAgICAgICAgICAgIGlmIChwYWdlLnJldmlzaW9ucykge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0OiBzdHJpbmcgPSBwYWdlLnJldmlzaW9uc1swXS5zbG90cy5tYWluW1wiKlwiXTtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVGV4dDogc3RyaW5nID0gd2lraVRvWE1MKHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICByZXN1bHRIYW5kbGVyKHdpa2lUb1hNTCh0ZXh0KSwgcmVwbGFjZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBUT0RPOiBBZGQgc29tZSBlcnJvciBoYW5kbGluZyBoZXJlLiBDYXRjaD9cclxuICB9IiwiaW1wb3J0ICogYXMgQmlnRGlhbG9nIGZyb20gXCIuL2JpZ2RpYWxvZ1wiO1xyXG5pbXBvcnQgKiBhcyBYTUxIYW5kbGluZyBmcm9tIFwiLi94bWxoYW5kbGluZ1wiO1xyXG5pbXBvcnQgKiBhcyBUZXh0QXJlYU1hbmFnZW1lbnQgZnJvbSBcIi4vdGV4dGFyZWFtYW5hZ2VtZW50XCI7XHJcblxyXG5cclxuXHJcbmludGVyZmFjZSBSZWdleEdyb3VwIHtcclxuICBtYXRjaFRleHQ6IHN0cmluZztcclxuICBpbmRleFN0YXJ0OiBudW1iZXI7XHJcbiAgaW5kZXhFbmQ6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEl0ZW1PcHRpb24ge1xyXG4gIHZhbHVlOiBzdHJpbmc7XHJcbiAgdGV4dDogc3RyaW5nO1xyXG4gIGNoZWNrZWQ/OiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2F0ZWdvcnlSZXN1bHQge1xyXG4gIGRhdGFQYWlyOiBYTUxIYW5kbGluZy5YbWxEYXRhUGFpcjtcclxuICBjb250ZW50OiBzdHJpbmdbXTtcclxufVxyXG5cclxuY29uc3QgaXRlbU9wdGlvbnM6IEl0ZW1PcHRpb25bXSA9IFtcclxuICB7XHJcbiAgICB0ZXh0OiBcIkNoYXJhY3RlclwiLFxyXG4gICAgdmFsdWU6IFwiY2hhcmFjdGVyXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiQ3JlYXR1cmVcIixcclxuICAgIHZhbHVlOiBcImNyZWF0dXJlXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiTG9jYXRpb25cIixcclxuICAgIHZhbHVlOiBcImxvY2F0aW9uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiQm9va1wiLFxyXG4gICAgdmFsdWU6IFwiYm9va1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIklnbm9yZVwiLFxyXG4gICAgdmFsdWU6IFwiaWdub3JlXCIsXHJcbiAgICBjaGVja2VkOiB0cnVlXHJcbiAgfVxyXG5dO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlEaWFsb2codGV4dDogc3RyaW5nKSB7XHJcbiAgY29uc3QgZGlhbG9nOiBIVE1MRGlhbG9nRWxlbWVudCA9IEJpZ0RpYWxvZy5zZXR1cERpYWxvZyhcIkRldGVjdGVkIG5hbWVzXCIsIGZhbHNlLCBbXHJcbiAgICB7XHJcbiAgICAgIHRpdGxlOiBcIkFwcGVuZCBuYW1lcyB0byBsaXN0c1wiLFxyXG4gICAgICB0ZXh0OiBcIkFwcGVuZFwiLFxyXG4gICAgICB2YWx1ZTogXCJhcHBlbmRcIixcclxuICAgICAgY2xhc3NlczogW1wiZmFzXCIsIFwiZmEtbGlzdFwiXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdGl0bGU6IFwiQ2FuY2VsXCIsXHJcbiAgICAgIHRleHQ6IFwiQ2FuY2VsXCIsXHJcbiAgICAgIHZhbHVlOiBcImNhbmNlbFwiLFxyXG4gICAgICBjbGFzc2VzOiBbXCJmYXNcIiwgXCJmYS1iYW5cIl1cclxuICAgIH1cclxuICBdKTtcclxuXHJcbiAgLy8gUmVnZXg6IE9uZSBvciBtb3JlIHdvcmRzIGVhY2ggYmVnaW5uaW5nIHdpdGggYSBjYXBpdGFsIGxldHRlciBhbmQgYm9va2VuZGVkIGJ5IGEgbm9uLWxldHRlci5cclxuICAvLyBBbmQgdGhlIGVudGlyZSBncm91cCBtYXkgYmUgcHJlY2VkZWQgYnkgYW4gZW1waCB0YWcgYnV0IE5PVCBwdW5jdHVhdGlvbiAoc28gY2FwaXRhbGl6ZWQgd29yZHMgYXQgdGhlIGJlZ2lubmluZyBvZiBzZW50ZW5jZXMgYXJlIGV4Y2x1ZGVkKVxyXG4gIGxldCBuYW1lUmVnZXg6IFJlZ0V4cCA9IC8oPzwhW1xcLjs6IT9dICopICg/OjxlbXBoPik/KCg/OltBLVpdW1xcd8Opw6HDoF0rID8pKyksPy9nO1xyXG5cclxuICBsZXQgcG9zc2libGVOYW1lcyA9IGZpbmRVbmlxdWVNYXRjaGVzKHRleHQsIG5hbWVSZWdleCk7XHJcblxyXG4gIGRpc3BsYXlNYXRjaGVzKHBvc3NpYmxlTmFtZXMsIHRleHQsIGRpYWxvZyk7XHJcblxyXG4gIC8vIFNldHVwIGRpYWxvZyBjbG9zaW5nIGFjdGlvblxyXG4gIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IGRpYWxvZyA9IHRoaXMgYXMgSFRNTERpYWxvZ0VsZW1lbnQ7XHJcblxyXG4gICAgaWYgKGRpYWxvZy5yZXR1cm5WYWx1ZSA9PSBcImFwcGVuZFwiKSB7XHJcblxyXG4gICAgICAvLyBDb25zdHJ1Y3QgXCJjYXRlZ29yaXplZFwiIG9iamVjdCBmcm9tIGRhdGEgcGFpcnNcclxuXHJcbiAgICAgIGxldCBjYXRlZ29yaXplZDogUmVjb3JkPHN0cmluZywgQ2F0ZWdvcnlSZXN1bHQ+ID0ge307XHJcblxyXG4gICAgICBsZXQgZGF0YVBhaXJzID0gWE1MSGFuZGxpbmcuZGF0YVBhaXJzLmZpbHRlcihwYWlyID0+IHBhaXIuY29udGFpbnNOYW1lcyA9PSB0cnVlKTtcclxuXHJcbiAgICAgIGRhdGFQYWlycy5mb3JFYWNoKHBhaXIgPT4ge1xyXG4gICAgICAgIGNhdGVnb3JpemVkW3BhaXIueG1sRWxlbWVudENoaWxkcmVuTmFtZV0gPSB7XHJcbiAgICAgICAgICBkYXRhUGFpcjogcGFpcixcclxuICAgICAgICAgIGNvbnRlbnQ6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBHYXRoZXIgYWxsIHRoZSBjYXRlZ29yaXplZCBuYW1lc1xyXG4gICAgICBsZXQgY2hlY2tlZEVsZW1lbnRzOiBOb2RlTGlzdE9mPEhUTUxJbnB1dEVsZW1lbnQ+ID0gZGlhbG9nLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgXCJpbnB1dFt0eXBlPXJhZGlvXTpjaGVja2VkOm5vdChbdmFsdWU9aWdub3JlXSlcIlxyXG4gICAgICApO1xyXG5cclxuICAgICAgY2hlY2tlZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgLy8gQ2hlY2sgdG8gbWFrZSBzdXJlIGVsZW1lbnQgdmFsdWUgKGNhdGVnb3J5IG5hbWUpIGV4aXN0cyBhcyBwcm9wZXJ0eSBvZiBjYXRlZ29yaXplZCBvYmplY3RcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoY2F0ZWdvcml6ZWQpLmluZGV4T2YoZWxlbWVudC52YWx1ZSkgPj0gMCkge1xyXG4gICAgICAgICAgbGV0IGNhdGVnb3J5OiBzdHJpbmdbXSA9IGNhdGVnb3JpemVkW2VsZW1lbnQudmFsdWVdLmNvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgY2F0ZWdvcnkucHVzaChlbGVtZW50Lm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBUT0RPOiBVc2UgZGVzY3JpcHRpb24gdGV4dCBmaWVsZCBmb3IgbmFtZSwgbm90IG1lcmVseSBlbGVtZW50J3MgbmFtZSAod2hpY2ggbWF5IGhhdmUgY2hhbmdlZClcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKGNhdGVnb3JpemVkKTtcclxuXHJcbiAgICAgIC8vIEdvIHRocm91Z2ggdGhlIGNhdGVnb3JpemVkIG5hbWVzIGFuZCBhcHBlbmQgdGhlbSB0byB0aGVpciByZXNwZWN0aXZlIHRleHRhcmVhc1xyXG5cclxuICAgICAgT2JqZWN0LmtleXMoY2F0ZWdvcml6ZWQpLmZvckVhY2goY2F0ZWdvcnlOYW1lID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGNhdGVnb3J5ID0gY2F0ZWdvcml6ZWRbY2F0ZWdvcnlOYW1lXTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRUZXh0Q29udGVudCA9IFRleHRBcmVhTWFuYWdlbWVudC5nZXRUZXh0YXJlYUNvbnRlbnRzKGNhdGVnb3J5LmRhdGFQYWlyLmRvY3VtZW50RWxlbWVudFNlbGVjdG9yKVxyXG5cclxuICAgICAgICBsZXQgbmV3VGV4dENvbnRlbnQgPSBjYXRlZ29yeS5jb250ZW50LmpvaW4oXCJcXG5cIik7XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50VGV4dENvbnRlbnQubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgIFRleHRBcmVhTWFuYWdlbWVudC5zZXRUZXh0YXJlYUNvbnRlbnRzKGNhdGVnb3J5LmRhdGFQYWlyLmRvY3VtZW50RWxlbWVudFNlbGVjdG9yLCBuZXdUZXh0Q29udGVudCwgZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBUZXh0QXJlYU1hbmFnZW1lbnQuc2V0VGV4dGFyZWFDb250ZW50cyhjYXRlZ29yeS5kYXRhUGFpci5kb2N1bWVudEVsZW1lbnRTZWxlY3RvciwgY3VycmVudFRleHRDb250ZW50ICsgXCJcXG5cIiArIG5ld1RleHRDb250ZW50LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuXHJcbiAgICB9XHJcbiAgICBkaWFsb2cucmVtb3ZlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRpYWxvZy5zaG93TW9kYWwoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlzcGxheU1hdGNoZXMobWF0Y2hlczogUmVnZXhHcm91cFtdLCB0ZXh0OiBzdHJpbmcsIGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQpIHtcclxuICBjb25zdCByZXN1bHRzQ29udGFpbmVyOiBIVE1MRWxlbWVudCA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiLnJlc3VsdHMgdWxcIik7XHJcblxyXG4gIHJlc3VsdHNDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgY29uc3QgdGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQgPSBkaWFsb2cucXVlcnlTZWxlY3RvcihcIi5jb21wbGV4LXJlc3VsdC1yb3dcIik7XHJcbiAgICBjb25zdCBvcHRpb25UZW1wbGF0ZTogSFRNTFRlbXBsYXRlRWxlbWVudCA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yKFwiLmNvbXBsZXgtcmVzdWx0LXJvdy5vcHRpb25cIik7XHJcblxyXG4gICAgbWF0Y2hlcy5mb3JFYWNoKG1hdGNoID0+IHtcclxuICAgICAgY29uc3Qgcm93RWxlbWVudDogRG9jdW1lbnRGcmFnbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcblxyXG4gICAgICBjb25zdCB0ZXh0RWxlbWVudDogSFRNTEVsZW1lbnQgPSByb3dFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZGVzY3JpcHRpb25cIik7XHJcbiAgICAgIGNvbnN0IGRldGFpbHNFbGVtZW50OiBIVE1MRWxlbWVudCA9IHJvd0VsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5kZXRhaWxzXCIpO1xyXG5cclxuICAgICAgdGV4dEVsZW1lbnQuaW5uZXJUZXh0ID0gbWF0Y2gubWF0Y2hUZXh0O1xyXG4gICAgICBkZXRhaWxzRWxlbWVudC5pbm5lckhUTUwgPSBtYWtlQWJzdHJhY3QobWF0Y2gsIHRleHQpO1xyXG5cclxuICAgICAgbWFrZU9wdGlvbkl0ZW1zKG1hdGNoLm1hdGNoVGV4dCwgaXRlbU9wdGlvbnMsIHJvd0VsZW1lbnQsIG9wdGlvblRlbXBsYXRlKTtcclxuXHJcbiAgICAgIHJlc3VsdHNDb250YWluZXIuYXBwZW5kQ2hpbGQocm93RWxlbWVudCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1ha2VPcHRpb25JdGVtcyhcclxuICBuYW1lOiBzdHJpbmcsXHJcbiAgaXRlbU9wdGlvbnM6IEl0ZW1PcHRpb25bXSxcclxuICByb3dFbGVtZW50OiBEb2N1bWVudEZyYWdtZW50LFxyXG4gIG9wdGlvblRlbXBsYXRlOiBIVE1MVGVtcGxhdGVFbGVtZW50XHJcbikge1xyXG4gIGNvbnN0IG9wdGlvbnNDb250YWluZXI6IEhUTUxFbGVtZW50ID0gcm93RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLml0ZW0tb3B0aW9uc1wiKTtcclxuXHJcbiAgb3B0aW9uc0NvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICBpdGVtT3B0aW9ucy5mb3JFYWNoKGl0ZW1PcHRpb24gPT4ge1xyXG4gICAgY29uc3Qgb3B0aW9uRWxlbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUob3B0aW9uVGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBpbnB1dEVsZW1lbnQgPSBvcHRpb25FbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKTtcclxuICAgIGNvbnN0IHNwYW5FbGVtZW50ID0gb3B0aW9uRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwic3BhblwiKTtcclxuXHJcbiAgICBpbnB1dEVsZW1lbnQudmFsdWUgPSBpdGVtT3B0aW9uLnZhbHVlO1xyXG4gICAgaW5wdXRFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5hbWVcIiwgbmFtZSk7XHJcbiAgICBpbnB1dEVsZW1lbnQuY2hlY2tlZCA9IGl0ZW1PcHRpb24uY2hlY2tlZDtcclxuICAgIHNwYW5FbGVtZW50LnRleHRDb250ZW50ID0gaXRlbU9wdGlvbi50ZXh0O1xyXG5cclxuICAgIG9wdGlvbnNDb250YWluZXIuYXBwZW5kQ2hpbGQob3B0aW9uRWxlbWVudCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1ha2VBYnN0cmFjdChtYXRjaEdyb3VwOiBSZWdleEdyb3VwLCB0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGxldCBhYnN0cmFjdFN0YXJ0OiBzdHJpbmcgPVxyXG4gICAgXCLigKZcIiArIHRleHQuc3Vic3RyaW5nKE1hdGgubWF4KG1hdGNoR3JvdXAuaW5kZXhTdGFydCAtIDI0LCAwKSwgbWF0Y2hHcm91cC5pbmRleFN0YXJ0KTtcclxuXHJcbiAgbGV0IGFic3RyYWN0TWFpbiA9IGAgPHN0cm9uZz4ke21hdGNoR3JvdXAubWF0Y2hUZXh0fTwvc3Ryb25nPiBgO1xyXG5cclxuICBsZXQgYWJzdHJhY3RFbmQ6IHN0cmluZyA9IHRleHQuc3Vic3RyaW5nKG1hdGNoR3JvdXAuaW5kZXhFbmQsIE1hdGgubWF4KG1hdGNoR3JvdXAuaW5kZXhFbmQgKyAyNCwgMCkpICsgXCLigKZcIjtcclxuXHJcbiAgYWJzdHJhY3RTdGFydCA9IGFic3RyYWN0U3RhcnQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIik7XHJcbiAgYWJzdHJhY3RFbmQgPSBhYnN0cmFjdEVuZC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKTtcclxuXHJcbiAgcmV0dXJuIGFic3RyYWN0U3RhcnQgKyBhYnN0cmFjdE1haW4gKyBhYnN0cmFjdEVuZDtcclxufVxyXG5cclxuZnVuY3Rpb24gZmluZFVuaXF1ZU1hdGNoZXModGV4dDogc3RyaW5nLCByZWdFeHA6IFJlZ0V4cCk6IFJlZ2V4R3JvdXBbXSB7XHJcbiAgbGV0IG1hdGNoZXM6IFJlZ2V4R3JvdXBbXSA9IFtdO1xyXG4gIGxldCBncm91cHM6IFJlZ0V4cEV4ZWNBcnJheTtcclxuXHJcbiAgbGV0IGZvdW5kTmFtZXM6IHN0cmluZ1tdID0gW107XHJcbiAgd2hpbGUgKChncm91cHMgPSByZWdFeHAuZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcclxuICAgIGxldCBtYXRjaDogc3RyaW5nID0gZ3JvdXBzWzFdLnRyaW0oKTtcclxuXHJcbiAgICBpZiAoZm91bmROYW1lcy5pbmRleE9mKG1hdGNoKSA8IDApIHtcclxuICAgICAgZm91bmROYW1lcy5wdXNoKG1hdGNoKTtcclxuICAgICAgbWF0Y2hlcy5wdXNoKHtcclxuICAgICAgICBtYXRjaFRleHQ6IGdyb3Vwc1sxXS50cmltKCksXHJcbiAgICAgICAgaW5kZXhTdGFydDogZ3JvdXBzLmluZGV4LFxyXG4gICAgICAgIGluZGV4RW5kOiByZWdFeHAubGFzdEluZGV4XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVnRXhwLmxhc3RJbmRleCA9IDA7XHJcblxyXG4gIHJldHVybiBtYXRjaGVzO1xyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdldFRleHRhcmVhQ29udGVudHMoc2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpLnRleHRDb250ZW50O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0VGV4dGFyZWFDb250ZW50cyhzZWxlY3Rvcjogc3RyaW5nLCBuZXdDb250ZW50OiBzdHJpbmcsIHdhcm5JZk5vdEZ1bGw6IGJvb2xlYW4pIHtcclxuICAgIGNvbnN0IHRleHRBcmVhOiBIVE1MVGV4dEFyZWFFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcblxyXG4gICAgdGV4dEFyZWEudGV4dENvbnRlbnQgPSBuZXdDb250ZW50O1xyXG59IiwiaW1wb3J0ICogYXMgRGVjaXNpb25EaWFsb2cgZnJvbSBcIi4vZGVjaXNpb25kaWFsb2dcIjtcclxuXHJcblxyXG5pbnRlcmZhY2UgWG1sVmFsaWRhdGFibGVFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gIHZhbHVlOiBzdHJpbmc7XHJcbiAgd2FybmluZ0VsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFhtbERhdGFQYWlyIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgY29udGFpbnNOYW1lcz86IGJvb2xlYW47XHJcbiAgeG1sRWxlbWVudFNlbGVjdG9yOiBzdHJpbmc7XHJcbiAgeG1sRWxlbWVudENoaWxkcmVuTmFtZT86IHN0cmluZztcclxuICB4bWxFbGVtZW50QXR0cmlidXRlcz86IEF0dHJpYnV0ZVBhaXJbXTtcclxuICBkb2N1bWVudEVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nO1xyXG4gIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlO1xyXG4gIGRvY3VtZW50RWxlbWVudFhtbFdhcm5pbmdTZWxlY3Rvcjogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQXR0cmlidXRlUGFpciB7XHJcbiAgdGV4dDogc3RyaW5nO1xyXG4gIHhtbDogWG1sQXR0cmlidXRlO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgWG1sQXR0cmlidXRlIHtcclxuICBhdHRyaWJ1dGU6IHN0cmluZztcclxuICB2YWx1ZTogc3RyaW5nO1xyXG59XHJcblxyXG5sZXQgZG9tUGFyc2VyOiBET01QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XHJcblxyXG5lbnVtIERvY05vZGVUeXBlIHtcclxuICBpbnB1dCxcclxuICB0ZXh0YXJlYVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGF0YVBhaXJzOiBYbWxEYXRhUGFpcltdID0gW1xyXG4gIHtcclxuICAgIG5hbWU6IFwiVGl0bGVcIixcclxuICAgIHhtbEVsZW1lbnRTZWxlY3RvcjogXCJ0aXRsZVwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50U2VsZWN0b3I6IFwiLm1ldGFkYXRhIGlucHV0W25hbWU9dGl0bGVdXCIsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRUeXBlOiBEb2NOb2RlVHlwZS5pbnB1dCxcclxuICAgIGRvY3VtZW50RWxlbWVudFhtbFdhcm5pbmdTZWxlY3RvcjogXCIubWV0YWRhdGEgbGFiZWwudGl0bGUgc3BhblwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIkF1dGhvclwiLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcImF1dGhvclwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50U2VsZWN0b3I6IFwiLm1ldGFkYXRhIGlucHV0W25hbWU9YXV0aG9yXVwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50VHlwZTogRG9jTm9kZVR5cGUuaW5wdXQsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRYbWxXYXJuaW5nU2VsZWN0b3I6IFwiLm1ldGFkYXRhIGxhYmVsLmF1dGhvciBzcGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiV3JpdHRlblwiLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcIndyaXR0ZW5cIixcclxuICAgIGRvY3VtZW50RWxlbWVudFNlbGVjdG9yOiBcIi5tZXRhZGF0YSBpbnB1dFtuYW1lPXdyaXR0ZW5dXCIsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRUeXBlOiBEb2NOb2RlVHlwZS5pbnB1dCxcclxuICAgIGRvY3VtZW50RWxlbWVudFhtbFdhcm5pbmdTZWxlY3RvcjogXCIubWV0YWRhdGEgbGFiZWwud3JpdHRlbiBzcGFuXCJcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUHVibGlzaGVkXCIsXHJcbiAgICB4bWxFbGVtZW50U2VsZWN0b3I6IFwicHVibGlzaGVkXCIsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRTZWxlY3RvcjogXCIubWV0YWRhdGEgaW5wdXRbbmFtZT1wdWJsaXNoZWRdXCIsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRUeXBlOiBEb2NOb2RlVHlwZS5pbnB1dCxcclxuICAgIGRvY3VtZW50RWxlbWVudFhtbFdhcm5pbmdTZWxlY3RvcjogXCIubWV0YWRhdGEgbGFiZWwucHVibGlzaGVkIHNwYW5cIlxyXG4gIH0sXHJcblxyXG4gIHtcclxuICAgIG5hbWU6IFwiU3VtbWFyeVwiLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcInN1bW1hcnlcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFNlbGVjdG9yOiBcIm1haW4gLnN1bW1hcnlcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlLnRleHRhcmVhLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50WG1sV2FybmluZ1NlbGVjdG9yOiBcIm1haW4gLnN1bW1hcnktaGVhZGluZ1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIkZ1bGwgdGV4dFwiLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcImJvZHlcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFNlbGVjdG9yOiBcIm1haW4gLnRleHRcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlLnRleHRhcmVhLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50WG1sV2FybmluZ1NlbGVjdG9yOiBcIm1haW4gLnRleHQtaGVhZGluZ1wiXHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgbmFtZTogXCJUYWdzXCIsXHJcbiAgICB4bWxFbGVtZW50U2VsZWN0b3I6IFwidGFnc1wiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50U2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24udGFncyB0ZXh0YXJlYVwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50VHlwZTogRG9jTm9kZVR5cGUudGV4dGFyZWEsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRYbWxXYXJuaW5nU2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24udGFncyBoMlwiLFxyXG4gICAgeG1sRWxlbWVudENoaWxkcmVuTmFtZTogXCJ0YWdcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogXCJDaGFyYWN0ZXJzXCIsXHJcbiAgICBjb250YWluc05hbWVzOiB0cnVlLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcImNoYXJhY3RlcnNcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFNlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLmNoYXJhY3RlcnMgdGV4dGFyZWFcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlLnRleHRhcmVhLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50WG1sV2FybmluZ1NlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLmNoYXJhY3RlcnMgaDJcIixcclxuICAgIHhtbEVsZW1lbnRDaGlsZHJlbk5hbWU6IFwiY2hhcmFjdGVyXCIsXHJcbiAgICB4bWxFbGVtZW50QXR0cmlidXRlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJtXCIsXHJcbiAgICAgICAgeG1sOiB7XHJcbiAgICAgICAgICBhdHRyaWJ1dGU6IFwiZ2VuZGVyXCIsXHJcbiAgICAgICAgICB2YWx1ZTogXCJtYWxlXCJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcImZcIixcclxuICAgICAgICB4bWw6IHtcclxuICAgICAgICAgIGF0dHJpYnV0ZTogXCJnZW5kZXJcIixcclxuICAgICAgICAgIHZhbHVlOiBcImZlbWFsZVwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJvXCIsXHJcbiAgICAgICAgeG1sOiB7XHJcbiAgICAgICAgICBhdHRyaWJ1dGU6IFwiZ2VuZGVyXCIsXHJcbiAgICAgICAgICB2YWx1ZTogXCJvdGhlclwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJ1XCIsXHJcbiAgICAgICAgeG1sOiB7XHJcbiAgICAgICAgICBhdHRyaWJ1dGU6IFwiZ2VuZGVyXCIsXHJcbiAgICAgICAgICB2YWx1ZTogXCJ1bmtub3duXCJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIjFcIixcclxuICAgICAgICB4bWw6IHtcclxuICAgICAgICAgIGF0dHJpYnV0ZTogXCJ0eXBlXCIsXHJcbiAgICAgICAgICB2YWx1ZTogXCJtYWluXCJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIjJcIixcclxuICAgICAgICB4bWw6IHtcclxuICAgICAgICAgIGF0dHJpYnV0ZTogXCJ0eXBlXCIsXHJcbiAgICAgICAgICB2YWx1ZTogXCJpbnRlcmFjdGVkXCJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIjNcIixcclxuICAgICAgICB4bWw6IHtcclxuICAgICAgICAgIGF0dHJpYnV0ZTogXCJ0eXBlXCIsXHJcbiAgICAgICAgICB2YWx1ZTogXCJtZW50aW9uZWRcIlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogXCJDcmVhdHVyZXNcIixcclxuICAgIGNvbnRhaW5zTmFtZXM6IHRydWUsXHJcbiAgICB4bWxFbGVtZW50U2VsZWN0b3I6IFwiY3JlYXR1cmVzXCIsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRTZWxlY3RvcjogXCIubWV0YWRhdGEgc2VjdGlvbi5jcmVhdHVyZXMgdGV4dGFyZWFcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlLnRleHRhcmVhLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50WG1sV2FybmluZ1NlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLmNyZWF0dXJlcyBoMlwiLFxyXG4gICAgeG1sRWxlbWVudENoaWxkcmVuTmFtZTogXCJjcmVhdHVyZVwiXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIkJvb2tzXCIsXHJcbiAgICBjb250YWluc05hbWVzOiB0cnVlLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcImJvb2tzXCIsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRTZWxlY3RvcjogXCIubWV0YWRhdGEgc2VjdGlvbi5ib29rcyB0ZXh0YXJlYVwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50VHlwZTogRG9jTm9kZVR5cGUudGV4dGFyZWEsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRYbWxXYXJuaW5nU2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24uYm9va3MgaDJcIixcclxuICAgIHhtbEVsZW1lbnRDaGlsZHJlbk5hbWU6IFwiYm9va1wiXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiBcIkxvY2F0aW9uc1wiLFxyXG4gICAgY29udGFpbnNOYW1lczogdHJ1ZSxcclxuICAgIHhtbEVsZW1lbnRTZWxlY3RvcjogXCJsb2NhdGlvbnNcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFNlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLmxvY2F0aW9ucyB0ZXh0YXJlYVwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50VHlwZTogRG9jTm9kZVR5cGUudGV4dGFyZWEsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRYbWxXYXJuaW5nU2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24ubG9jYXRpb25zIGgyXCIsXHJcbiAgICB4bWxFbGVtZW50Q2hpbGRyZW5OYW1lOiBcImxvY2F0aW9uXCJcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiUGhvYmlhc1wiLFxyXG4gICAgeG1sRWxlbWVudFNlbGVjdG9yOiBcInBob2JpYXNcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFNlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLnBob2JpYXMgdGV4dGFyZWFcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlLnRleHRhcmVhLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50WG1sV2FybmluZ1NlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLnBob2JpYXMgaDJcIixcclxuICAgIHhtbEVsZW1lbnRDaGlsZHJlbk5hbWU6IFwicGhvYmlhXCJcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6IFwiTm90ZXNcIixcclxuICAgIHhtbEVsZW1lbnRTZWxlY3RvcjogXCJub3Rlc1wiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50U2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24ubm90ZXMgdGV4dGFyZWFcIixcclxuICAgIGRvY3VtZW50RWxlbWVudFR5cGU6IERvY05vZGVUeXBlLnRleHRhcmVhLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50WG1sV2FybmluZ1NlbGVjdG9yOiBcIi5tZXRhZGF0YSBzZWN0aW9uLm5vdGVzIGgyXCIsXHJcbiAgICB4bWxFbGVtZW50Q2hpbGRyZW5OYW1lOiBcIm5vdGVcIlxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogXCJSZWxhdGVkIHJlYWRpbmdcIixcclxuICAgIHhtbEVsZW1lbnRTZWxlY3RvcjogXCJyZWxhdGVkcmVhZGluZ1wiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50U2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24ucmVsYXRlZC1saW5rcyB0ZXh0YXJlYVwiLFxyXG4gICAgZG9jdW1lbnRFbGVtZW50VHlwZTogRG9jTm9kZVR5cGUudGV4dGFyZWEsXHJcbiAgICBkb2N1bWVudEVsZW1lbnRYbWxXYXJuaW5nU2VsZWN0b3I6IFwiLm1ldGFkYXRhIHNlY3Rpb24ucmVsYXRlZC1saW5rcyBoMlwiLFxyXG4gICAgeG1sRWxlbWVudENoaWxkcmVuTmFtZTogXCJsaW5rXCJcclxuICB9XHJcbl07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBYTUxWYWxpZGF0aW9uKCk6IHZvaWQge1xyXG4gIGRhdGFQYWlycy5mb3JFYWNoKHBhaXIgPT4ge1xyXG4gICAgbGV0IGVsZW1lbnQ6IFhtbFZhbGlkYXRhYmxlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFpci5kb2N1bWVudEVsZW1lbnRTZWxlY3Rvcik7XHJcblxyXG4gICAgZWxlbWVudC53YXJuaW5nRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFpci5kb2N1bWVudEVsZW1lbnRYbWxXYXJuaW5nU2VsZWN0b3IpO1xyXG5cclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uIChldmVudDogRXZlbnQpIHtcclxuICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzIGFzIFhtbFZhbGlkYXRhYmxlRWxlbWVudDtcclxuXHJcbiAgICAgIGxldCB4bWxTdHJpbmc6IHN0cmluZyA9IGA8Ym9keT4ke2VsZW1lbnQudmFsdWV9PC9ib2R5PmA7XHJcblxyXG4gICAgICB2YXIgdGVzdERvbSA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoeG1sU3RyaW5nLCBcInRleHQveG1sXCIpO1xyXG5cclxuICAgICAgZWxlbWVudC53YXJuaW5nRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwieG1sd2FybmluZ1wiLCAhIXRlc3REb20ucXVlcnlTZWxlY3RvcihcInBhcnNlcmVycm9yXCIpKTtcclxuXHJcbiAgICAgIGxldCBleHBvcnRCdXR0b25FbGVtZW50OkhUTUxCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50b29sYmFyIGJ1dHRvbi5leHBvcnRcIik7XHJcblxyXG4gICAgICBleHBvcnRCdXR0b25FbGVtZW50LmRpc2FibGVkID0gISF0ZXN0RG9tLnF1ZXJ5U2VsZWN0b3IoXCJwYXJzZXJlcnJvclwiKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZVhNTCgpOiBzdHJpbmcge1xyXG4gIGxldCB4bWxUZW1wbGF0ZTogc3RyaW5nID0gYDw/eG1sIHZlcnNpb24gPSBcIjEuMFwiPz5cclxuICAgICAgPHdvcms+XHJcbiAgICAgICAgICA8dGl0bGUvPlxyXG4gICAgICAgICAgPGF1dGhvci8+XHJcbiAgICAgICAgICA8d3JpdHRlbi8+XHJcbiAgICAgICAgICA8cHVibGlzaGVkLz5cclxuICAgICAgICAgIDx0YWdzLz5cclxuICAgICAgICAgIDxib2R5Lz5cclxuICAgICAgICAgIDxzdW1tYXJ5Lz5cclxuICAgICAgICAgIDxjaGFyYWN0ZXJzLz5cclxuICAgICAgICAgIDxjcmVhdHVyZXMvPlxyXG4gICAgICAgICAgPGJvb2tzLz5cclxuICAgICAgICAgIDxsb2NhdGlvbnMvPlxyXG4gICAgICAgICAgPHBob2JpYXMvPlxyXG4gICAgICAgICAgPG5vdGVzLz5cclxuICAgICAgICAgIDxyZWxhdGVkcmVhZGluZy8+XHJcbiAgICAgIDwvd29yaz5cclxuICAgICAgYDtcclxuXHJcbiAgbGV0IHhtbERvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyh4bWxUZW1wbGF0ZSwgXCJ0ZXh0L3htbFwiKTtcclxuXHJcbiAgZGF0YVBhaXJzLmZvckVhY2gocGFpciA9PiB7XHJcbiAgICBsZXQgeG1sRWxlbWVudCA9IHhtbERvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFpci54bWxFbGVtZW50U2VsZWN0b3IpO1xyXG5cclxuICAgIGxldCB0ZXh0OiBzdHJpbmc7XHJcbiAgICBpZiAocGFpci5kb2N1bWVudEVsZW1lbnRUeXBlID09IERvY05vZGVUeXBlLmlucHV0KSB7XHJcbiAgICAgIGxldCBkb2N1bWVudEVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhaXIuZG9jdW1lbnRFbGVtZW50U2VsZWN0b3IpO1xyXG4gICAgICB0ZXh0ID0gZG9jdW1lbnRFbGVtZW50LnZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IGRvY3VtZW50RWxlbWVudDogSFRNTFRleHRBcmVhRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFpci5kb2N1bWVudEVsZW1lbnRTZWxlY3Rvcik7XHJcbiAgICAgIHRleHQgPSBkb2N1bWVudEVsZW1lbnQudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBhaXIueG1sRWxlbWVudENoaWxkcmVuTmFtZSkge1xyXG4gICAgICBsZXQgbGluZXM6IHN0cmluZ1tdID0gdGV4dC5zcGxpdCgvW1xcclxcbl0rLyk7XHJcblxyXG4gICAgICBsaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xyXG4gICAgICAgIGxpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgICBpZiAobGluZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBsZXQgeG1sQ2hpbGRFbGVtZW50ID0geG1sRG9jdW1lbnQuY3JlYXRlRWxlbWVudChwYWlyLnhtbEVsZW1lbnRDaGlsZHJlbk5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIElmIHRoZXJlIG1pZ2h0IGJlIGF0dHJpYnV0ZXMgdG8gYmUgaGFkXHJcblxyXG4gICAgICAgICAgaWYgKHBhaXIueG1sRWxlbWVudEF0dHJpYnV0ZXMgJiYgbGluZS5pbmRleE9mKFwifFwiKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgbGV0IHBhcnRzOiBzdHJpbmdbXSA9IGxpbmUuc3BsaXQoXCJ8XCIsIDIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGF0dHJpYnV0ZXM6IHN0cmluZyA9IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBwYWlyLnhtbEVsZW1lbnRBdHRyaWJ1dGVzLmZvckVhY2goYXR0cmlidXRlUGFpciA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gQXR0cmlidXRlIGZvdW5kXHJcblxyXG4gICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLmluZGV4T2YoYXR0cmlidXRlUGFpci50ZXh0KSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHhtbENoaWxkRWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlUGFpci54bWwuYXR0cmlidXRlLCBhdHRyaWJ1dGVQYWlyLnhtbC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGluZSA9IHBhcnRzWzFdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgeG1sQ2hpbGRFbGVtZW50LnRleHRDb250ZW50ID0gbGluZTtcclxuXHJcbiAgICAgICAgICAgIHhtbEVsZW1lbnQuYXBwZW5kQ2hpbGQoeG1sQ2hpbGRFbGVtZW50KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeG1sRWxlbWVudC5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBsZXQgc2VyaWFsaXplcjogWE1MU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XHJcbiAgbGV0IHhtbFN0cmluZyA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoeG1sRG9jdW1lbnQpO1xyXG5cclxuICByZXR1cm4geG1sU3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTG9hZFhtbCh4bWxUZXh0OiBzdHJpbmcpOiB2b2lkIHtcclxuICBsZXQgWG1sRG9jdW1lbnQgPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbFRleHQsIFwidGV4dC94bWxcIik7XHJcblxyXG4gIGRhdGFQYWlycy5mb3JFYWNoKHBhaXIgPT4ge1xyXG4gICAgbGV0IHhtbEVsZW1lbnQgPSBYbWxEb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhaXIueG1sRWxlbWVudFNlbGVjdG9yKTtcclxuXHJcbiAgICBsZXQgZG9jdW1lbnRFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50IHwgSFRNTFRleHRBcmVhRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIHBhaXIuZG9jdW1lbnRFbGVtZW50U2VsZWN0b3JcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHBhaXIueG1sRWxlbWVudENoaWxkcmVuTmFtZSkge1xyXG4gICAgICBsZXQgeG1sQ2hpbGRFbGVtZW50czogTm9kZUxpc3RPZjxFbGVtZW50PiA9IHhtbEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChwYWlyLnhtbEVsZW1lbnRDaGlsZHJlbk5hbWUpO1xyXG5cclxuICAgICAgbGV0IHRleHRFbGVtZW50czogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgIHhtbENoaWxkRWxlbWVudHMuZm9yRWFjaChjaGlsZEVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGxldCBhdHRyaWJ1dGVQcmVhbWJsZTogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHBhaXIueG1sRWxlbWVudEF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgIHBhaXIueG1sRWxlbWVudEF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyaWJ1dGVQYWlyID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkRWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlUGFpci54bWwuYXR0cmlidXRlKSA9PSBhdHRyaWJ1dGVQYWlyLnhtbC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVByZWFtYmxlICs9IGF0dHJpYnV0ZVBhaXIudGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgYXR0cmlidXRlUHJlYW1ibGUgKz0gXCJ8XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0ZXh0RWxlbWVudHMucHVzaChhdHRyaWJ1dGVQcmVhbWJsZSArIGNoaWxkRWxlbWVudC5pbm5lckhUTUwpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGRvY3VtZW50RWxlbWVudC52YWx1ZSA9IHRleHRFbGVtZW50cy5qb2luKFwiXFxuXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnRFbGVtZW50LnZhbHVlID0geG1sRWxlbWVudC5pbm5lckhUTUw7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDbGVhcigpOiB2b2lkIHtcclxuICBEZWNpc2lvbkRpYWxvZy5kaXNwbGF5RGlhbG9nKFxyXG4gICAgXCJDZWFyIGFsbCBmaWVsZHNcIixcclxuICAgIFwiQXJlIHlvdSBzdXJlPyBUaGlzIHdpbGwgY2xlYXIgYWxsIGZpZWxkcyBhbmQgZ2l2ZSB5b3UgYSBjbGVhbiBzbGF0ZS5cIixcclxuICAgIFwieWVzXCIsXHJcbiAgICAoZGVjaXNpb246IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAoZGVjaXNpb24gPT0gXCJ5ZXNcIikge1xyXG4gICAgICAgIGRhdGFQYWlycy5mb3JFYWNoKGRhdGFQYWlyID0+IHtcclxuICAgICAgICAgIGxldCBlbGVtZW50czogTm9kZUxpc3RPZjxIVE1MSW5wdXRFbGVtZW50IHwgSFRNTFRleHRBcmVhRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPFxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IHwgSFRNTFRleHRBcmVhRWxlbWVudFxyXG4gICAgICAgICAgPihkYXRhUGFpci5kb2N1bWVudEVsZW1lbnRTZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICk7XHJcbn0iLCJcclxuaW1wb3J0ICogYXMgWE1MSGFuZGxpbmcgZnJvbSBcIi4vbW9kdWxlcy94bWxoYW5kbGluZ1wiO1xyXG5pbXBvcnQgKiBhcyBGaWxlTWFuYWdlbWVudCBmcm9tIFwiLi9tb2R1bGVzL2ZpbGVtYW5hZ2VtZW50XCI7XHJcblxyXG5pbXBvcnQgKiBhcyBEZWNpc2lvbkRpYWxvZyBmcm9tIFwiLi9tb2R1bGVzL2RlY2lzaW9uZGlhbG9nXCI7XHJcblxyXG5pbXBvcnQgKiBhcyBNZWRpYVdpa2lTZWFyY2ggZnJvbSBcIi4vbW9kdWxlcy9tZWRpYXdpa2lzZWFyY2hcIjtcclxuaW1wb3J0ICogYXMgTmFtZVNlYXJjaCBmcm9tIFwiLi9tb2R1bGVzL25hbWVzZWFyY2hcIjtcclxuXHJcbmZ1bmN0aW9uIFNldFRleHRCb2R5KHRleHQ6IHN0cmluZywgcmVwbGFjZTogYm9vbGVhbiA9IHRydWUpIHtcclxuXHJcbiAgICBsZXQgdGV4dEJvZHlFbGVtZW50OkhUTUxUZXh0QXJlYUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibWFpbiB0ZXh0YXJlYS50ZXh0XCIpO1xyXG5cclxuICAgIGlmIChyZXBsYWNlKSB7XHJcbiAgICAgICAgaWYgKHRleHRCb2R5RWxlbWVudC52YWx1ZS5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgICAgICBEZWNpc2lvbkRpYWxvZy5kaXNwbGF5RGlhbG9nKFxyXG4gICAgICAgICAgICAgICAgXCJSZXBsYWNlXCIsXHJcbiAgICAgICAgICAgICAgICBcIkFyZSB5b3Ugc3VyZT8gVGhpcyB3aWxsIG1lYW4gbG9zaW5nIHRoZSBjdXJyZW50IHRleHQgYm9keS5cIixcclxuICAgICAgICAgICAgICAgIHRleHQsXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbih0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0Qm9keUVsZW1lbnQudmFsdWUgPSB0ZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRleHRCb2R5RWxlbWVudC52YWx1ZSA9IHRleHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0ZXh0Qm9keUVsZW1lbnQudmFsdWUgKz0gXCJcXG5cXG5cIiArIHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGV4dEJvZHlFbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0dXBUb29sYmFyKCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInNlY3Rpb24udG9vbGJhciBidXR0b24ud2lraXNvdXJjZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRpdGxlOiBzdHJpbmcgPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZXRhZGF0YSBpbnB1dFtuYW1lPXRpdGxlXVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZTtcclxuXHJcbiAgICAgICAgTWVkaWFXaWtpU2VhcmNoLmRpc3BsYXlEaWFsb2codGl0bGUsIFwiaHR0cHM6Ly9lbi53aWtpc291cmNlLm9yZ1wiLCBTZXRUZXh0Qm9keSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic2VjdGlvbi50b29sYmFyIGJ1dHRvbi5maW5kLW5hbWVzXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBsZXQgdGV4dEJvZHlFbGVtZW50OkhUTUxUZXh0QXJlYUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibWFpbiB0ZXh0YXJlYS50ZXh0XCIpO1xyXG4gICAgICAgIE5hbWVTZWFyY2guZGlzcGxheURpYWxvZyh0ZXh0Qm9keUVsZW1lbnQudmFsdWUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInNlY3Rpb24udG9vbGJhciBidXR0b24uZXhwb3J0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgbGV0IHhtbFN0cmluZzogc3RyaW5nID0gWE1MSGFuZGxpbmcubWFrZVhNTCgpO1xyXG5cclxuICAgICAgICBsZXQgdGl0bGU6IHN0cmluZyA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1ldGFkYXRhIGlucHV0W25hbWU9dGl0bGVdXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodGl0bGUubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgdGl0bGUgPSBcIlVua25vd25cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmaWxlbmFtZSA9IHRpdGxlICsgXCIueG1sXCI7XHJcblxyXG4gICAgICAgIEZpbGVNYW5hZ2VtZW50LnNhdmVGaWxlKGZpbGVuYW1lLCBcInRleHQveG1sXCIsIHhtbFN0cmluZyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic2VjdGlvbi50b29sYmFyIGJ1dHRvbi5pbXBvcnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBGaWxlTWFuYWdlbWVudC5sb2FkRmlsZShYTUxIYW5kbGluZy5Mb2FkWG1sKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzZWN0aW9uLnRvb2xiYXIgYnV0dG9uLmNsZWFyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgWE1MSGFuZGxpbmcuQ2xlYXIoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuc2V0dXBUb29sYmFyKCk7XHJcblxyXG5YTUxIYW5kbGluZy5zZXR1cFhNTFZhbGlkYXRpb24oKTsiXX0=
