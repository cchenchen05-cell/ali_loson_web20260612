import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["zh", "en"];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as string)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`./src/messages/${locale}.json`)).default,
  };
});