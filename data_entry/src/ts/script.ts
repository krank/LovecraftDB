
import * as Xml from "./modules/xml";
import * as FileManagement from "./modules/filemanagement";

import * as CodeView from "./modules/codeview";
import * as HtmlView from "./modules/htmlview";

import * as MetaData from "./modules/metadata";

import * as MediaWikiSearch from "./modules/mediawikisearch";
import * as NameSearch from "./modules/namesearch";

import * as Config from "./DataBlobConfig";

function setupToolbar() {
    document.querySelector("section.toolbar button.wikisource").addEventListener("click", (event: Event) => {
        event.preventDefault();

        const title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        MediaWikiSearch.displayDialog(title, "https://en.wikisource.org", CodeView.SetTextBody);
    });

    document.querySelector("section.toolbar button[value='find-names']").addEventListener("click", (event: Event) => {
        event.preventDefault();

        NameSearch.displayDialog(CodeView.GetTextBody(), Config.dataBlobs);
    });

    document.querySelector("section.toolbar button[value='export']").addEventListener("click", (event: Event) => {
        event.preventDefault();

        let xmlString: string = Xml.makeXML(Config.dataBlobs);

        let title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        if (title.length == 0) {
            title = "Unknown";
        }

        let filename = title + ".xml";

        FileManagement.saveFile(filename, "text/xml", xmlString);
    });

    document.querySelector("section.toolbar button[value='import']").addEventListener("click", (event: Event) => {
        event.preventDefault();

        FileManagement.loadFile(Xml.loadXml, Config.dataBlobs);
    });

    document.querySelector("section.toolbar button[value='clear']").addEventListener("click", (event: Event) => {
        event.preventDefault();

        Xml.clear(Config.dataBlobs);
    });
}

setupToolbar();

HtmlView.setup(Config.dataBlobs);
Xml.setup(Config.dataBlobs);
MetaData.setupLists(Config.dataBlobs);