/**
 * scenarioOdtExporter.ts
 *
 * AI가 생성한 대본(시나리오) 텍스트를 ODT(OpenDocument Text) 파일로 변환하여
 * 브라우저 다운로드를 트리거하는 유틸리티 모듈.
 *
 * ODT 파일 구조 (ZIP 아카이브):
 *   mimetype          - MIME 타입 선언 (압축 없이 첫 번째에 위치해야 함)
 *   META-INF/
 *     manifest.xml    - 포함된 파일 목록 및 각 MIME 타입 선언
 *   meta.xml          - 문서 메타데이터 (생성 도구, 생성 일시 등)
 *   styles.xml        - 전역 스타일 정의 (폰트, 단락 스타일, 페이지 레이아웃)
 *   content.xml       - 실제 문서 내용 (본문 텍스트, 표 등)
 *
 * 문서 레이아웃:
 *   [상단 컬러 바] 파랑(79%) / 흰색(1%) / 초록(20%) - 3열 표로 구현
 *   [제목]         Pretendard ExtraBold, 22pt, 중앙 정렬
 *   [구분선]       회색 상단 테두리 4pt
 *   [본문]         휴먼명조, 12pt, 행간 120%
 */

import JSZip from 'jszip';

/**
 * XML 특수문자를 이스케이프하는 헬퍼 함수.
 *
 * ODT 내부 XML에 사용자 텍스트를 삽입할 때 반드시 호출해야 함.
 * 이스케이프하지 않으면 XML 파싱 오류로 문서가 열리지 않음.
 *
 * 변환 규칙:
 *   &  →  &amp;   (앰퍼샌드: 가장 먼저 치환해야 이중 치환 방지)
 *   <  →  &lt;    (여는 꺽쇠)
 *   >  →  &gt;    (닫는 꺽쇠)
 *   "  →  &quot;  (큰따옴표)
 *   '  →  &apos;  (작은따옴표)
 */
function escapeXML(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 대본 텍스트를 ODT 파일로 내보내고 브라우저 다운로드를 실행한다.
 *
 * @param scriptContent - AI가 생성한 대본 텍스트 (줄바꿈 포함 일반 문자열)
 * @param titleLabel    - 문서 제목 (예: '발표 대본', '시나리오' 등). 파일명에도 사용됨.
 */
export async function exportScenarioToODT(scriptContent: string, titleLabel: string): Promise<void> {
  // JSZip 인스턴스 생성 - ODT는 ZIP 아카이브 형식
  const zip = new JSZip();

  // 제목이 없을 경우 기본값 사용
  const title = titleLabel || '대본';

  // ─────────────────────────────────────────────
  // 1. mimetype
  //    ODT 규격상 ZIP의 첫 번째 항목이어야 하며,
  //    압축 없이(store) 저장해야 LibreOffice가 인식함.
  //    JSZip은 기본적으로 이 순서를 보장한다.
  // ─────────────────────────────────────────────
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text');

  // ─────────────────────────────────────────────
  // 2. META-INF/manifest.xml
  //    ZIP 안에 포함된 파일들의 목록과 각각의 MIME 타입을 선언.
  //    여기에 등록되지 않은 파일은 ODT 리더가 무시할 수 있음.
  // ─────────────────────────────────────────────
  zip.file('META-INF/manifest.xml', `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <!-- 루트 문서 타입 선언 -->
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
  <!-- 본문 XML -->
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/>
  <!-- 스타일 XML -->
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="styles.xml"/>
  <!-- 메타데이터 XML -->
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="meta.xml"/>
</manifest:manifest>`);

  // ─────────────────────────────────────────────
  // 3. meta.xml
  //    문서 생성 도구 이름과 생성 일시를 ISO 8601 형식으로 기록.
  //    LibreOffice 속성 대화상자에서 확인 가능.
  // ─────────────────────────────────────────────
  zip.file('meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                     xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0">
  <office:meta>
    <!-- 생성 도구 식별자 -->
    <meta:generator>ARES AI Scenario Generator</meta:generator>
    <!-- 문서 생성 일시 (ISO 8601) -->
    <meta:creation-date>${new Date().toISOString()}</meta:creation-date>
  </office:meta>
</office:document-meta>`);

  // ─────────────────────────────────────────────
  // 4. styles.xml
  //    문서 전체에 적용되는 전역 스타일을 정의.
  //    content.xml의 automatic-styles와 달리, 여기서 정의한 스타일은
  //    LibreOffice 스타일 패널에 노출되며 재사용 가능.
  // ─────────────────────────────────────────────
  zip.file('styles.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                       xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                       xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                       xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                       xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">

  <!-- 문서에서 사용할 폰트 패밀리 선언 -->
  <office:font-face-decls>
    <!-- 제목용 폰트: Pretendard ExtraBold (굵은 한글·영문) -->
    <style:font-face style:name="Pretendard ExtraBold" svg:font-family="Pretendard ExtraBold" style:font-family-generic="swiss"/>
    <!-- 본문용 폰트: 휴먼명조 (한글 명조체) -->
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="swiss"/>
    <!-- 영문 대체 폰트: Arial -->
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>

  <!-- 개요(목차) 번호 형식 설정: 번호 없음 -->
  <office:outline-style>
    <text:outline-level-style text:level="1" style:num-format=""/>
  </office:outline-style>

  <office:styles>
    <!-- 기본 단락 스타일: 영문 Arial 11pt, 한글 휴먼명조 -->
    <style:default-style style:family="paragraph">
      <style:text-properties style:font-name="Arial" fo:font-size="11pt" style:font-name-asian="휴먼명조"/>
    </style:default-style>

    <!--
      Scenario_Title: 문서 제목 스타일
      - 폰트: Pretendard ExtraBold (한글·영문 동일)
      - 크기: 22pt, 굵기: 800 (ExtraBold)
      - 정렬: 중앙
      - 색상: 검정 (#000000)
    -->
    <style:style style:name="Scenario_Title" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0.2cm" fo:margin-bottom="0.1cm"
                                  fo:padding-top="0.3cm" fo:padding-bottom="0.4cm"/>
      <style:text-properties style:font-name="Pretendard ExtraBold" style:font-name-asian="Pretendard ExtraBold"
                             fo:font-size="22pt" fo:font-weight="800"
                             style:font-weight-asian="800" fo:color="#000000"/>
    </style:style>

    <!--
      Title_Bottom_Line: 제목 아래 회색 구분선
      - 상단 테두리 4pt solid #999999 만 표시 (나머지 테두리 없음)
      - 폰트 크기 2pt로 줄 높이를 최소화하여 얇은 선처럼 보이게 함
      - margin-bottom: 1cm로 본문과의 간격 확보
    -->
    <style:style style:name="Title_Bottom_Line" style:family="paragraph">
      <style:paragraph-properties fo:border-top="4pt solid #999999"
                                  fo:border-bottom="none" fo:border-left="none" fo:border-right="none"
                                  fo:margin-top="0cm" fo:margin-bottom="1cm"
                                  fo:padding="0cm" fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>

    <!--
      Scenario_Body: 대본 본문 스타일
      - 폰트: 휴먼명조 12pt (한글·영문 동일)
      - 색상: 거의 검정 (#1a1a1a)
      - 행간: 120% (읽기 편한 밀도)
      - 단락 하단 여백: 0.2cm
    -->
    <style:style style:name="Scenario_Body" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.2cm" fo:line-height="120%"/>
      <style:text-properties style:font-name="휴먼명조" style:font-name-asian="휴먼명조"
                             fo:font-size="12pt" fo:color="#1a1a1a"/>
    </style:style>

    <!--
      GradientLine_Empty: 상단 컬러 바 표 셀 내부의 빈 단락
      - 표 셀에는 반드시 하나 이상의 text:p가 있어야 유효한 ODT임
      - 폰트 2pt + 줄 높이 0.1cm로 시각적으로 보이지 않게 처리
    -->
    <style:style style:name="GradientLine_Empty" style:family="paragraph">
      <style:paragraph-properties fo:line-height="0.1cm"/>
      <style:text-properties fo:font-size="2pt"/>
    </style:style>
  </office:styles>

  <!--
    페이지 레이아웃: A4 세로 (210×297mm), 여백 상하좌우 각 1.5cm
    pm1로 명명하고 아래 master-styles에서 Standard 마스터 페이지에 연결.
  -->
  <office:automatic-styles>
    <style:page-layout style:name="pm1">
      <style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm"
                                     fo:margin-top="1.5cm" fo:margin-bottom="1.5cm"
                                     fo:margin-left="1.5cm" fo:margin-right="1.5cm"
                                     style:print-orientation="portrait"/>
    </style:page-layout>
  </office:automatic-styles>

  <!-- Standard 마스터 페이지에 위에서 정의한 pm1 레이아웃 적용 -->
  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="pm1"/>
  </office:master-styles>
</office:document-styles>`);

  // ─────────────────────────────────────────────
  // 5. 본문 단락 XML 생성
  //    scriptContent를 줄바꿈(\n) 기준으로 분리하여
  //    각 줄을 <text:p> 단락 하나로 변환.
  //    빈 줄도 빈 단락으로 유지되어 원본 줄 구조가 보존됨.
  //    escapeXML로 특수문자를 이스케이프하여 XML 오류 방지.
  // ─────────────────────────────────────────────
  const bodyParagraphs = scriptContent
    .split('\n')
    .map(line => `<text:p text:style-name="Scenario_Body">${escapeXML(line)}</text:p>`)
    .join('\n      ');

  // ─────────────────────────────────────────────
  // 6. content.xml
  //    실제 문서 내용을 담는 핵심 파일.
  //    automatic-styles: content.xml 전용 스타일 (표·셀 스타일)
  //    office:body > office:text: 실제 렌더링되는 문서 영역
  //
  //    문서 구성 순서:
  //      ① 상단 컬러 바 (3열 표: 파랑 / 흰색 / 초록)
  //      ② 제목 단락 (Scenario_Title 스타일)
  //      ③ 구분선 단락 (Title_Bottom_Line 스타일)
  //      ④ 본문 단락들 (Scenario_Body 스타일, 줄마다 하나)
  // ─────────────────────────────────────────────
  zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                        xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                        xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                        xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                        xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                        xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">
  <!-- content.xml 전용 폰트 선언 (styles.xml과 동일하게 중복 선언 필요) -->
  <office:font-face-decls>
    <style:font-face style:name="Pretendard ExtraBold" svg:font-family="Pretendard ExtraBold" style:font-family-generic="swiss"/>
    <style:font-face style:name="휴먼명조" svg:font-family="휴먼명조" style:font-family-generic="swiss"/>
    <style:font-face style:name="Arial" svg:font-family="Arial" style:font-family-generic="swiss"/>
  </office:font-face-decls>
  <office:automatic-styles>
    <!--
      상단 컬러 바 표 스타일
      전체 너비 18cm, 페이지 중앙 정렬, 상하 여백 0.5cm
    -->
    <style:style style:name="GradientLine" style:family="table">
      <style:table-properties style:width="18cm" table:align="center" fo:margin-top="0.5cm" fo:margin-bottom="0.5cm"/>
    </style:style>
    <!-- 파랑 열: 전체 너비의 약 79% → 14.22cm -->
    <style:style style:name="GradientLine.Blue" style:family="table-column">
      <style:table-column-properties style:column-width="14.22cm"/>
    </style:style>
    <!-- 흰색 열: 구분 여백 → 0.18cm (약 1%) -->
    <style:style style:name="GradientLine.White" style:family="table-column">
      <style:table-column-properties style:column-width="0.18cm"/>
    </style:style>
    <!-- 초록 열: 전체 너비의 약 20% → 3.6cm -->
    <style:style style:name="GradientLine.Green" style:family="table-column">
      <style:table-column-properties style:column-width="3.6cm"/>
    </style:style>
    <!-- 행 높이: 0.23cm (얇은 색 띠) -->
    <style:style style:name="GradientLine.Row" style:family="table-row">
      <style:table-row-properties style:row-height="0.23cm"/>
    </style:style>
    <!-- 파랑 셀 배경: #1e40af (ARES 브랜드 블루) -->
    <style:style style:name="GradientLine.BlueCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#1e40af" fo:border="none" fo:padding="0cm"/>
    </style:style>
    <!-- 흰색 셀 배경: #ffffff (구분 간격) -->
    <style:style style:name="GradientLine.WhiteCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#ffffff" fo:border="none" fo:padding="0cm"/>
    </style:style>
    <!-- 초록 셀 배경: #22c55e (ARES 브랜드 그린) -->
    <style:style style:name="GradientLine.GreenCell" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#22c55e" fo:border="none" fo:padding="0cm"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      <!--
        ① 상단 컬러 바
           3열 표(파랑/흰색/초록)로 구현한 그라디언트 느낌의 장식 띠.
           각 셀에는 ODT 규격상 빈 단락(GradientLine_Empty)이 필수.
      -->
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
      <!-- ② 제목: titleLabel을 XML 이스케이프 후 삽입 -->
      <text:p text:style-name="Scenario_Title">${escapeXML(title)}</text:p>
      <!-- ③ 구분선: 빈 단락에 상단 테두리만 적용하여 수평선 효과 -->
      <text:p text:style-name="Title_Bottom_Line"></text:p>
      <!-- ④ 본문: 줄마다 text:p 단락으로 삽입 -->
      ${bodyParagraphs}
    </office:text>
  </office:body>
</office:document-content>`);

  // ─────────────────────────────────────────────
  // 7. ZIP → Blob 변환
  //    ODT MIME 타입을 명시하여 브라우저·OS가 올바른 앱과 연결하도록 함.
  // ─────────────────────────────────────────────
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text',
  });

  // ─────────────────────────────────────────────
  // 8. 브라우저 다운로드 트리거
  //    Object URL을 임시로 생성 → 가상 <a> 태그로 클릭 → 즉시 해제.
  //    파일명: "{title}.odt" (예: "발표 대본.odt")
  // ─────────────────────────────────────────────
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.odt`;
  a.click();
  // 메모리 누수 방지: Object URL은 사용 후 즉시 해제
  URL.revokeObjectURL(url);
}
