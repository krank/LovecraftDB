import * as DecisionDialog from "./decisiondialog";
import * as Interfaces from "./interfaces";
import * as DomManagement from "./dommanagement";


interface XmlValidatableElement extends HTMLElement {
  value: string;
  warningElement: HTMLElement;
}

export function setupXMLValidation(config: Interfaces.DataBlob[]): void {
  let domParser: DOMParser = new DOMParser();
  config.forEach(dataBlob => {

    let domElements: DomManagement.BlobDomElements = DomManagement.getHtmlElementOf(dataBlob, true);

    let element: XmlValidatableElement = domElements.element as XmlValidatableElement;

    element.warningElement = domElements.warningElement;

    element.addEventListener("input", function (event: Event) {
      let element = this as XmlValidatableElement;

      let xmlString: string = `<body>${element.value}</body>`;

      var testDom = domParser.parseFromString(xmlString, "text/xml");

      element.warningElement.classList.toggle("xmlwarning", !!testDom.querySelector("parsererror"));

      let exportButtonElement: HTMLButtonElement = document.querySelector(".toolbar button.export");

      exportButtonElement.disabled = !!testDom.querySelector("parsererror");
    });
  });
}

export function makeXML(config: Interfaces.DataBlob[]): string {

  let xmlDocument = document.implementation.createDocument("", "", null);
  let xmlRoot = xmlDocument.createElement("work");
  xmlDocument.appendChild(xmlRoot);


  config.forEach(dataBlob => {

    let xmlElement = xmlDocument.createElement(dataBlob.xmlElementName);

    let domElements: DomManagement.BlobDomElements = DomManagement.getHtmlElementOf(dataBlob, false);

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

  let serializer: XMLSerializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(xmlDocument);

  console.log(xmlString);

  return xmlString;
}

export function LoadXml(xmlText: string, config: Interfaces.DataBlob[]): void {
  let domParser: DOMParser = new DOMParser();

  let XmlDocument = domParser.parseFromString(xmlText, "text/xml");

  console.log(XmlDocument);

  config.forEach(dataBlob => {
    let xmlElement = XmlDocument.querySelector(dataBlob.xmlElementName);

    if (xmlElement) {
      let domElements: DomManagement.BlobDomElements = DomManagement.getHtmlElementOf(dataBlob, false);
      let documentElement: HTMLInputElement | HTMLTextAreaElement = domElements.element as HTMLInputElement | HTMLTextAreaElement;

      if (dataBlob.xmlElementChildrenName) {
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
      } else {
        documentElement.value = xmlElement.innerHTML;
      }
    }
  });
}

export function Clear(config:Interfaces.DataBlob[]): void {
  DecisionDialog.displayDialog(
    "Cear all fields",
    "Are you sure? This will clear all fields and give you a clean slate.",
    "yes",
    (decision: string) => {
      if (decision == "yes") {
        config.forEach(dataBlob => {

          let domElement = DomManagement.getHtmlElementOf(dataBlob, false);

          (domElement.element as HTMLTextAreaElement | HTMLInputElement).value = "";

          /*let elements: NodeListOf<HTMLInputElement | HTMLTextAreaElement> = document.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
          >(dataBlob.documentElementSelector);

          elements.forEach(element => {
            element.value = "";
          });*/
        });
      }
    }
  );
}