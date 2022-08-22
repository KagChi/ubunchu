import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import { Result } from '@sapphire/result';
import { resolveObjects } from '../chapters';
import { minioClient } from '../../../utilities/minio';

type APIData = {
  chapter?: string | string[] | undefined;
  language?: string | string[] | undefined;
  chapterImages?: string[];
  cover?: string;
  error?: unknown;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<APIData>
) {
  const result = await Result.fromAsync(async () => {
    const { chapter, language } = req.query;
    const chapterImages = await resolveObjects(minioClient.listObjectsV2("assets", `ubunchu/${chapter}/${language}`, true));
    return { chapter, language: `${language}`, cover: `https://i.kagchi.my.id/ubunchu/${chapter}/${language}/PAGE_01.png`, chapterImages: chapterImages.map(item => `https://i.kagchi.my.id/${item.name}`) };
  });

  if (result.isOk()) {
    return res.status(200).json({ ...result.unwrap() });
  } else {
    return res.status(500).json({ error: String(result.unwrapErr()) });
  }
}