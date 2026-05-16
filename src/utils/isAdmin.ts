/**
 * Проверка, является ли пользователь администратором.
 *
 * ADMIN_MAILS – это перечень email'ов через запятую в .env:
 * ADMIN_MAILS="admin1@example.com,admin2@example.com"
 *
 * Функция умеет принимать как строку (email),
 * так и объект session из next-auth (у которого есть user.email).
 */
export function isAdmin(
  input: string | { user?: { email?: string | null } } | null | undefined,
): boolean {
  const env = process.env.ADMIN_MAILS;
  if (!env) return false;

  const allowed = env
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  const email =
    typeof input === 'string' ? input : input?.user?.email ?? undefined;

  if (!email) return false;

  return allowed.includes(email);
}
