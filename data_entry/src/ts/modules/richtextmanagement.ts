import * as NameSearch from "./namesearch";
import * as Interfaces from "./interfaces";
import * as MetaDataManagement from "./metadatamanagement";
import * as XmlHandling from "./xmlhandling";

let mouseDown: boolean = false;

let localConfig: Interfaces.DataBlob[];

export function setupRichText(config:Interfaces.DataBlob[]) {

  localConfig = config;

  document.querySelectorAll("input#html, input#code").forEach(item => {

    item.addEventListener("change", (event: Event) => {

      let id: string = (event.target as HTMLInputElement).id;

      //let xsltProcessor = new XSLTProcessor();
      let domParser = new DOMParser();

      let codeElement: HTMLTextAreaElement = document.querySelector("textarea.textcode");
      let richTextElement: HTMLDivElement = document.querySelector("div.htmltext");

      if (id == "html") {
        // One way...

        let originalContentString: string = `<body>${codeElement.value}</body>`;
        let originalContentDom: Document = domParser.parseFromString(originalContentString, "text/xml");

        let newDom = XmlHandling.transformXml(originalContentDom, XmlHandling.xslCodeToHTML);

        let textWithMarkedNames = markNames(newDom.querySelector("div.body").innerHTML);

        richTextElement.innerHTML = textWithMarkedNames;

      } else if (id == "code") {
        // Or the other... (For future, when gendering has been added)

      }

    });

  });


  document.addEventListener("mousedown", () => {
    mouseDown = true;
  });

  document.addEventListener("mouseup", () => {
    mouseDown = false;
  });

  document.addEventListener("selectionchange", richTextSelectionHandler);

}

function markNames(originalText: string): string {

  let resultString: string = originalText.replace(NameSearch.nameRegex, ' <mark class="potential-name">$1</mark>');

  return resultString;
}

function richTextSelectionHandler(event: Event) {

  let htmlTextElement: HTMLDivElement = document.querySelector("div.htmltext");

  if (mouseDown) {
    htmlTextElement.removeEventListener("mouseup", displayRichTextSelectionToolbar);
    htmlTextElement.addEventListener("mouseup", displayRichTextSelectionToolbar);
  } else {
    displayRichTextSelectionToolbar();
  }

}

function displayRichTextSelectionToolbar() {
  let selection: Selection = document.getSelection();

  if (selection.rangeCount == 0 || selection.getRangeAt(0).collapsed) {
    removeRichTextSelectionToolbar();
    return;
  }

  let range: Range = selection.getRangeAt(0);

  let htmlTextElement: HTMLDivElement = document.querySelector("div.htmltext");

  if (htmlTextElement.contains(range.startContainer) && htmlTextElement.contains(range.endContainer)) {

    let selectionToolbar = getSelectionToolbar(true);

    let rangeBound:DOMRect = range.getBoundingClientRect();

    let xPosition:number = rangeBound.x;
    let yPosition:number = rangeBound.y + rangeBound.height;

    selectionToolbar.style.left = xPosition + "px";
    selectionToolbar.style.top = yPosition + "px";

    document.removeEventListener("click", removeRichTextSelectionToolbar);
    document.addEventListener("click", removeRichTextSelectionToolbar);

  }
}

function removeRichTextSelectionToolbar() {
  let selection: Selection = document.getSelection();

  if (selection.rangeCount == 0 || selection.getRangeAt(0).collapsed) {
    // Either no selections or first selection is zero-length

    let selectionToolbar = getSelectionToolbar(false);

    if (selectionToolbar) {
      selectionToolbar.remove();
    }
    document.removeEventListener("click", removeRichTextSelectionToolbar);
  }
}

function getSelectionToolbar(createIfNull:boolean): HTMLDivElement {
  let selectionToolbar:HTMLDivElement = document.querySelector("div.selection-toolbar");
  
  if (selectionToolbar == null && createIfNull) {
    let template: HTMLTemplateElement = document.querySelector("template.selection-toolbar");
    let clone = document.importNode(template.content, true);

    selectionToolbar = clone.querySelector("div.selection-toolbar");

    document.querySelector("div.html-panel").appendChild(clone);

    let listButtons:NodeListOf<HTMLButtonElement> = selectionToolbar.querySelectorAll(".name-categories button");

    listButtons.forEach(button => {
      button.addEventListener("click", (event: Event) => {
        let category:string = (event.target as HTMLButtonElement).value;
        addSelectionToList(category);
      });
    })

  }

  return selectionToolbar;
}

function addSelectionToList(category: string) {

  let selection:Selection = document.getSelection();
  let range:Range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  if (range == null) return;

  let dataBlobs = localConfig.filter(dataBlob => dataBlob.xmlElementChildrenName == category);

  if (dataBlobs.length > 0) {
    let dataBlob = dataBlobs[0];

    MetaDataManagement.addToListelement(dataBlob, [range.toString().trim()]);

  }

}