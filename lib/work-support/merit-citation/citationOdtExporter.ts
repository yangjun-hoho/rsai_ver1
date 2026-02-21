import JSZip from 'jszip';

function escapeXML(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function exportCitationToODT(citationText: string): Promise<void> {
  const zip = new JSZip();
  const title = '공적조서';

  zip.file('mimetype', 'application/vnd.oasis.opendocument.text');

  zip.file('META-INF/manifest.xml', `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="styles.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="meta.xml"/>
</manifest:manifest>`);

  zip.file('meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                     xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0">
  <office:meta>
    <meta:generator>ARES AI Merit Citation Generator</meta:generator>
    <meta:creation-date>${new Date().toISOString()}</meta:creation-date>
  </office:meta>
</office:document-meta>`);

  zip.file('styles.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                       xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                       xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                       xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                       xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">

  <office:font-face-decls>
    <style:font-face style:name="Pretendard ExtraBold" svg:font-family="Pretendard ExtraBold" style:font-family-generic="swiss"/>
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="swiss"/>
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>

  <office:outline-style>
    <text:outline-level-style text:level="1" style:num-format=""/>
  </office:outline-style>

  <office:styles>
    <style:default-style style:family="paragraph">
      <style:text-properties style:font-name="Arial" fo:font-size="11pt" style:font-name-asian="휴먼명조"/>
    </style:default-style>

    <!-- 제목: Pretendard ExtraBold, 22pt, 중앙 정렬 -->
    <style:style style:name="Citation_Title" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0.2cm" fo:margin-bottom="0.1cm"
                                  fo:padding-top="0.3cm" fo:padding-bottom="0.4cm"/>
      <style:text-properties style:font-name="Pretendard ExtraBold" style:font-name-asian="Pretendard ExtraBold"
                             fo:font-size="22pt" fo:font-weight="800"
                             style:font-weight-asian="800" fo:color="#000000"/>
    </style:style>

    <!-- 제목 아래 회색 구분선 -->
    <style:style style:name="Title_Bottom_Line" style:family="paragraph">
      <style:paragraph-properties fo:border-top="4pt solid #999999"
                                  fo:border-bottom="none" fo:border-left="none" fo:border-right="none"
                                  fo:margin-top="0cm" fo:margin-bottom="1cm"
                                  fo:padding="0cm" fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>

    <!-- 본문: 휴먼명조, 14pt -->
    <style:style style:name="Citation_Body" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.3cm" fo:line-height="120%"/>
      <style:text-properties style:font-name="휴먼명조" style:font-name-asian="휴먼명조"
                             fo:font-size="14pt" fo:color="#1a1a1a"/>
    </style:style>

    <!-- 컬러 바 내 빈 문단 -->
    <style:style style:name="GradientLine_Empty" style:family="paragraph">
      <style:paragraph-properties fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>
  </office:styles>

  <office:automatic-styles>
    <style:page-layout style:name="pm1">
      <style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm"
                                     fo:margin-top="1.5cm" fo:margin-bottom="1.5cm"
                                     fo:margin-left="1.5cm" fo:margin-right="1.5cm"
                                     style:print-orientation="portrait"/>
    </style:page-layout>
  </office:automatic-styles>

  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="pm1"/>
  </office:master-styles>
</office:document-styles>`);

  const bodyParagraphs = citationText
    .split('\n')
    .map(line => `<text:p text:style-name="Citation_Body">${escapeXML(line)}</text:p>`)
    .join('\n      ');

  zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                        xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                        xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                        xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                        xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                        xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">
  <office:font-face-decls>
    <style:font-face style:name="Pretendard ExtraBold" svg:font-family="Pretendard ExtraBold" style:font-family-generic="swiss"/>
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="swiss"/>
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>
  <office:automatic-styles>
    <style:style style:name="GradientLine" style:family="table">
      <style:table-properties style:width="18cm" table:align="center" fo:margin-top="0.5cm" fo:margin-bottom="0.5cm"/>
    </style:style>
    <style:style style:name="GradientLine.Blue" style:family="table-column">
      <style:table-column-properties style:column-width="14.22cm"/>
    </style:style>
    <style:style style:name="GradientLine.White" style:family="table-column">
      <style:table-column-properties style:column-width="0.18cm"/>
    </style:style>
    <style:style style:name="GradientLine.Green" style:family="table-column">
      <style:table-column-properties style:column-width="3.6cm"/>
    </style:style>
    <style:style style:name="GradientLine.Row" style:family="table-row">
      <style:table-row-properties style:row-height="0.23cm"/>
    </style:style>
    <style:style style:name="GradientLine.BlueCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#1e40af" fo:border="none" fo:padding="0cm"/>
    </style:style>
    <style:style style:name="GradientLine.WhiteCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#ffffff" fo:border="none" fo:padding="0cm"/>
    </style:style>
    <style:style style:name="GradientLine.GreenCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#22c55e" fo:border="none" fo:padding="0cm"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      <table:table table:name="TopColorBar" table:style-name="GradientLine">
        <table:table-column table:style-name="GradientLine.Blue"/>
        <table:table-column table:style-name="GradientLine.White"/>
        <table:table-column table:style-name="GradientLine.Green"/>
        <table:table-row table:style-name="GradientLine.Row">
          <table:table-cell table:style-name="GradientLine.BlueCell"><text:p text:style-name="GradientLine_Empty"></text:p></table:table-cell>
          <table:table-cell table:style-name="GradientLine.WhiteCell"><text:p text:style-name="GradientLine_Empty"></text:p></table:table-cell>
          <table:table-cell table:style-name="GradientLine.GreenCell"><text:p text:style-name="GradientLine_Empty"></text:p></table:table-cell>
        </table:table-row>
      </table:table>
      <text:p text:style-name="Citation_Title">${escapeXML(title)}</text:p>
      <text:p text:style-name="Title_Bottom_Line"></text:p>
      ${bodyParagraphs}
    </office:text>
  </office:body>
</office:document-content>`);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.odt`;
  a.click();
  URL.revokeObjectURL(url);
}
