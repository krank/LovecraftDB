
import * as XMLHandling from "./modules/xmlhandling";
import * as FileManagement from "./modules/filemanagement";

import * as FullTextManagement from "./modules/fulltextmanagement";

import * as MediaWikiSearch from "./modules/mediawikisearch";
import * as NameSearch from "./modules/namesearch";

import * as Config from "./DataBlobConfig";

function setupToolbar() {
    document.querySelector("section.toolbar button.wikisource").addEventListener("click", (event: Event) => {
        event.preventDefault();

        const title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        MediaWikiSearch.displayDialog(title, "https://en.wikisource.org", FullTextManagement.SetTextBody);
    });

    document.querySelector("section.toolbar button.find-names").addEventListener("click", (event: Event) => {
        event.preventDefault();

        NameSearch.displayDialog(FullTextManagement.GetTextBody());
    });

    document.querySelector("section.toolbar button.export").addEventListener("click", (event: Event) => {
        event.preventDefault();

        let xmlString: string = XMLHandling.makeXML(Config.dataBlobs);

        let title: string = (document.querySelector(".metadata input[name=title]") as HTMLInputElement).value;

        if (title.length == 0) {
            title = "Unknown";
        }

        let filename = title + ".xml";

        FileManagement.saveFile(filename, "text/xml", xmlString);
    });

    document.querySelector("section.toolbar button.import").addEventListener("click", (event: Event) => {
        event.preventDefault();

        FileManagement.loadFile(XMLHandling.LoadXml, Config.dataBlobs);
    });

    document.querySelector("section.toolbar button.clear").addEventListener("click", (event: Event) => {
        event.preventDefault();

        XMLHandling.Clear(Config.dataBlobs);
    });
}

setupToolbar();

XMLHandling.setupXMLValidation(Config.dataBlobs);