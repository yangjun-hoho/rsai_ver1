import JSZip from 'jszip';

function escapeXML(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function para(styleName: string, text: string): string {
  return `<text:p text:style-name="${styleName}">${escapeXML(text)}</text:p>`;
}

export interface PressReleaseSimpleData {
  title?: string;
  paragraphs?: string[];
}

export async function exportPressReleaseToODT(data: PressReleaseSimpleData): Promise<void> {
  const zip = new JSZip();
  const docTitle = data.title || '보도자료';

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
    <meta:generator>ARES AI Press Release Generator</meta:generator>
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
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="roman"/>
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>
  <office:styles>
    <style:default-style style:family="paragraph">
      <style:text-properties style:font-name="Arial" fo:font-size="10pt" style:font-name-asian="휴먼명조"/>
    </style:default-style>

    <!-- "보도자료" 대제목: Pretendard ExtraBold, 38pt, 자간 넓게, 중앙 -->
    <style:style style:name="PR_BigTitle" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0.2cm" fo:margin-bottom="0.1cm"/>
      <style:text-properties style:font-name="Pretendard ExtraBold" style:font-name-asian="Pretendard ExtraBold"
                             fo:font-size="38pt" fo:font-weight="900" style:font-weight-asian="900"
                             fo:color="#111111" fo:letter-spacing="0.4cm"/>
    </style:style>

    <!-- 굵은 구분선 역할 빈 단락 -->
    <style:style style:name="PR_TitleLine" style:family="paragraph">
      <style:paragraph-properties fo:border-top="4pt solid #525252ff"
                                  fo:border-bottom="none" fo:border-left="none" fo:border-right="none"
                                  fo:margin-top="0cm" fo:margin-bottom="0.8cm"
                                  fo:padding="0cm" fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>

    <!-- 기사 제목: Pretendard ExtraBold, 16pt, 중앙, 굵게 -->
    <style:style style:name="PR_ArticleTitle" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.8cm" fo:line-height="120%"/>
      <style:text-properties style:font-name="Pretendard ExtraBold" style:font-name-asian="Pretendard ExtraBold"
                             fo:font-size="20pt" fo:font-weight="700" style:font-weight-asian="700"
                             fo:color="#111111"/>
    </style:style>

    <!-- 본문 단락: 휴먼명조 14pt, 200% 행간, 양쪽 정렬 -->
    <style:style style:name="PR_Body" style:family="paragraph">
      <style:paragraph-properties fo:text-align="justify" fo:margin-bottom="0.5cm" fo:line-height="150%"/>
      <style:text-properties style:font-name="휴먼명조" style:font-name-asian="휴먼명조"
                             fo:font-size="14pt" fo:color="#111111"/>
    </style:style>

    <!-- 컬러바 빈 단락 -->
    <style:style style:name="PR_Empty" style:family="paragraph">
      <style:paragraph-properties fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>
  </office:styles>

  <office:automatic-styles>
    <style:page-layout style:name="pm1">
      <style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm"
                                     fo:margin-top="1.5cm" fo:margin-bottom="1.5cm"
                                     fo:margin-left="2cm" fo:margin-right="2cm"
                                     style:print-orientation="portrait"/>
    </style:page-layout>
  </office:automatic-styles>

  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="pm1"/>
  </office:master-styles>
</office:document-styles>`);

  const bodyParagraphsXml = (data.paragraphs || [])
    .map(p => para('PR_Body', p))
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
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="roman"/>
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>
  <office:automatic-styles>
    <style:style style:name="ColorBar" style:family="table">
      <style:table-properties style:width="17cm" table:align="center" fo:margin-bottom="0cm"/>
    </style:style>
    <style:style style:name="ColorBar.Blue" style:family="table-column">
      <style:table-column-properties style:column-width="13.515cm"/>
    </style:style>
    <style:style style:name="ColorBar.White" style:family="table-column">
      <style:table-column-properties style:column-width="0.17cm"/>
    </style:style>
    <style:style style:name="ColorBar.Green" style:family="table-column">
      <style:table-column-properties style:column-width="3.315cm"/>
    </style:style>
    <style:style style:name="ColorBar.Row" style:family="table-row">
      <style:table-row-properties style:row-height="0.3cm"/>
    </style:style>
    <style:style style:name="ColorBar.BlueCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#1e40af" fo:border="none" fo:padding="0cm"/>
    </style:style>
    <style:style style:name="ColorBar.WhiteCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#ffffff" fo:border="none" fo:padding="0cm"/>
    </style:style>
    <style:style style:name="ColorBar.GreenCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#22c55e" fo:border="none" fo:padding="0cm"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      <table:table table:name="TopColorBar" table:style-name="ColorBar">
        <table:table-column table:style-name="ColorBar.Blue"/>
        <table:table-column table:style-name="ColorBar.White"/>
        <table:table-column table:style-name="ColorBar.Green"/>
        <table:table-row table:style-name="ColorBar.Row">
          <table:table-cell table:style-name="ColorBar.BlueCell"><text:p text:style-name="PR_Empty"></text:p></table:table-cell>
          <table:table-cell table:style-name="ColorBar.WhiteCell"><text:p text:style-name="PR_Empty"></text:p></table:table-cell>
          <table:table-cell table:style-name="ColorBar.GreenCell"><text:p text:style-name="PR_Empty"></text:p></table:table-cell>
        </table:table-row>
      </table:table>
      <text:p text:style-name="PR_BigTitle">보도자료</text:p>
      <text:p text:style-name="PR_TitleLine"></text:p>
      ${data.title ? para('PR_ArticleTitle', docTitle) : ''}
      ${bodyParagraphsXml}
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
  a.download = `${docTitle}.odt`;
  a.click();
  URL.revokeObjectURL(url);
}
