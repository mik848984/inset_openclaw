export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  try {
    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Этот генератор хештегов временно отключён на этом стенде.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
