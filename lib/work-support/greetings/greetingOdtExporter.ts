import JSZip from 'jszip';

function escapeXML(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function exportGreetingToODT(greetingText: string, greetingType: string): Promise<void> {
  const zip = new JSZip();
  const title = greetingType || '인사말씀';

  // 헤더 이미지 로드
  let imgArrayBuffer: ArrayBuffer | null = null;
  let imgHeightCm = 2.5;
  try {
    const res = await fetch('/images/document/head-report.png');
    if (res.ok) {
      imgArrayBuffer = await res.arrayBuffer();
      const blob = new Blob([imgArrayBuffer], { type: 'image/png' });
      const bitmap = await createImageBitmap(blob);
      imgHeightCm = parseFloat(((bitmap.height / bitmap.width) * 18).toFixed(3));
      bitmap.close();
    }
  } catch { /* 이미지 없으면 생략 */ }

  if (imgArrayBuffer) {
    zip.file('Pictures/head-report.png', imgArrayBuffer);
  }

  zip.file('mimetype', 'application/vnd.oasis.opendocument.text');

  zip.file('META-INF/manifest.xml', `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="styles.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="meta.xml"/>
  ${imgArrayBuffer ? '<manifest:file-entry manifest:media-type="image/png" manifest:full-path="Pictures/head-report.png"/>' : ''}
</manifest:manifest>`);

  zip.file('meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                     xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0">
  <office:meta>
    <meta:generator>ARES AI Greeting Generator</meta:generator>
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

    <!-- 제목: Pretendard ExtraBold, 22pt, 중앙 정렬 (보고서와 동일) -->
    <style:style style:name="Greeting_Title" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0.2cm" fo:margin-bottom="0.1cm"
                                  fo:padding-top="0.3cm" fo:padding-bottom="0.4cm"/>
      <style:text-properties style:font-name="Pretendard ExtraBold" style:font-name-asian="Pretendard ExtraBold"
                             fo:font-size="22pt" fo:font-weight="800"
                             style:font-weight-asian="800" fo:color="#000000"/>
    </style:style>

    <!-- 제목 아래 회색 구분선 (보고서와 동일) -->
    <style:style style:name="Title_Bottom_Line" style:family="paragraph">
      <style:paragraph-properties fo:border-top="4pt solid #999999"
                                  fo:border-bottom="none" fo:border-left="none" fo:border-right="none"
                                  fo:margin-top="0cm" fo:margin-bottom="1cm"
                                  fo:padding="0cm" fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>

    <!-- 본문: 휴먼명조, 14pt, 120% 행간 -->
    <style:style style:name="Greeting_Body" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.3cm" fo:line-height="120%"/>
      <style:text-properties style:font-name="휴먼명조" style:font-name-asian="휴먼명조"
                             fo:font-size="14pt" fo:color="#1a1a1a"/>
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

  // 본문을 줄 단위로 분리하여 단락 생성
  const bodyParagraphs = greetingText
    .split('\n')
    .map(line => `<text:p text:style-name="Greeting_Body">${escapeXML(line)}</text:p>`)
    .join('\n      ');

  zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                        xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                        xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                        xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                        xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                        xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
                        xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
                        xmlns:xlink="http://www.w3.org/1999/xlink">
  <office:font-face-decls>
    <style:font-face style:name="Pretendard ExtraBold" svg:font-family="Pretendard ExtraBold" style:font-family-generic="swiss"/>
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="swiss"/>
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>
  <office:automatic-styles>
    <style:style style:name="fr_header" style:family="graphic">
      <style:graphic-properties fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
    </style:style>
    <style:style style:name="HeaderImagePara" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      ${imgArrayBuffer ? `<text:p text:style-name="HeaderImagePara"><draw:frame draw:style-name="fr_header" draw:name="HeaderImage" text:anchor-type="as-char" svg:width="18cm" svg:height="${imgHeightCm}cm"><draw:image xlink:href="Pictures/head-report.png" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame></text:p>` : ''}
      <text:p text:style-name="Greeting_Title">${escapeXML(title)}</text:p>
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
