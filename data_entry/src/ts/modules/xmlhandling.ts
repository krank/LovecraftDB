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

  // Prettify using XSL
  xmlDocument = transformXml(xmlDocument, xslPrettyXML);

  // Serialize
  let serializer: XMLSerializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(xmlDocument);

  return xmlString;
}

export function loadXml(xmlText: string, config: Interfaces.DataBlob[]): void {
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

export function clear(config:Interfaces.DataBlob[]): void {
  DecisionDialog.displayDialog(
    "Clear all fields",
    "Are you sure? This will clear all fields and give you a clean slate.",
    "yes",
    (decision: string) => {
      if (decision == "yes") {
        config.forEach(dataBlob => {

          let domElement = DomManagement.getHtmlElementOf(dataBlob, false);

          (domElement.element as HTMLTextAreaElement | HTMLInputElement).value = "";

        });
      }
    }
  );
}

export function transformXml(originalDocument:Document, xslString:string): Document {
  let xsltProcessor = new XSLTProcessor();
  let domParser = new DOMParser();
  xsltProcessor.importStylesheet(domParser.parseFromString(xslString, "text/xml"));
  return xsltProcessor.transformToDocument(originalDocument);
}

export const xslPrettyXML = `<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output omit-xml-declaration="yes" indent="yes"/>

<xsl:template match="node()|@*">
  <xsl:copy>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>
</xsl:stylesheet>`;

export const xslCodeToHTML = `<?xml version="1.0"?>
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