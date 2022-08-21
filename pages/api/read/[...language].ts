import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import { Result } from '@sapphire/result';

type APIData = {
  chapter?: string | string[] | undefined;
  language?: string | string[] | undefined;
  chapterImages?: string[];
  cover?: string;
  error?: unknown;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<APIData>
) {
  const result = Result.from(() => {
    const { chapter, language } = req.query;
    const chapterImages = fs.readdirSync(`public/assets/images/${chapter}/${language}`);
    return { chapter, language, cover: `${process.env.VERCEL_URL ?? "http://localhost:3000"}/assets/images/${chapter}/${language}/PAGE_01.png`, chapterImages: chapterImages.map(image => `${process.env.VERCEL_URL ?? "http://localhost:3000"}/assets/images/${chapter}/${language}/${image}`) };
  });

  if (result.isOk()) {
    return res.status(200).json({ ...result.unwrap() });
  } else {
    return res.status(500).json({ error: String(result.unwrapErr()) });
  }
}