import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/common/error-boundary";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col min-h-screen">
        <Navbar locale={locale} messages={messages} />
        <main className="flex-1 pt-16">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer locale={locale} messages={messages} />
      </div>
    </NextIntlClientProvider>
  );
}