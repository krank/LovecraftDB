import * as DecisionDialog from "./decisiondialog";
import * as Interfaces from "./interfaces";
import * as Dom from "./dom";
import * as CodeView from "./codeview";

export let xslCodeToHTML: Document;
export let xslPrettyXML: Document;
export let xslHTMLToCode: Document;

interface XmlValidatableElement extends HTMLElement {
  value: string;
  warningElement: HTMLElement;
}

export function setup(config: Interfaces.DataBlob[]): void {
  loadXsltStylesheets();

  let domParser: DOMParser = new DOMParser();
  config.forEach(dataBlob => {

    let domElements: Dom.BlobDomElements = Dom.getHtmlElementOf(dataBlob, true);

    let element: XmlValidatableElement = domElements.element as XmlValidatableElement;

    element.warningElement = domElements.warningElement;

    element.addEventListener("input", function (event: Event) {
      let element = this as XmlValidatableElement;

      let xmlString: string = `<body>${element.value}</body>`;

      var testDom = domParser.parseFromString(xmlString, "text/xml");

      element.warningElement.classList.toggle("xmlwarning", !!testDom.querySelector("parsererror"));

      let exportButtonElement: HTMLButtonElement = document.querySelector(".toolbar button[value='export']");

      exportButtonElement.disabled = !!testDom.querySelector("parsererror");
    });
  });
}

function loadXsltStylesheets() {

  fetch("dist/xsl/codetohtml.xsl")
    .then(response => response.text())
    .then(response => {
      xslCodeToHTML = new DOMParser().parseFromString(response, "text/xml");
    });

  fetch("dist/xsl/prettyxml.xsl")
    .then(response => response.text())
    .then(response => {
      xslPrettyXML = new DOMParser().parseFromString(response, "text/xml");
    });

  fetch("dist/xsl/htmltocode.xsl")
    .then(response => response.text())
    .then(response => {
      xslHTMLToCode = new DOMParser().parseFromString(response, "text/xml");
    });

}

export function makeXML(config: Interfaces.DataBlob[]): string {

  let xmlDocument = document.implementation.createDocument("", "", null);
  let xmlRoot = xmlDocument.createElement("work");
  xmlDocument.appendChild(xmlRoot);


  config.forEach(dataBlob => {

    let xmlElement = xmlDocument.createElement(dataBlob.xmlElementName);

    let domElements: Dom.BlobDomElements = Dom.getHtmlElementOf(dataBlob, false);

    let documentElement: HTMLInputElement | HTMLTextAreaElement = domElements.element as HTMLInputElement | HTMLTextAreaElement;

    let text: string = documentElement.value;

    if (dataBlob.xmlElementChildrenName) {
      let lines: string[] = text.split(/[\r\n]+/);

      lines.forEach(line => {
        line = line.trim();
        if (line.length > 0) {
          let xmlChildElement = xmlDocument.createElement(dataBlob.xmlElementChildrenName);

          // If there might be attributes to be had

          if (dataBlob.attributePairs && line.indexOf("|") !== -1) {
            let parts: string[] = line.split("|", 2);

            let attributes: string = parts[0].toLowerCase();

            dataBlob.attributePairs.forEach(attributePair => {
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

    xmlRoot.appendChild(xmlElement);

  });

  // Prettify using XSL
  xmlDocument = transformXml(xmlDocument, xslPrettyXML);

  // Serialize
  let serializer: XMLSerializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(xmlDocument);

  return xmlString;
}

export function loadXml(xmlText: string, config: Interfaces.DataBlob[]): void {
  let domParser: DOMParser = new DOMParser();

  let xmlDocument = domParser.parseFromString(xmlText, "text/xml");

  config.forEach(dataBlob => {
    let xmlElement = xmlDocument.querySelector(dataBlob.xmlElementName);

    if (xmlElement) {
      let domElements: Dom.BlobDomElements = Dom.getHtmlElementOf(dataBlob, false);
      let documentElement: HTMLInputElement | HTMLTextAreaElement = domElements.element as HTMLInputElement | HTMLTextAreaElement;

      if (dataBlob.type == Interfaces.BlobType.list) {
        let xmlChildElements: NodeListOf<Element> = xmlElement.querySelectorAll(dataBlob.xmlElementChildrenName);

        let textElements: string[] = [];

        xmlChildElements.forEach(childElement => {
          let attributePreamble: string = "";

          if (dataBlob.attributePairs) {
            dataBlob.attributePairs.forEach(attributePair => {
              if (childElement.getAttribute(attributePair.xml.attribute) == attributePair.xml.value) {
                attributePreamble += attributePair.text;
              }
            });

            attributePreamble += "|";
          }

          textElements.push(attributePreamble + childElement.innerHTML);
        });

        documentElement.value = textElements.join("\n");

      } else if ([Interfaces.BlobType.fulltext, Interfaces.BlobType.summary].indexOf(dataBlob.type) >= 0) {

        let xmlDocument = document.implementation.createDocument(null, "tmp", null);

        xmlDocument.replaceChild(xmlElement, xmlDocument.documentElement);

        xmlDocument = transformXml(xmlDocument, xslPrettyXML);

        if (dataBlob.type == Interfaces.BlobType.fulltext) {
          CodeView.SetTextBody(unwrapXml(xmlDocument), true, true);
        } else {
          documentElement.value = unwrapXml(xmlDocument);
        }

      } else {
        console.log(dataBlob.name);
        documentElement.value = xmlElement.innerHTML;
      }
    }
  });
}

export function unwrapXml(xmlDocument: Document): string {

  let result = xmlDocument.documentElement.innerHTML;

  let linespaceRegex: RegExp = /^  /gm;
  let newlineRegex: RegExp = /^\n|\n$/g;

  result = result.replace(linespaceRegex, "");
  result = result.replace(newlineRegex, "");

  return result;

}

export function clear(config: Interfaces.DataBlob[]): void {
  DecisionDialog.displayDialog(
    "Clear all fields",
    "Are you sure? This will clear all fields and give you a clean slate.",
    "yes",
    (decision: string) => {
      if (decision == "yes") {
        config.forEach(dataBlob => {

          let domElement = Dom.getHtmlElementOf(dataBlob, false);

          (domElement.element as HTMLTextAreaElement | HTMLInputElement).value = "";

        });
      }
    }
  );
}

export function transformXml(originalDocument: Document, xslStylesheet: Document): Document {

  if (!xslStylesheet) {
    console.log("XSL stylesheet not loaded yet");
    return null;
  }

  let xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xslStylesheet);
  let result = xsltProcessor.transformToDocument(originalDocument);

  return result;
}