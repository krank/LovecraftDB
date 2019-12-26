import * as NameSearch from "./namesearch";
import * as Interfaces from "./interfaces";
import * as DomManagement from "./dommanagement";
import * as TextAreaManagement from "./textareamanagement";
import { addToListelement } from "./textareamanagement";

let xslCodeToHTML = `<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="body">
      <div class="body"><xsl:apply-templates/></div>
    </xsl:template>

    <xsl:template match="emph">
      <em><xsl:apply-templates/></em>
    </xsl:template>

    <xsl:template match="quote">
        <blockquote>
            <xsl:apply-templates/>
            <footer>
                <xsl:value-of select="@by"/>
            </footer>
        </blockquote>
    </xsl:template>

    <xsl:template match="gendered">
        <mark class="gendered">
            <xsl:attribute name="class">gendered
                <xsl:value-of select="@gender"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </mark>
    </xsl:template>

    <xsl:template match="poem">
        <div class="poem">
            <xsl:for-each select="section">
                <section>
                    <xsl:for-each select="line">
                        <p>
                            <xsl:if test="@indent">
                                <xsl:attribute name="class">indent-<xsl:value-of select="@indent"/>
                                </xsl:attribute>
                            </xsl:if>
                            <xsl:apply-templates/>
                        </p>
                    </xsl:for-each>
                </section>
            </xsl:for-each>
        </div>
    </xsl:template>

    <xsl:template match="@*|node()">
      <xsl:copy>
        <xsl:apply-templates select="@*|node()"/>
      </xsl:copy>
    </xsl:template>

</xsl:stylesheet>`;

let mouseDown: boolean = false;

let localConfig: Interfaces.DataBlob[];

/*
Future improvement: separate xsl files…

 - Setting up everything (click handlers, xsl transform objects etc)
 - Function for converting back to XML

 - Name selection in html (Separate?)
 - Gendering in html
*/

export function setupRichText(config:Interfaces.DataBlob[]) {

  localConfig = config;

  document.querySelectorAll("input#html, input#code").forEach(item => {

    item.addEventListener("change", (event: Event) => {

      let id: string = (event.target as HTMLInputElement).id;

      let xsltProcessor = new XSLTProcessor();
      let domParser = new DOMParser();

      let codeElement: HTMLTextAreaElement = document.querySelector("textarea.textcode");
      let richTextElement: HTMLDivElement = document.querySelector("div.htmltext");

      if (id == "html") {
        // One way...

        let xslTransformStylesheet: Document = domParser.parseFromString(xslCodeToHTML, "text/xml");

        xsltProcessor.importStylesheet(xslTransformStylesheet);

        let originalContentString: string = `<body>${codeElement.value}</body>`;

        let originalContentDom: Document = domParser.parseFromString(originalContentString, "text/xml");

        let newDom = xsltProcessor.transformToDocument(originalContentDom);

        let textWithMarkedNames = markNames(newDom.querySelector("div.body").innerHTML);

        richTextElement.innerHTML = textWithMarkedNames;

      } else if (id == "code") {
        // Or the other...

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

    TextAreaManagement.addToListelement(dataBlob, [range.toString()])

  }

}