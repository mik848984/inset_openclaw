import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import User from '@/models/user';
import { hrService } from '@/services/api/HrService';
import hrSearch from '@/models/hrSearch';
import { ResumeHrScore } from '@/models/resumeHrScore';
import HrSearch from '@/models/hrSearch';
import { ObjectId } from 'bson';
import dbConnect from '@/lib/db';

export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();

    const { initialQuery, requestData } = (await req.json()) as any;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const query = await hrService.generateQueryTags(initialQuery, '');
    const hhParams = await hrService.getSearchParams(initialQuery, '');

    const hrSearchItem = await hrSearch.create({
      user: user.id,
      query,
      initialQuery,
      requestData: {
        ...requestData,
        params: { hh: hhParams },
      },
    });

    return NextResponse.json(hrSearchItem);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}

export async function GET(req: Request): Promise<Response> {
  await dbConnect();

  const { searchParams } = new URL(req.url!);

  const session = await auth();
  const user = await User.findOne({ email: session?.user?.email });

  if (searchParams.get('id')) {
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = page * limit;

    const filter = {
      isComplete: true,
      hrSearch: new ObjectId(searchParams.get('id')!),
    };

    const [totalCount, result] = await Promise.all([
      ResumeHrScore.countDocuments(filter),
      ResumeHrScore.find(filter)
        .sort({ score: -1 })
        .populate('resume', 'systemId params text')
        .skip(skip)
        .limit(limit + 1)
        .exec(),
    ]);

    const hasMore = result.length > limit;

    const dataToReturn = hasMore ? result.slice(0, limit) : result;

    return NextResponse.json({
      data: dataToReturn,
      hasMore: hasMore,
      nextPage: page + 1,
      totalCount,
    });
  }

  try {
    const hrSearchesWithCounts = await HrSearch.aggregate([
      { $match: { user: new ObjectId(user.id) } },
      {
        $lookup: {
          from: 'resumehrscores',
          localField: '_id',
          foreignField: 'hrSearch',
          as: 'resumeScores',
        },
      },
      {
        $addFields: {
          totalResumes: { $size: '$resumeScores' },
          completedResumes: {
            $size: {
              $filter: {
                input: '$resumeScores',
                as: 'score',
                cond: { $eq: ['$$score.isComplete', true] },
              },
            },
          },
        },
      },

      { $project: { resumeScores: 0 } },
    ]);

    return NextResponse.json(hrSearchesWithCounts);
  } catch (error) {
    console.error('Ошибка при получении HrSearch с счетчиками:', error);
    throw error;
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url!);

  const session = await auth();
  const user = await User.findOne({ email: session?.user?.email });

  await hrSearch.deleteOne({
    user: user.id,
    _id: new ObjectId(searchParams.get('id')!),
  });

  return NextResponse.json({});
}

export async function PATCH(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url!);
  const { isActive, status } = (await req.json()) as any;

  const session = await auth();
  const user = await User.findOne({ email: session?.user?.email });

  const updatedHrSearch = await HrSearch.findByIdAndUpdate(
    new ObjectId(searchParams.get('id')!),
    [{ $set: { isActive, status } }],
    { new: true, useFindAndModify: false },
  ).exec();

  return NextResponse.json(updatedHrSearch);
}
