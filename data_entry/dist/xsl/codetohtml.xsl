<?xml version="1.0"?>
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
            <xsl:attribute name="class">gendered <xsl:value-of select="@gender"/>
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

</xsl:stylesheet>