import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

type AnyFn = (...args: unknown[]) => Record<string, unknown>;

interface Slide {
  slideNumber: number;
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  bulletPoints: string[];
  notes?: string;
}

/* ══════════════════════════════════════════════════════
   템플릿 1: 기획조정실 (네이비 스트립)
══════════════════════════════════════════════════════ */
const T1 = {
  navy: '1D3A8F', green: '149B40', gold: 'FFC000',
  blue: '5B9BD5', white: 'FFFFFF', gray: '9CA3AF',
  dark: '1F2937', font: '맑은 고딕',
};
const W = 13.33, H = 7.5;
const STRIP_W = 2.2, CX = 2.35, CW = W - CX - 0.1;

function t1LeftStrip(pptx: Record<string, unknown>, sl: Record<string, unknown>) {
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string; ellipse: string } }).ShapeType.rect,
    { x: 0, y: 0, w: STRIP_W, h: H, fill: { color: T1.navy }, line: { type: 'none' } });
  (sl as { addText: AnyFn }).addText('2026', {
    x: 0, y: 0.5, w: STRIP_W, h: 0.55,
    fontSize: 26, bold: true, color: T1.gold, fontFace: T1.font, align: 'center',
  });
  (sl as { addText: AnyFn }).addText('NAMYANGJU', {
    x: 0, y: 1.2, w: STRIP_W, h: 5.5,
    vert: 'vert', fontSize: 19, bold: true, color: T1.white,
    fontFace: 'Arial', align: 'center', valign: 'middle', charSpacing: 4, transparency: 15,
  });
}

function t1Header(sl: Record<string, unknown>, num: number) {
  (sl as { addShape: AnyFn }).addShape('rect' as unknown as object,
    { x: CX, y: 0.46, w: CW, h: 0.03, fill: { color: T1.navy }, line: { type: 'none' } });
  (sl as { addText: AnyFn }).addText('기획조정실', { x: CX, y: 0.12, w: 4, h: 0.3, fontSize: 10, color: T1.gray, fontFace: T1.font });
  (sl as { addText: AnyFn }).addText(`${num}`, { x: W - 1.2, y: 0.12, w: 1.1, h: 0.3, fontSize: 10, color: T1.gray, fontFace: T1.font, align: 'right' });
}

function t1TitleBox(pptx: Record<string, unknown>, sl: Record<string, unknown>, title: string, y: number) {
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect,
    { x: CX, y, w: CW, h: 0.82, fill: { color: T1.navy }, line: { type: 'none' } });
  (sl as { addText: AnyFn }).addText(title, {
    x: CX, y, w: CW, h: 0.82,
    fontSize: 22, bold: true, color: T1.white, fontFace: T1.font, align: 'left', valign: 'middle', insetLeft: 0.2,
  });
}

async function buildTemplate1(pptx: Record<string, unknown>, slides: Slide[], bgTitlePath: string, bgContentPath: string) {
  const hasBgTitle   = fs.existsSync(bgTitlePath);
  const hasBgContent = fs.existsSync(bgContentPath);

  for (const slide of slides) {
    const sl = (pptx as { addSlide: AnyFn }).addSlide();
    (sl as { background: unknown }).background = { color: T1.white };

    /* ── 표지 ── */
    if (slide.type === 'title') {
      if (hasBgTitle) { (sl as { addImage: AnyFn }).addImage({ path: bgTitlePath, x: 0, y: 0, w: W, h: H }); }
      else { (sl as { background: unknown }).background = { color: T1.navy }; }
      (sl as { addText: AnyFn }).addText('남양주시청', { x: 1, y: 1.2, w: W - 2, h: 0.45, fontSize: 14, color: T1.gray, fontFace: T1.font, align: hasBgTitle ? 'left' : 'center' });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: hasBgTitle ? 1 : 4.5, y: 1.75, w: hasBgTitle ? 3 : 4.33, h: 0.04, fill: { color: T1.navy }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText(slide.title, { x: 1, y: 2.0, w: W - 2, h: 2, fontSize: 38, bold: true, color: T1.navy, fontFace: T1.font, align: hasBgTitle ? 'left' : 'center', lineSpacingMultiple: 1.2 });
      if (slide.subtitle) (sl as { addText: AnyFn }).addText(slide.subtitle, { x: 1, y: 4.15, w: W - 2, h: 0.8, fontSize: 20, color: '#374151', fontFace: T1.font, align: hasBgTitle ? 'left' : 'center' });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0, y: H - 0.55, w: W, h: 0.55, fill: { color: T1.navy }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText('기획조정실', { x: 0.4, y: H - 0.5, w: 4, h: 0.4, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFace: T1.font });
      (sl as { addText: AnyFn }).addText('2026', { x: W - 1.5, y: H - 0.5, w: 1.3, h: 0.4, fontSize: 11, bold: true, color: T1.gold, fontFace: T1.font, align: 'right' });
      continue;
    }

    t1LeftStrip(pptx, sl);
    if (hasBgContent && slide.type === 'content') (sl as { addImage: AnyFn }).addImage({ path: bgContentPath, x: CX, y: 0, w: CW, h: H, transparency: 85 });
    t1Header(sl, slide.slideNumber);

    /* ── 목차 ── */
    if (slide.type === 'index') {
      t1TitleBox(pptx, sl, '목차', 0.55);
      slide.bulletPoints.forEach((pt, i) => {
        const by = 1.55 + i * 0.78;
        (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { ellipse: string } }).ShapeType.ellipse, { x: CX, y: by + 0.1, w: 0.5, h: 0.5, fill: { color: T1.navy }, line: { type: 'none' } });
        (sl as { addText: AnyFn }).addText(`${i + 1}`, { x: CX, y: by + 0.1, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: T1.white, fontFace: T1.font, align: 'center', valign: 'middle' });
        (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: CX + 0.6, y: by + 0.08, w: CW - 0.65, h: 0.54, fill: { color: 'EEF2FF' }, line: { color: T1.navy, pt: 1, type: 'solid' } });
        (sl as { addText: AnyFn }).addText(pt, { x: CX + 0.7, y: by + 0.08, w: CW - 0.75, h: 0.54, fontSize: 15, color: T1.dark, fontFace: T1.font, valign: 'middle' });
      });
      continue;
    }

    /* ── 결론 ── */
    if (slide.type === 'conclusion') {
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: CX, y: 0.55, w: 0.9, h: 0.35, fill: { color: T1.green }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText('결론', { x: CX, y: 0.55, w: 0.9, h: 0.35, fontSize: 12, bold: true, color: T1.white, fontFace: T1.font, align: 'center', valign: 'middle' });
      (sl as { addText: AnyFn }).addText(slide.title, { x: CX + 1.0, y: 0.55, w: CW - 1.05, h: 0.8, fontSize: 22, bold: true, color: T1.navy, fontFace: T1.font, valign: 'middle' });
      let yp = 1.5;
      if (slide.content) {
        (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: CX, y: yp, w: 0.05, h: 0.6, fill: { color: T1.blue }, line: { type: 'none' } });
        (sl as { addText: AnyFn }).addText(slide.content, { x: CX + 0.15, y: yp, w: CW - 0.2, h: 0.6, fontSize: 13, color: '374151', italic: true, fontFace: T1.font, valign: 'middle' });
        yp += 0.75;
      }
      slide.bulletPoints.forEach((pt, i) => {
        const by = yp + i * 0.68;
        (sl as { addText: AnyFn }).addText('✓', { x: CX, y: by, w: 0.4, h: 0.55, fontSize: 16, bold: true, color: T1.green, fontFace: T1.font, align: 'center', valign: 'middle' });
        (sl as { addText: AnyFn }).addText(pt, { x: CX + 0.45, y: by, w: CW - 0.5, h: 0.55, fontSize: 14, color: T1.dark, fontFace: T1.font, valign: 'middle', wrap: true });
      });
      continue;
    }

    /* ── 본문 ── */
    t1TitleBox(pptx, sl, slide.title, 0.55);
    let yp = 1.5;
    if (slide.content) {
      (sl as { addText: AnyFn }).addText(slide.content, { x: CX, y: yp, w: CW, h: 0.55, fontSize: 13, color: '374151', italic: true, fontFace: T1.font, valign: 'middle', wrap: true });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: CX, y: yp + 0.58, w: CW, h: 0.02, fill: { color: 'E5E7EB' }, line: { type: 'none' } });
      yp += 0.7;
    }
    const bh = Math.min(0.72, (H - yp - 0.2) / Math.max(slide.bulletPoints.length, 1));
    slide.bulletPoints.forEach((pt, i) => {
      const by = yp + i * bh, mc = i % 2 === 0 ? T1.navy : T1.gold;
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: CX, y: by + 0.08, w: 0.06, h: bh - 0.15, fill: { color: mc }, line: { type: 'none' } });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { ellipse: string } }).ShapeType.ellipse, { x: CX + 0.1, y: by + bh / 2 - 0.07, w: 0.13, h: 0.13, fill: { color: mc }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText(pt, { x: CX + 0.32, y: by, w: CW - 0.37, h: bh, fontSize: 14, color: T1.dark, fontFace: T1.font, valign: 'middle', wrap: true });
    });
  }
}

/* ══════════════════════════════════════════════════════
   템플릿 2: 교통국 (퍼플 모던)
══════════════════════════════════════════════════════ */
const T2 = {
  purple: '7030A0', blue: '0070C0', navy: '1D3A8F',
  green: '149B40',  white: 'FFFFFF', gray: '9CA3AF',
  dark: '1F2937',   light: 'F5F0FA', font: '맑은 고딕',
};

function t2Stripe(sl: Record<string, unknown>, h: number, y: number, pptx: Record<string, unknown>) {
  /* 퍼플/블루/그린 3색 하단 바 */
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0,       y, w: W * 0.5, h, fill: { color: T2.blue },   line: { type: 'none' } });
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: W * 0.5, y, w: W * 0.2, h, fill: { color: T2.green },  line: { type: 'none' } });
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: W * 0.7, y, w: W * 0.3, h, fill: { color: T2.purple }, line: { type: 'none' } });
}

function t2TopBar(sl: Record<string, unknown>, pptx: Record<string, unknown>) {
  /* 상단 퍼플/블루/그린 바 */
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0,       y: 0, w: W * 0.6, h: 0.12, fill: { color: T2.purple }, line: { type: 'none' } });
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: W * 0.6, y: 0, w: W * 0.2, h: 0.12, fill: { color: T2.blue },   line: { type: 'none' } });
  (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: W * 0.8, y: 0, w: W * 0.2, h: 0.12, fill: { color: T2.green },  line: { type: 'none' } });
}

async function buildTemplate2(pptx: Record<string, unknown>, slides: Slide[], bg2Path: string) {
  const hasBg2 = fs.existsSync(bg2Path);

  for (const slide of slides) {
    const sl = (pptx as { addSlide: AnyFn }).addSlide();
    (sl as { background: unknown }).background = { color: T2.white };

    /* ── 표지 ── */
    if (slide.type === 'title') {
      if (hasBg2) (sl as { addImage: AnyFn }).addImage({ path: bg2Path, x: 0, y: 0, w: W, h: H, transparency: 80 });
      /* 상단 퍼플 바 */
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0, y: 0, w: W, h: 0.18, fill: { color: T2.purple }, line: { type: 'none' } });
      /* 좌측 퍼플 세로 바 */
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.8, y: 1.1, w: 0.08, h: 0.8, fill: { color: T2.purple }, line: { type: 'none' } });
      /* 기관명 */
      (sl as { addText: AnyFn }).addText('남양주시', { x: 1.0, y: 1.1, w: 5, h: 0.5, fontSize: 15, color: T2.gray, fontFace: T2.font });
      /* 구분선 */
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.8, y: 1.75, w: 8, h: 0.04, fill: { color: T2.purple }, line: { type: 'none' } });
      /* 메인 제목 */
      (sl as { addText: AnyFn }).addText(slide.title, { x: 0.8, y: 2.0, w: W - 1.6, h: 2.2, fontSize: 38, bold: true, color: T2.navy, fontFace: T2.font, lineSpacingMultiple: 1.2 });
      if (slide.subtitle) (sl as { addText: AnyFn }).addText(slide.subtitle, { x: 0.8, y: 4.35, w: W - 1.6, h: 0.7, fontSize: 20, color: T2.purple, fontFace: T2.font, bold: true });
      /* 하단 스트라이프 */
      t2Stripe(sl, 0.22, H - 0.22, pptx);
      continue;
    }

    /* 공통 상단 바 */
    t2TopBar(sl, pptx);
    /* 배경 이미지 (투명) */
    if (hasBg2) (sl as { addImage: AnyFn }).addImage({ path: bg2Path, x: 0, y: 0, w: W, h: H, transparency: 92 });
    /* 헤더 구분선 */
    (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 0.45, w: W - 0.8, h: 0.02, fill: { color: 'E5E7EB' }, line: { type: 'none' } });
    (sl as { addText: AnyFn }).addText('교통국', { x: 0.4, y: 0.18, w: 4, h: 0.28, fontSize: 10, color: T2.gray, fontFace: T2.font });
    (sl as { addText: AnyFn }).addText(`${slide.slideNumber}`, { x: W - 1.2, y: 0.18, w: 1.0, h: 0.28, fontSize: 10, color: T2.gray, fontFace: T2.font, align: 'right' });

    /* ── 목차 ── */
    if (slide.type === 'index') {
      /* 목차 배지 */
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 0.55, w: 1.0, h: 0.38, fill: { color: T2.purple }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText('목차', { x: 0.4, y: 0.55, w: 1.0, h: 0.38, fontSize: 13, bold: true, color: T2.white, fontFace: T2.font, align: 'center', valign: 'middle' });
      (sl as { addText: AnyFn }).addText('TABLE OF CONTENTS', { x: 1.5, y: 0.6, w: 5, h: 0.3, fontSize: 10, color: T2.gray, fontFace: 'Arial' });
      /* 구분선 */
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 1.05, w: W - 0.8, h: 0.02, fill: { color: T2.purple }, line: { type: 'none' } });

      slide.bulletPoints.forEach((pt, i) => {
        const by = 1.2 + i * 0.72;
        const isEven = i % 2 === 0;
        /* 배경 박스 */
        (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: by, w: W - 0.8, h: 0.6, fill: { color: isEven ? T2.light : T2.white }, line: { color: T2.purple + '44', pt: 1, type: 'solid' } });
        /* 번호 배지 */
        const num = String(i + 1).padStart(3, '0');
        (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.5, y: by + 0.08, w: 0.65, h: 0.44, fill: { color: T2.purple }, line: { type: 'none' } });
        (sl as { addText: AnyFn }).addText(num, { x: 0.5, y: by + 0.08, w: 0.65, h: 0.44, fontSize: 13, bold: true, color: T2.white, fontFace: 'Arial', align: 'center', valign: 'middle' });
        /* 항목 텍스트 */
        (sl as { addText: AnyFn }).addText(pt, { x: 1.25, y: by, w: W - 1.7, h: 0.6, fontSize: 15, color: T2.dark, fontFace: T2.font, valign: 'middle' });
      });
      t2Stripe(sl, 0.18, H - 0.18, pptx);
      continue;
    }

    /* ── 결론 ── */
    if (slide.type === 'conclusion') {
      /* 그라디언트 제목 바 */
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 0.55, w: W - 0.8, h: 0.78, fill: { color: T2.purple }, line: { type: 'none' } });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 0.55, w: 0.08, h: 0.78, fill: { color: T2.green }, line: { type: 'none' } });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.5, y: 0.55, w: 1.2, h: 0.78, fill: { color: 'FFFFFF22' }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText('결론', { x: 0.55, y: 0.55, w: 1.1, h: 0.4, fontSize: 12, bold: true, color: T2.white, fontFace: T2.font, align: 'center', valign: 'middle' });
      (sl as { addText: AnyFn }).addText(slide.title, { x: 1.8, y: 0.55, w: W - 2.3, h: 0.78, fontSize: 22, bold: true, color: T2.white, fontFace: T2.font, valign: 'middle' });
      let yp = 1.45;
      if (slide.content) {
        (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: yp, w: 0.06, h: 0.6, fill: { color: T2.purple }, line: { type: 'none' } });
        (sl as { addText: AnyFn }).addText(slide.content, { x: 0.55, y: yp, w: W - 1.0, h: 0.6, fontSize: 13, color: '374151', italic: true, fontFace: T2.font, valign: 'middle' });
        yp += 0.75;
      }
      slide.bulletPoints.forEach((pt, i) => {
        const by = yp + i * 0.68;
        (sl as { addText: AnyFn }).addText('✓', { x: 0.4, y: by, w: 0.4, h: 0.55, fontSize: 16, bold: true, color: T2.green, fontFace: T2.font, align: 'center', valign: 'middle' });
        (sl as { addText: AnyFn }).addText(pt, { x: 0.85, y: by, w: W - 1.3, h: 0.55, fontSize: 14, color: T2.dark, fontFace: T2.font, valign: 'middle', wrap: true });
      });
      t2Stripe(sl, 0.18, H - 0.18, pptx);
      continue;
    }

    /* ── 본문 ── */
    /* 제목 바 (퍼플 그라디언트) */
    (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 0.55, w: W - 0.8, h: 0.78, fill: { color: T2.purple }, line: { type: 'none' } });
    /* 초록 액센트 */
    (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: 0.55, w: 0.08, h: 0.78, fill: { color: T2.green }, line: { type: 'none' } });
    (sl as { addText: AnyFn }).addText(slide.title, { x: 0.6, y: 0.55, w: W - 1.1, h: 0.78, fontSize: 22, bold: true, color: T2.white, fontFace: T2.font, valign: 'middle', insetLeft: 0.1 });

    let yp = 1.45;
    if (slide.content) {
      (sl as { addText: AnyFn }).addText(slide.content, { x: 0.4, y: yp, w: W - 0.8, h: 0.55, fontSize: 13, color: '374151', italic: true, fontFace: T2.font, valign: 'middle', wrap: true });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: yp + 0.58, w: W - 0.8, h: 0.02, fill: { color: 'E5E7EB' }, line: { type: 'none' } });
      yp += 0.7;
    }
    const bh = Math.min(0.72, (H - yp - 0.25) / Math.max(slide.bulletPoints.length, 1));
    slide.bulletPoints.forEach((pt, i) => {
      const by = yp + i * bh;
      const mc = i % 2 === 0 ? T2.purple : T2.blue;
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { rect: string } }).ShapeType.rect, { x: 0.4, y: by + 0.08, w: 0.06, h: bh - 0.15, fill: { color: mc }, line: { type: 'none' } });
      (sl as { addShape: AnyFn }).addShape((pptx as { ShapeType: { ellipse: string } }).ShapeType.ellipse, { x: 0.5, y: by + bh / 2 - 0.07, w: 0.13, h: 0.13, fill: { color: mc }, line: { type: 'none' } });
      (sl as { addText: AnyFn }).addText(pt, { x: 0.72, y: by, w: W - 1.1, h: bh, fontSize: 14, color: T2.dark, fontFace: T2.font, valign: 'middle', wrap: true });
    });
    t2Stripe(sl, 0.15, H - 0.15, pptx);
  }
}

/* ══════════════════════════════════════════════════════
   API Handler
══════════════════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    const { slides, title = '프레젠테이션', template = 'template1' } = await request.json() as {
      slides: Slide[];
      title: string;
      template?: string;
    };

    if (!slides?.length) {
      return NextResponse.json({ error: '슬라이드 데이터가 없습니다.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PptxGenJS = require('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout  = 'LAYOUT_WIDE';
    pptx.title   = title;
    pptx.company = '남양주시청';

    const pub = path.join(process.cwd(), 'public', 'ppt-template');

    if (template === 'template2') {
      await buildTemplate2(pptx, slides, path.join(pub, 'bg2-content.png'));
    } else {
      await buildTemplate1(pptx, slides, path.join(pub, 'bg-title.png'), path.join(pub, 'bg-content.png'));
    }

    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
    const safeTitle  = title.replace(/[^a-zA-Z0-9가-힣_\-]/g, '_');

    return new NextResponse(new Uint8Array(pptxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeTitle)}.pptx"`,
      },
    });
  } catch (error) {
    console.error('[ppt download error]', error);
    return NextResponse.json({ error: 'PPT 파일 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
