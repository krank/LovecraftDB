import * as DecisionDialog from "./decisiondialog";


interface XmlValidatableElement extends HTMLElement {
  value: string;
  warningElement: HTMLElement;
}

export interface XmlDataPair {
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
    documentElementSelector: "main .textcode",
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

    element.addEventListener("input", function (event: Event) {
      let element = this as XmlValidatableElement;

      let xmlString: string = `<body>${element.value}</body>`;

      var testDom = domParser.parseFromString(xmlString, "text/xml");

      element.warningElement.classList.toggle("xmlwarning", !!testDom.querySelector("parsererror"));

      let exportButtonElement:HTMLButtonElement = document.querySelector(".toolbar button.export");

      exportButtonElement.disabled = !!testDom.querySelector("parsererror");
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