import { NextResponse } from 'next/server';
import { ObjectId } from 'bson';

import { auth } from '@/auth';
import User from '@/models/user';
import { ResumeHrScore } from '@/models/resumeHrScore';
import dbConnect from '@/lib/db';
import { scoreResume } from '@/services/api/HR/ScoreResume';

export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();

    const { filterQuery, hrSearchId, scorePercentage } =
      (await req.json()) as any;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });
    const scoreDecimal = scorePercentage / 100;
    if (!user) {
      return new Response('Error', { status: 500 });
    }

    const highScores = await ResumeHrScore.find({
      hrSearch: new ObjectId(hrSearchId),
      score: { $gte: scoreDecimal },
    })
      .populate('resume')
      .sort('score')
      .exec();

    const bestResumes = await scoreResume.bestResumeEvalute(
      highScores,
      filterQuery,
    );

    return NextResponse.json(bestResumes.sort((a, b) => b.score - a.score));
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
