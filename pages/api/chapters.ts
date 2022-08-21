import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import { Result } from '@sapphire/result';

type APIData = {
  chapters?: { chapter: string; languages: { language: string; cover: string; }[]; cover: string; }[];
  error?: unknown;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<APIData>
) {
  const result = Result.from(() => {
    const chaptersFolder = fs.readdirSync("public/assets/images");
    const chapters = [];

    for (const chapter of chaptersFolder) {
      const languagesFolder = fs.readdirSync(`public/assets/images/${chapter}`);
      const languages = [];
      for (const language of languagesFolder) { languages.push({ language, cover: `${process.env.VERCEL_URL ?? "http://localhost:3000"}/assets/images/${chapter}/${language}/PAGE_01.png` }); }
      chapters.push({ chapter, languages, cover: `${process.env.VERCEL_URL ?? "http://localhost:3000"}/assets/images/${chapter}/en/PAGE_01.png` });
    }

    return chapters;
  })
  if (result.isOk()) {
    return res.status(200).json({ chapters: result.unwrap() });
  } else {
    return res.status(500).json({ error: String(result.unwrapErr()) });
  }
}
