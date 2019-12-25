import * as NameSearch from "./namesearch";

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

/*
Future improvement: separate xsl files…

 - Setting up everything (click handlers, xsl transform objects etc)
 - Function for converting back to XML

 - Name selection in html (Separate?)
 - Gendering in html
*/

export function setupRichText() {

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

}

function markNames(originalText:string): string {

  let resultString:string = originalText.replace(NameSearch.nameRegex, ' <mark class="potential-name">$1</mark>');

  return resultString;
}