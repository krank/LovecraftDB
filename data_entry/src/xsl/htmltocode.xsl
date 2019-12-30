<?xml version="1.0"?>
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="work">
    <work>
      <xsl:apply-templates/>
    </work>
  </xsl:template>

  <xsl:template match="em">
    <emph>
      <xsl:apply-templates/>
    </emph>
  </xsl:template>

  <xsl:template match="blockquote">
    <quote>
      <xsl:attribute name="by">
        <xsl:value-of select="footer"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </quote>
  </xsl:template>

  <xsl:template match="blockquote/footer" />

  <xsl:template match="mark[@class='potential-name']">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="mark[contains(@class, 'gendered')]">
    <gendered><xsl:if test="contains(@class, 'male')">
        <xsl:attribute name="gender">male</xsl:attribute>
      </xsl:if>
      <xsl:if test="contains(@class, 'female')">
        <xsl:attribute name="gender">female</xsl:attribute>
      </xsl:if><xsl:apply-templates/>
    </gendered>
  </xsl:template>


  <xsl:template match="div[@class='poem']">
    <poem>
      <xsl:for-each select="section">
        <section>
          <xsl:for-each select="p">
            <line>
              <xsl:if test="contains(./@class, 'indent-')">
                <xsl:attribute name="indent">
                  <xsl:value-of select="substring-after(@class, 'indent-')" />
                </xsl:attribute>
              </xsl:if>

              <xsl:apply-templates/>
            </line>
          </xsl:for-each>
        </section>
      </xsl:for-each>
    </poem>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>