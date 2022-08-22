import type { NextApiRequest, NextApiResponse } from 'next'
import { BucketStream, BucketItem } from 'minio';
import { Result } from '@sapphire/result';
import { minioClient } from '../../utilities/minio';

type APIData = {
  chapters?: { chapter: string; languages: { language: string; cover: string; }[]; cover: string; }[];
  error?: unknown;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<APIData>
) {
  const result = await Result.fromAsync(async () => {
    const chapterDirectories = await resolveObjects(minioClient.listObjectsV2("assets", "ubunchu", true));
    const chapters: { chapter: string; languages: { language: string; cover: string; }[]; cover: string; }[] = []

    for (const item of chapterDirectories) {
      const languages: { language: string; cover: string; }[] = [];
      for (const item of chapterDirectories) {
        if (!languages.find(x => x.language.includes(item.name.split("/")[2]))) languages.push({
          language: item.name.split("/")[2],
          cover: `https://i.kagchi.my.id/ubunchu/chapter_01/${item.name.split("/")[2]}/PAGE_01.png`
        });
      }

      if (!chapters.find(x => x.chapter.includes(item.name.split("/")[1]))) chapters.push({
        chapter: item.name.split("/")[1],
        cover: `https://i.kagchi.my.id/ubunchu/${item.name.split("/")[1]}/${item.name.split("/")[2]}/PAGE_01.png`,
        languages
      });
    }
    return chapters;
  })
  if (result.isOk()) {
    return res.status(200).json({ chapters: result.unwrap() });
  } else {
    return res.status(500).json({ error: String(result.unwrapErr()) });
  }
}

export async function resolveObjects(emitter: BucketStream<BucketItem>): Promise<BucketItem[]> {
  return new Promise((resolve, reject) => {
    const result: BucketItem[] = [];
      const handler = (item: BucketItem) =>
        result.push(item);
      emitter.on('data', handler);
      emitter.once('error', (err) => {
        emitter.off('data', handler);
        reject(err);
      });
      emitter.once('end', () => {
        emitter.off('data', handler);
        resolve(result);
      });
    });
}
