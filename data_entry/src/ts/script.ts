
import * as XMLHandling from "./modules/xmlhandling";
import * as FileManagement from "./modules/filemanagement";

import * as DecisionDialog from "./modules/decisiondialog";

import * as MediaWikiSearch from "./modules/mediawikisearch";
import * as NameSearch from "./modules/namesearch";

function SetTextBody(text: string, replace: boolean = true) {

    let textBodyElement:HTMLTextAreaElement = document.querySelector("main textarea.text");

    if (replace) {
        if (textBodyElement.value.length != 0) {
            DecisionDialog.displayDialog(
                "Replace",
                "Are you sure? This will mean losing the current text body.",
                text,
                function(text: string) {
                    textBodyElement.value = text;
                }
            );
        } else {
            textBodyElement.value = text;
        }
    } else {
        textBodyElement.value += "\n\n" + text;
    }

    textBodyElement.dispatchEvent(new Event("input", { bubbles: true }));
}

function setupToolbar() {
    document.querySelector("section.toolbar button.wikisource").addEventListener("click", (event: Event) => {
        event.preventDefault();

        const title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        MediaWikiSearch.displayDialog(title, "https://en.wikisource.org", SetTextBody);
    });

    document.querySelector("section.toolbar button.find-names").addEventListener("click", (event: Event) => {
        event.preventDefault();
        let textBodyElement:HTMLTextAreaElement = document.querySelector("main textarea.text");
        NameSearch.displayDialog(textBodyElement.value);
    });

    document.querySelector("section.toolbar button.export").addEventListener("click", (event: Event) => {
        event.preventDefault();

        let xmlString: string = XMLHandling.makeXML();

        let title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        if (title.length == 0) {
            title = "Unknown";
        }

        let filename = title + ".xml";

        FileManagement.saveFile(filename, "text/xml", xmlString);
    });

    document.querySelector("section.toolbar button.import").addEventListener("click", (event: Event) => {
        event.preventDefault();

        FileManagement.loadFile(XMLHandling.LoadXml);
    });

    document.querySelector("section.toolbar button.clear").addEventListener("click", (event: Event) => {
        event.preventDefault();

        XMLHandling.Clear();
    });
}


setupToolbar();

XMLHandling.setupXMLValidation();