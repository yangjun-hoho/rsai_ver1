import { NextRequest, NextResponse } from 'next/server';
import { rejectIfPii } from '@/lib/security/piiFilter';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlink, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';

const SUPPORTED_VOICES = [
  { id: 'ko-KR-SunHiNeural', name: '선희 (여성, 한국어)', gender: 'Female', lang: 'ko-KR' },
  { id: 'ko-KR-InJoonNeural', name: '인준 (남성, 한국어)', gender: 'Male', lang: 'ko-KR' },
  { id: 'ko-KR-HyunsuNeural', name: '현수 (남성, 한국어)', gender: 'Male', lang: 'ko-KR' },
  { id: 'en-US-JennyNeural', name: 'Jenny (여성, 영어)', gender: 'Female', lang: 'en-US' },
  { id: 'en-US-GuyNeural', name: 'Guy (남성, 영어)', gender: 'Male', lang: 'en-US' },
];

export async function GET() {
  return NextResponse.json({ voices: SUPPORTED_VOICES });
}

export async function POST(request: NextRequest) {
  const outputPath = join(tmpdir(), `tts-${randomUUID()}.mp3`);

  try {
    const body = await request.json();
    const { text, voice = 'ko-KR-SunHiNeural', rate = 0, pitch = 0 } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: '변환할 텍스트를 입력해주세요.' }, { status: 400 });
    }

    const piiBlock = rejectIfPii([text], '/api/work-support/text-to-speech');
    if (piiBlock) return piiBlock;

    if (text.length > 5000) {
      return NextResponse.json({ error: '텍스트는 5,000자 이하로 입력해주세요.' }, { status: 400 });
    }

    const rateStr = rate >= 0 ? `+${rate}%` : `${rate}%`;
    const pitchStr = pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`;

    await new Promise<void>((resolve, reject) => {
      const args = [
        '--text', text,
        '--voice', voice,
        '--rate', rateStr,
        '--pitch', pitchStr,
        '--write-media', outputPath,
      ];

      const proc = spawn('edge-tts', args, { shell: true });

      let stderr = '';
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      proc.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`edge-tts exited with code ${code}: ${stderr}`));
        }
      });

      proc.on('error', (err: Error) => {
        reject(new Error(`edge-tts not found: ${err.message}. Install with: pip install edge-tts`));
      });
    });

    const audioBuffer = await readFile(outputPath);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
        'Content-Disposition': 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error('[TTS API error]', error);
    const message = error instanceof Error ? error.message : '음성 변환 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    try {
      await unlink(outputPath);
    } catch {
      // File may not exist if TTS failed early
    }
  }
}
