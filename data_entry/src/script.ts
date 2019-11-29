// TODO: Find names, categorize them    (?<!\. *) ((:?[A-Z]\w+ *)+)
// TODO: Warn if loading text & current fields contain data

// TODO: Text fields: Sort, remove duplicates, remove empty
// TODO: Full text preview using XSLT

// TODO: Programmatically construct metadata column contents
// TODO: Make XML error more specific (where is the error?)

// TODO: Prettyprint the XML: http://www.eslinstructor.net/vkbeautify/


let globals: Globals;

interface ElementDictionary {
    [key: string]: HTMLElement;
}

interface Globals {
    titleElement: HTMLInputElement;
    exportButtonElement: HTMLButtonElement;
    textBodyElement: HTMLTextAreaElement;
}

function SetTextBody(text: string, replace: boolean = true) {
    if (replace) {
        if (globals.textBodyElement.value.length != 0) {
            DecisionDialog.displayDialog(
                "Replace",
                "Are you sure? This will mean losing the current text body.",
                text,
                function(text: string) {
                    globals.textBodyElement.value = text;
                }
            );
        } else {
            globals.textBodyElement.value = text;
        }
    } else {
        globals.textBodyElement.value += "\n\n" + text;
    }

    globals.textBodyElement.dispatchEvent(new Event("input", { bubbles: true }));
}

function setupGlobalElements() {
    globals = {
        titleElement: document.querySelector(".metadata input[name=title]"),
        textBodyElement: document.querySelector("main textarea.text"),
        exportButtonElement: document.querySelector(".toolbar button.export")
    };
}

function setupToolbar() {
    document.querySelector("section.toolbar button.wikisource").addEventListener("click", (event: Event) => {
        event.preventDefault();

        const title:string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        MediaWikiSearch.displayDialog(title, "https://en.wikisource.org", SetTextBody);
    });

    document.querySelector("section.toolbar button.find-names").addEventListener("click", (event: Event) => {
        event.preventDefault();
        NameSearch.displayDialog(globals.textBodyElement.value);
    });

    document.querySelector("section.toolbar button.export").addEventListener("click", (event: Event) => {
        event.preventDefault();

        let xmlString: string = XMlHandling.makeXML();

        let title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        if (title.length == 0) {
            title = "Unknown";
        }

        let filename = title + ".xml";

        FileManagement.saveFile(filename, "text/xml", xmlString);
    });

    document.querySelector("section.toolbar button.import").addEventListener("click", (event: Event) => {
        event.preventDefault();

        FileManagement.loadFile(XMlHandling.LoadXml);
    });

    document.querySelector("section.toolbar button.clear").addEventListener("click", (event: Event) => {
        event.preventDefault();

        XMlHandling.Clear();
    });
}

function getTextareaContents(selector: string): string {
    return (document.querySelector(selector) as HTMLTextAreaElement).textContent;
}

function setTextareaContents(selector: string, newContent: string, warnIfNotFull: boolean) {

    const textArea:HTMLTextAreaElement = document.querySelector(selector);

    textArea.textContent = newContent;
}


namespace DecisionDialog {
    interface DecisionDialog extends HTMLDialogElement {
        dataString?: string;
    }

    export function displayDialog(
        title: string,
        description: string,
        dataString: string,
        callback: (dataString: string) => void
    ) {
        let dialog: DecisionDialog = document.querySelector("dialog.decision");

        let dialogTitle: HTMLElement = dialog.querySelector("h2");
        let dialogDescription: HTMLElement = dialog.querySelector("p");

        dialog.dataString = dataString;
        dialogTitle.textContent = title;
        dialogDescription.textContent = description;

        dialog.addEventListener("close", function(event: Event) {
            event.preventDefault();

            let dialog: DecisionDialog = this as DecisionDialog;

            if (this.returnValue == "yes") {
                callback(dialog.dataString);
            }
        });

        dialog.showModal();
    }
}

namespace BigDialog {
    interface ButtonElementInfo {
        text: string,
        value: string,
        title: string,
        classes: string[]
    }

    export function setupDialog(title: string, useSearchForm: boolean, submitButtons: ButtonElementInfo[] ): HTMLDialogElement {
        // Dialog element creation
        const dialogTemplate: HTMLTemplateElement = document.querySelector(".big.dialog");
        const dialogFragment: DocumentFragment = document.importNode(dialogTemplate, true).content;
        const dialog: HTMLDialogElement = dialogFragment.querySelector("dialog") as HTMLDialogElement;
        document.querySelector("body").appendChild(dialog);

        // Config dialog
        dialog.querySelector("header h2").innerHTML = title;
        dialog.querySelector("form.search-box").classList.toggle("hidden", !useSearchForm);

        // Reset dialog
        (dialog.querySelector("input.query") as HTMLInputElement).value = "";
        (dialog.querySelector("section.results ul") as HTMLElement).innerHTML = "";
        (dialog.querySelector("section.buttons") as HTMLElement).innerHTML = "";

        (dialog.querySelectorAll("section.buttons button") as NodeListOf<HTMLButtonElement>).forEach(button => {
            button.disabled = true;
        });

        // Submit buttons
        setupSubmitButtons(dialog, submitButtons);

        // Validation for search box & results
        FormHandling.addValidation(dialog.querySelector("form.search-box"));
        FormHandling.addValidation(dialog.querySelector("form.search-results"));

        return dialog;
    }

    function setupSubmitButtons(dialog: HTMLDialogElement, submitButtons: ButtonElementInfo[]) {
        const submitButtonTemplate:HTMLTemplateElement = dialog.querySelector("template.submit-button");
        const submitButtonContainer:HTMLElement = dialog.querySelector(".buttons");

        submitButtons.forEach(buttonInfo => {
            const submitButtonFragment:DocumentFragment = document.importNode(submitButtonTemplate.content, true);
            const submitButtonElement:HTMLButtonElement = submitButtonFragment.querySelector("button");

            submitButtonElement.value = buttonInfo.value;
            submitButtonElement.title = buttonInfo.title;
            submitButtonElement.textContent = buttonInfo.text;

            buttonInfo.classes.forEach(buttonClass => {
                submitButtonElement.classList.add(buttonClass);
            })

            submitButtonElement.disabled = true;

            submitButtonContainer.appendChild(submitButtonFragment);
        });
    }
}

namespace MediaWikiSearch {
    interface RegexpReplacement {
        description: string;
        regexp: RegExp;
        replacement: string;
        exhaust?: boolean;
    }

    interface MediawikiResult {
        ns: number;
        pageid: number;
        size: number;
        snippet: string;
        timestamp: string;
        title: string;
        wordcount: number;
    }

    interface WikiDialog extends HTMLDialogElement {
        wikiUrl?: string;
        resultRowTemplate: HTMLTemplateElement;
        query?: string;
        callback?: (text: string, replace: boolean) => void;
    }

    interface WikiForm extends HTMLFormElement {
        wikiDialog?: WikiDialog;
    }

    interface RegexGroup {
        matchText: string;
        indexStart: number;
        indexEnd: number;
    }

    interface ItemOption {
        value: string;
        text: string;
        checked?: boolean;
    }

    export function displayDialog(defaultSearch: string, wikiUrl: string, callback: (text: string, replace: boolean) => void) {

        const dialog: WikiDialog = BigDialog.setupDialog("Download from Wikisource", true,[
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
                classes: ["fas","fa-file-alt"]
            }
        ]) as WikiDialog;

        // Get references
        const searchForm: WikiForm = dialog.querySelector("form.search-box");

        // Save references for later
        searchForm.wikiDialog = dialog;
        dialog.wikiUrl = wikiUrl;
        dialog.callback = callback;
        dialog.resultRowTemplate = dialog.querySelector(".result-row") as HTMLTemplateElement;

        // Setup default search
        const searchBox:HTMLInputElement = searchForm.querySelector("input[type=text]") as HTMLInputElement;
        searchBox.value = defaultSearch;
        searchForm.dispatchEvent(new Event("input"));

        // Setup search action
        searchForm.addEventListener("submit", function(event: Event) {
            event.preventDefault();

            let dialog: WikiDialog = (this as WikiForm).wikiDialog;

            let query: string = (this.querySelector("input.query") as HTMLInputElement).value;

            dialog.query = query;

            searchMediaWiki(query, dialog);
        });

        // Setup dialog closing action
        dialog.addEventListener("close", function() {
            let dialog = this as WikiDialog;

            if (dialog.returnValue != "cancel") {
                let selectedItem: HTMLInputElement = dialog.querySelector(
                    ".results input[type=radio][name=title]:checked"
                );
                if (selectedItem) {
                    let title: string = selectedItem.value;

                    let wikiUrl = dialog.wikiUrl;

                    if (dialog.returnValue == "replace") {
                        getMediaWikiText(title, wikiUrl, true, dialog.callback);
                    } else if (dialog.returnValue == "append") {
                        getMediaWikiText(title, wikiUrl, false, dialog.callback);
                    } else {
                        alert("Whatcho talkin bout Willis?");
                    }
                }
            }
            dialog.remove();
        });

        dialog.showModal();
    }

    function searchMediaWiki(query: string, dialog: WikiDialog) {
        const endpoint = `${dialog.wikiUrl}/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=15&srsearch=${query}`;

        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const searchResults: MediawikiResult[] = data.query.search;

                let titles: string[] = [];

                searchResults.forEach(result => {
                    titles.push(result.title);
                });

                displaySearchResults(titles, dialog);
            });
    }

    function displaySearchResults(titles: string[], dialog: WikiDialog) {
        // Callback for mediawiki search result titles

        const template = dialog.resultRowTemplate.content;
        const container = dialog.querySelector(".results ul");

        const resultsForm: HTMLFormElement = dialog.querySelector("form.search-results") as HTMLFormElement;

        // Empty old results
        container.innerHTML = "";

        if (titles.length == 0) {
            container.innerHTML = `No results found for ${dialog.query}.`;

            FormHandling.SetSubmitButtonEnabled(resultsForm, false);
        } else {
            titles.forEach(title => {
                let row = template.cloneNode(true) as HTMLTemplateElement;

                row.querySelector(".text").innerHTML = title;
                (row.querySelector("input[name=title]") as HTMLInputElement).value = title;

                container.appendChild(row);
            });

            // Dispatch input event to fire up validation
            resultsForm.dispatchEvent(new Event("input"));
        }
    }

    function wikiToXML(text: string): string {
        let replacements: RegexpReplacement[] = [
            //#region Wiki cleanup
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
            //#endregion
            //#region Headings
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
            //#endregion
            //#region Poems
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
            //#endregion
            //#region Paragraphs
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
            //#endregion
            //#region Text fixes
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
            //#endregion
        ];

        let convertedText: string = text;

        replacements.forEach(replacement => {
            if (replacement.exhaust) {
                while (convertedText.search(replacement.regexp) >= 0) {
                    convertedText = convertedText.replace(replacement.regexp, replacement.replacement);
                }
            } else {
                convertedText = convertedText.replace(replacement.regexp, replacement.replacement);
            }
        });

        return convertedText;
    }

    function getMediaWikiText(
        article: string,
        wikiUrl: string,
        replace: boolean,
        resultHandler: (text: string, replace: boolean) => void
    ) {
        const endpoint = `${wikiUrl}/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&rvslots=main&titles=${article}`;

        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const pages = data.query.pages;
                const page = pages[Object.keys(pages)[0]];
                if (page.revisions) {
                    const text: string = page.revisions[0].slots.main["*"];
                    const convertedText: string = wikiToXML(text);
                    resultHandler(wikiToXML(text), replace);
                }
            });

        // TODO: Add some error handling here. Catch?
    }
}

namespace NameSearch {

    interface RegexGroup {
        matchText: string;
        indexStart: number;
        indexEnd: number;
    }

    interface ItemOption {
        value: string;
        text: string;
        checked?: boolean;
    }

    const itemOptions: ItemOption[] = [
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

    export function displayDialog(text: string) {

        const dialog:HTMLDialogElement = BigDialog.setupDialog("Detected names", false, [
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
                classes: ["fas","fa-ban"]
            }
        ])

        // Regex: One or more words each beginning with a capital letter and bookended by a non-letter.
        // And the entire group may be preceded by an emph tag but NOT punctuation (so capitalized words at the beginning of sentences are excluded)
        let nameRegex: RegExp = /(?<![\.;:!?] *) (?:<emph>)?((?:[A-Z][\wéáà]+ ?)+),?/g;

        let possibleNames = findUniqueMatches(text, nameRegex);

        displayMatches(possibleNames, text, dialog);

        // Setup dialog closing action
        dialog.addEventListener("close", function() {
            let dialog = this as HTMLDialogElement;

            if (dialog.returnValue == "append") {
                // TODO: Gather all names that have been categorized
            }
            dialog.remove();
        });

        dialog.showModal();
    }

    function displayMatches(matches: RegexGroup[], text: string, dialog: HTMLDialogElement) {
        const resultsContainer: HTMLElement = dialog.querySelector(".results ul");

        resultsContainer.innerHTML = "";

        if (matches.length > 0) {
            const template: HTMLTemplateElement = dialog.querySelector(".complex-result-row");
            const optionTemplate: HTMLTemplateElement = dialog.querySelector(".complex-result-row.option");

            matches.forEach(match => {
                const rowElement: DocumentFragment = document.importNode(template.content, true);

                const textElement: HTMLElement = rowElement.querySelector(".description");
                const detailsElement: HTMLElement = rowElement.querySelector(".details");

                textElement.innerText = match.matchText;
                detailsElement.innerHTML = makeAbstract(match, text);

                makeOptionItems(match.matchText, itemOptions, rowElement, optionTemplate);

                resultsContainer.appendChild(rowElement);
            });
        }
    }

    function makeOptionItems(
        name: string,
        itemOptions: ItemOption[],
        rowElement: DocumentFragment,
        optionTemplate: HTMLTemplateElement
    ) {
        const optionsContainer: HTMLElement = rowElement.querySelector(".item-options");

        optionsContainer.innerHTML = "";

        itemOptions.forEach(itemOption => {
            const optionElement = document.importNode(optionTemplate.content, true);
            const inputElement = optionElement.querySelector("input");
            const spanElement = optionElement.querySelector("span");

            inputElement.value = itemOption.value;
            inputElement.setAttribute("name", name);
            inputElement.checked = itemOption.checked;
            spanElement.textContent = itemOption.text;

            optionsContainer.appendChild(optionElement);
        });
    }

    function makeAbstract(matchGroup: RegexGroup, text: string): string {
        let abstractStart: string =
            "…" + text.substring(Math.max(matchGroup.indexStart - 24, 0), matchGroup.indexStart);

        let abstractMain = ` <strong>${matchGroup.matchText}</strong> `;

        let abstractEnd: string = text.substring(matchGroup.indexEnd, Math.max(matchGroup.indexEnd + 24, 0)) + "…";

        abstractStart = abstractStart.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        abstractEnd = abstractEnd.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        return abstractStart + abstractMain + abstractEnd;
    }

    function findUniqueMatches(text: string, regExp: RegExp): RegexGroup[] {
        let matches: RegexGroup[] = [];
        let groups: RegExpExecArray;

        let foundNames: string[] = [];
        while ((groups = regExp.exec(text)) !== null) {
            let match: string = groups[1].trim();

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
}

namespace FormHandling {
    export function addValidation(form: HTMLFormElement) {
        form.addEventListener("input", function() {
            let form: HTMLFormElement = this as HTMLFormElement;

            SetSubmitButtonEnabled(form, form.checkValidity());
        });
    }

    export function SetSubmitButtonEnabled(form: HTMLFormElement, state: boolean) {
        (form.querySelectorAll("button[type=submit]") as NodeListOf<HTMLButtonElement>).forEach(button => {
            button.disabled = !state;
        });
    }
}

namespace FileManagement {
    export function saveFile(name: string, mime: string, data: string) {
        if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: mime }), name);

        let linkElement = document.createElement("a");
        linkElement.setAttribute("style", "display:none");

        let url = window.URL.createObjectURL(new Blob([data], { type: mime }));

        linkElement.setAttribute("href", url);
        linkElement.setAttribute("download", name);
        //document.appendChild(linkElement);
        linkElement.click();
        window.URL.revokeObjectURL(url);
        linkElement.remove();
    }

    export function loadFile(callback: (textContent: string) => void) {
        let inputElement = document.createElement("input");
        inputElement.type = "file";

        inputElement.addEventListener("change", (event: Event) => {
            const eventTarget: HTMLInputElement = event.target as HTMLInputElement;

            const file: File = eventTarget.files[0];

            const fileReader: FileReader = new FileReader();

            fileReader.readAsText(file, "utf-8");

            fileReader.addEventListener("load", (event: Event) => {
                const fileReader: FileReader = event.target as FileReader;

                if ((fileReader.result as string).length == 0) {
                    console.log("Uh-oh, spaghetti-o's! That file seems empty, just like my soul.");
                }

                callback(fileReader.result as string);
            });
        });

        inputElement.click();
    }
}

namespace XMlHandling {
    interface XmlValidatableElement extends HTMLElement {
        value: string;
        warningElement: HTMLElement;
    }

    interface XmlDataPair {
        name: string;
        containsNames?: boolean;
        xmlElementSelector: string;
        xmlElementChildrenName?: string;
        xmlElementAttributes?: AttributePair[];
        documentElementSelector: string;
        documentElementType: DocNodeType;
        documentElementXmlWarningSelector: string;
    }

    interface AttributePair {
        text: string;
        xml: XmlAttribute;
    }

    interface XmlAttribute {
        attribute: string;
        value: string;
    }

    let domParser: DOMParser = new DOMParser();

    enum DocNodeType {
        input,
        textarea
    }

    export const dataPairs: XmlDataPair[] = [
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

    export function setupXMLValidation(): void {
        dataPairs.forEach(pair => {
            let element: XmlValidatableElement = document.querySelector(pair.documentElementSelector);

            element.warningElement = document.querySelector(pair.documentElementXmlWarningSelector);

            element.addEventListener("input", function(event: Event) {
                let element = this as XmlValidatableElement;

                let xmlString: string = `<body>${element.value}</body>`;

                var testDom = domParser.parseFromString(xmlString, "text/xml");

                element.warningElement.classList.toggle("xmlwarning", !!testDom.querySelector("parsererror"));

                globals.exportButtonElement.disabled = !!testDom.querySelector("parsererror");
            });
        });
    }

    export function makeXML(): string {
        let xmlTemplate: string = `<?xml version = "1.0"?>
        <work>
            <title/>
            <author/>
            <written/>
            <published/>
            <tags/>
            <body/>
            <summary/>
            <characters/>
            <creatures/>
            <books/>
            <locations/>
            <phobias/>
            <notes/>
            <relatedreading/>
        </work>
        `;

        let xmlDocument = domParser.parseFromString(xmlTemplate, "text/xml");

        dataPairs.forEach(pair => {
            let xmlElement = xmlDocument.querySelector(pair.xmlElementSelector);

            let text: string;
            if (pair.documentElementType == DocNodeType.input) {
                let documentElement: HTMLInputElement = document.querySelector(pair.documentElementSelector);
                text = documentElement.value;
            } else {
                let documentElement: HTMLTextAreaElement = document.querySelector(pair.documentElementSelector);
                text = documentElement.value;
            }

            if (pair.xmlElementChildrenName) {
                let lines: string[] = text.split(/[\r\n]+/);

                lines.forEach(line => {
                    line = line.trim();
                    if (line.length > 0) {
                        let xmlChildElement = xmlDocument.createElement(pair.xmlElementChildrenName);

                        // If there might be attributes to be had

                        if (pair.xmlElementAttributes && line.indexOf("|") !== -1) {
                            let parts: string[] = line.split("|", 2);

                            let attributes: string = parts[0].toLowerCase();

                            pair.xmlElementAttributes.forEach(attributePair => {
                                // Attribute found

                                if (attributes.indexOf(attributePair.text) !== -1) {
                                    xmlChildElement.setAttribute(attributePair.xml.attribute, attributePair.xml.value);
                                }
                            });
                            line = parts[1];
                        }

                        if (line.length > 0) {
                            xmlChildElement.textContent = line;

                            xmlElement.appendChild(xmlChildElement);
                        }
                    }
                });
            } else {
                xmlElement.innerHTML = text;
            }
        });

        let serializer: XMLSerializer = new XMLSerializer();
        let xmlString = serializer.serializeToString(xmlDocument);

        return xmlString;
    }

    export function LoadXml(xmlText: string): void {
        let XmlDocument = domParser.parseFromString(xmlText, "text/xml");

        dataPairs.forEach(pair => {
            let xmlElement = XmlDocument.querySelector(pair.xmlElementSelector);

            let documentElement: HTMLInputElement | HTMLTextAreaElement = document.querySelector(
                pair.documentElementSelector
            );

            if (pair.xmlElementChildrenName) {
                let xmlChildElements: NodeListOf<Element> = xmlElement.querySelectorAll(pair.xmlElementChildrenName);

                let textElements: string[] = [];

                xmlChildElements.forEach(childElement => {
                    let attributePreamble: string = "";

                    if (pair.xmlElementAttributes) {
                        pair.xmlElementAttributes.forEach(attributePair => {
                            if (childElement.getAttribute(attributePair.xml.attribute) == attributePair.xml.value) {
                                attributePreamble += attributePair.text;
                            }
                        });

                        attributePreamble += "|";
                    }

                    textElements.push(attributePreamble + childElement.innerHTML);
                });

                documentElement.value = textElements.join("\n");
            } else {
                documentElement.value = xmlElement.innerHTML;
            }
        });
    }

    export function Clear(): void {
        DecisionDialog.displayDialog(
            "Cear all fields",
            "Are you sure? This will clear all fields and give you a clean slate.",
            "yes",
            (decision: string) => {
                if (decision == "yes") {
                    dataPairs.forEach(dataPair => {
                        let elements: NodeListOf<HTMLInputElement | HTMLTextAreaElement> = document.querySelectorAll<
                            HTMLInputElement | HTMLTextAreaElement
                        >(dataPair.documentElementSelector);

                        elements.forEach(element => {
                            element.value = "";
                        });
                    });
                }
            }
        );
    }
}



/* PAGE ONLOAD */

setupGlobalElements();
setupToolbar();

XMlHandling.setupXMLValidation();