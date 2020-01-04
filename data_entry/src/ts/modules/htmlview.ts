import * as NameSearch from "./namesearch";
import * as Interfaces from "./interfaces";
import * as MetaData from "./metadata";
import * as Xml from "./xml";
import * as Dom from "./dom";

let mouseDown: boolean = false;

let localConfig: Interfaces.DataBlob[];

export function setup(config:Interfaces.DataBlob[]) {

  localConfig = config;

  document.querySelectorAll("input#html, input#code").forEach(item => {

    item.addEventListener("change", (event: Event) => {

      let id: string = (event.target as HTMLInputElement).id;

      //let xsltProcessor = new XSLTProcessor();
      let domParser = new DOMParser();

      let codeElement: HTMLTextAreaElement = document.querySelector("textarea.textcode");
      let richTextElement: HTMLDivElement = document.querySelector("div.htmltext");

      if (id == "html") {
        // One way... (to HTML)

        let originalContentString: string = `<body>${codeElement.value}</body>`;
        let originalContentDom: Document = domParser.parseFromString(originalContentString, "text/xml");

        let newDom = Xml.transformXml(originalContentDom, Xml.xslCodeToHTML);

        let textWithMarkedNames = markNames(newDom.querySelector("div.body").innerHTML);

        richTextElement.innerHTML = textWithMarkedNames;

      } else if (id == "code") {
        // Or the other... (to code)

        let originalContentString: string = `<work>${richTextElement.innerHTML}</work>`;
        let originalContentDom: Document = domParser.parseFromString(originalContentString, "text/xml");

        let newDom = Xml.transformXml(originalContentDom, Xml.xslHTMLToCode);

        newDom = Xml.transformXml(newDom, Xml.xslPrettyXML);

        let resultString: string = Xml.unwrapXml(newDom);

        

        codeElement.value = resultString;
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

    let genderButtons:NodeListOf<HTMLButtonElement> = selectionToolbar.querySelectorAll(".gendering button");

    genderButtons.forEach(button => {
      button.addEventListener("click", (event: Event) => {
        let gender:string = (event.target as HTMLButtonElement).value;
        genderSelection(gender);
      })
    });

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

    MetaData.addToListelement(dataBlob, [range.toString().trim()]);
  }
}

function genderSelection(gender: string) {

  let selection:Selection = document.getSelection();
  let range:Range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  if (range == null) return;

  let startElement = (range.startContainer.parentNode as HTMLElement);


  // If we are inside a gendered mark, just remove it
  if (startElement.tagName == "MARK" && startElement.classList.contains("gendered")) {

    Dom.unwrapElement(startElement);

    return;
  }

  // If a gendered mark is found anywhere inside the range, remove it
  document.querySelectorAll("div.htmltext mark.gendered").forEach(mark => {

    if (range.intersectsNode(mark)) {
      Dom.unwrapElement(mark as HTMLElement)
    }

  })

  // Create and wrap gendered mark
  let genderMark = document.createElement("mark");
  genderMark.className = `gendered ${gender}`;

  try {
    range.surroundContents(genderMark);
  }
  catch {
    console.log("Can't add mark there.")
  }
}