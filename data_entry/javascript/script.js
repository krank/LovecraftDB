var globals;
window.addEventListener("load", function () {
    setupGlobalElements();
    MediaWikiSearch.SetupDialog("dialog.wikisource", "template.result-row");
    XMlHandling.setupXMLValidation();
    setupToolbar();
});
function SetTextBody(text, replace) {
    if (replace === void 0) { replace = true; }
    if (replace) {
        if (globals.textBodyElement.value.length != 0) {
            DecisionDialog.displayDialog("Replace", "Are you sure? This will mean losing the current text body.", text, function (text) {
                globals.textBodyElement.value = text;
            });
        }
        else {
            globals.textBodyElement.value = text;
        }
    }
    else {
        globals.textBodyElement.value += "\n\n" + text;
    }
    globals.textBodyElement.dispatchEvent(new Event('input', { bubbles: true }));
}
function setupGlobalElements() {
    globals = {
        titleElement: document.querySelector(".metadata input[name=title]"),
        textBodyElement: document.querySelector("main textarea.text"),
        exportButtonElement: document.querySelector(".toolbar button.export")
    };
}
function setupToolbar() {
    document.querySelector("section.toolbar button.wikisource").addEventListener("click", function (event) {
        event.preventDefault();
        MediaWikiSearch.displayDialog("https://en.wikisource.org", "dialog.wikisource", SetTextBody);
    });
    document.querySelector("section.toolbar button.export").addEventListener("click", function (event) {
        event.preventDefault();
        var xmlString = XMlHandling.makeXML();
        var title = document.querySelector(".metadata input[name=title]").value;
        if (title.length == 0) {
            title = "Unknown";
        }
        var filename = title + ".xml";
        FileManagement.saveFile(filename, "text/xml", xmlString);
    });
    document.querySelector("section.toolbar button.import").addEventListener("click", function (event) {
        event.preventDefault();
        FileManagement.loadFile(XMlHandling.LoadXml);
    });
    document.querySelector("section.toolbar button.clear").addEventListener("click", function (event) {
        event.preventDefault();
        XMlHandling.Clear();
    });
}
var XMlHandling;
(function (XMlHandling) {
    var domParser = new DOMParser();
    var DocNodeType;
    (function (DocNodeType) {
        DocNodeType[DocNodeType["input"] = 0] = "input";
        DocNodeType[DocNodeType["textarea"] = 1] = "textarea";
    })(DocNodeType || (DocNodeType = {}));
    var dataPairs = [
        {
            xmlElementSelector: "title",
            documentElementSelector: ".metadata input[name=title]",
            documentElementType: DocNodeType.input,
            documentElementXmlWarningSelector: ".metadata label.title span"
        },
        {
            xmlElementSelector: "author",
            documentElementSelector: ".metadata input[name=author]",
            documentElementType: DocNodeType.input,
            documentElementXmlWarningSelector: ".metadata label.author span"
        },
        {
            xmlElementSelector: "written",
            documentElementSelector: ".metadata input[name=written]",
            documentElementType: DocNodeType.input,
            documentElementXmlWarningSelector: ".metadata label.written span"
        },
        {
            xmlElementSelector: "published",
            documentElementSelector: ".metadata input[name=published]",
            documentElementType: DocNodeType.input,
            documentElementXmlWarningSelector: ".metadata label.published span"
        },
        {
            xmlElementSelector: "summary",
            documentElementSelector: "main .summary",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: "main .summary-heading"
        },
        {
            xmlElementSelector: "body",
            documentElementSelector: "main .text",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: "main .text-heading"
        },
        {
            xmlElementSelector: "tags",
            documentElementSelector: ".metadata section.tags textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.tags h2",
            xmlElementChildrenName: "tag"
        },
        {
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
            xmlElementSelector: "creatures",
            documentElementSelector: ".metadata section.creatures textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.creatures h2",
            xmlElementChildrenName: "creature"
        },
        {
            xmlElementSelector: "books",
            documentElementSelector: ".metadata section.books textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.books h2",
            xmlElementChildrenName: "book"
        },
        {
            xmlElementSelector: "locations",
            documentElementSelector: ".metadata section.locations textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.locations h2",
            xmlElementChildrenName: "location"
        },
        {
            xmlElementSelector: "phobias",
            documentElementSelector: ".metadata section.phobias textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.phobias h2",
            xmlElementChildrenName: "phobia"
        },
        {
            xmlElementSelector: "notes",
            documentElementSelector: ".metadata section.notes textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.notes h2",
            xmlElementChildrenName: "note"
        },
        {
            xmlElementSelector: "relatedreading",
            documentElementSelector: ".metadata section.related-links textarea",
            documentElementType: DocNodeType.textarea,
            documentElementXmlWarningSelector: ".metadata section.related-links h2",
            xmlElementChildrenName: "link"
        }
    ];
    function setupXMLValidation() {
        dataPairs.forEach(function (pair) {
            var element = document.querySelector(pair.documentElementSelector);
            element.warningElement = document.querySelector(pair.documentElementXmlWarningSelector);
            element.addEventListener("input", function (event) {
                var element = this;
                var xmlString = "<body>" + element.value + "</body>";
                var testDom = domParser.parseFromString(xmlString, "text/xml");
                element.warningElement.classList.toggle("xmlwarning", !!testDom.querySelector("parsererror"));
                globals.exportButtonElement.disabled = !!testDom.querySelector("parsererror");
            });
        });
    }
    XMlHandling.setupXMLValidation = setupXMLValidation;
    function makeXML() {
        var xmlTemplate = "<?xml version = \"1.0\"?>\n        <work>\n            <title/>\n            <author/>\n            <written/>\n            <published/>\n            <tags/>\n            <body/>\n            <summary/>\n            <characters/>\n            <creatures/>\n            <books/>\n            <locations/>\n            <phobias/>\n            <notes/>\n            <relatedreading/>\n        </work>\n        ";
        var xmlDocument = domParser.parseFromString(xmlTemplate, "text/xml");
        dataPairs.forEach(function (pair) {
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
        console.log(xmlString);
        return xmlString;
    }
    XMlHandling.makeXML = makeXML;
    function LoadXml(xmlText) {
        var XmlDocument = domParser.parseFromString(xmlText, "text/xml");
        dataPairs.forEach(function (pair) {
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
    XMlHandling.LoadXml = LoadXml;
    function Clear() {
        DecisionDialog.displayDialog("Cear all fields", "Are you sure? This will clear all fields and give you a clean slate.", "yes", function (decision) {
            if (decision == "yes") {
                dataPairs.forEach(function (dataPair) {
                    var elements = document.querySelectorAll(dataPair.documentElementSelector);
                    elements.forEach(function (element) {
                        element.value = "";
                    });
                });
            }
        });
    }
    XMlHandling.Clear = Clear;
})(XMlHandling || (XMlHandling = {}));
var FileManagement;
(function (FileManagement) {
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
    FileManagement.saveFile = saveFile;
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
    FileManagement.loadFile = loadFile;
})(FileManagement || (FileManagement = {}));
var DecisionDialog;
(function (DecisionDialog) {
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
    DecisionDialog.displayDialog = displayDialog;
})(DecisionDialog || (DecisionDialog = {}));
var MediaWikiSearch;
(function (MediaWikiSearch) {
    function SetupDialog(dialogQuery, resultRowTemplateQuery) {
        var dialog = document.querySelector(dialogQuery);
        dialog.resultRowTemplate = dialog.querySelector(resultRowTemplateQuery);
        FormHandling.addValidation(dialog.querySelector("form.search-box"));
        FormHandling.addValidation(dialog.querySelector("form.search-results"));
        var searchForm = dialog.querySelector("form.search-box");
        searchForm.wikiDialog = dialog;
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var dialog = this.wikiDialog;
            var query = this.querySelector("input.query").value;
            dialog.query = query;
            searchMediaWiki(query, dialog);
        });
        document.querySelector("dialog.wikisource").addEventListener("close", function () {
            var dialog = this;
            if (dialog.returnValue != "cancel") {
                var selectedItem = this.querySelector(".results input[type=radio][name=title]:checked");
                if (selectedItem) {
                    var title = selectedItem.value;
                    var wikiUrl = this.wikiUrl;
                    if (this.returnValue == "replace") {
                        getMediaWikiText(title, wikiUrl, true, dialog.callback);
                    }
                    else if (this.returnValue == "append") {
                        getMediaWikiText(title, wikiUrl, false, dialog.callback);
                    }
                    else {
                        alert("Whatcho talkin bout Willis?");
                    }
                }
            }
        });
    }
    MediaWikiSearch.SetupDialog = SetupDialog;
    function displayDialog(wikiUrl, dialogQuery, callback) {
        var dialog = document.querySelector(dialogQuery);
        dialog.querySelector("input.query").value = "";
        dialog.querySelector("section.results").innerHTML = "";
        dialog.querySelectorAll("section.buttons button").forEach(function (button) {
            button.disabled = true;
        });
        dialog.wikiUrl = wikiUrl;
        dialog.callback = callback;
        dialog.showModal();
    }
    MediaWikiSearch.displayDialog = displayDialog;
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
        var container = dialog.querySelector(".results");
        var resultsForm = dialog.querySelector("form.search-results");
        container.innerHTML = "";
        if (titles.length == 0) {
            container.innerHTML = "No results found for " + dialog.query + ".";
            FormHandling.SetSubmitButtonEnabled(resultsForm, false);
        }
        else {
            titles.forEach(function (title) {
                var row = template.cloneNode(true);
                row.querySelector(".title").innerHTML = title;
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
})(MediaWikiSearch || (MediaWikiSearch = {}));
var FormHandling;
(function (FormHandling) {
    function addValidation(form) {
        form.addEventListener("input", function () {
            var form = this;
            SetSubmitButtonEnabled(form, form.checkValidity());
        });
    }
    FormHandling.addValidation = addValidation;
    function SetSubmitButtonEnabled(form, state) {
        form.querySelectorAll("button[type=submit]").forEach(function (button) {
            button.disabled = !state;
        });
    }
    FormHandling.SetSubmitButtonEnabled = SetSubmitButtonEnabled;
})(FormHandling || (FormHandling = {}));
