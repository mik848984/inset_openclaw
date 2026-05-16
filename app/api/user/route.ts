import { auth } from '@/auth';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import Subscription from '@/models/subscription';
import dbConnect from '@/lib/db';
import cron from 'node-cron';
import { tariffService } from '@/services/api/TariffService';
import { isAdmin } from '@/utils/isAdmin';
import { hrService } from '@/services/api/HrService';
import { scoreResume } from '@/services/api/HR/ScoreResume';

(global as any).cron = false;
(global as any).isProcessing = false;
(global as any).isProcessingEvalute = false;

export async function GET(): Promise<Response> {
  console.log('user');
  try {
    await dbConnect();

    if (!(global as any).cron) {
      (global as any).cron = true;
      console.log('Cron RUN!');

      await scoreResume.removeHrScores();

      cron.schedule('0 0 * * *', async () => {
        console.log('Запуск проверки подписок!');
        try {
          await tariffService.runCheckSubscriptions();
        } catch (e) {
          console.log(e);
        }
      });

      cron.schedule('* * * * *', async () => {
        if ((global as any).isProcessing) {
          await hrService.setFetchingCurrentHrSearch();
          return;
        }

        (global as any).isProcessing = true;

        try {
          await hrService.updateResumes();
        } catch (e) {
          (global as any).isProcessing = false;
        } finally {
          (global as any).isProcessing = false;
        }
      });

      cron.schedule('*/2 * * * *', async () => {
        if ((global as any).isProcessingEvalute) return;

        (global as any).isProcessingEvalute = true;

        try {
          await hrService.evaluteResumes();
        } catch (e) {
          (global as any).isProcessingEvalute = false;
        } finally {
          (global as any).isProcessingEvalute = false;
        }
      });

      // cron.schedule('*/2 * * * *', async () => {
      //   await scoreResume.removeHrScores();
      // });
    }

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    const subscription = await Subscription.findOne({ user: user.id });

    return NextResponse.json({
      name: user.name,
      image: user.image,
      modelsBalance: user.modelsBalance,
      webSearchBalance: user.webSearchBalance ?? 0,
      isAdmin: isAdmin(user.email),
      imageGenerationBalance: user.imageGenerationBalance,
      subscription: {
        grade: subscription?.grade || 'Free',
        startDate: subscription?.startDate || null,
        status: subscription?.status,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
