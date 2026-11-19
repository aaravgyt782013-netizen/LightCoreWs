import Link from "next/link";
import { PageBackground } from "@/components/site/Background";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { ArrowRight } from "@/components/ui/Icons";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <PageBackground />
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Logo size={80} />
        <p className="mt-8 text-[12px] font-medium uppercase tracking-[0.2em] text-brand-300">
          404 · Page Not Found
        </p>
        <h1 className="mt-3 font-display text-[36px] font-bold leading-none tracking-[0.06em] text-white sm:text-[52px]">
          <Wordmark />
        </h1>
        <p className="mt-2 text-[14px] font-medium text-brand-200/85">
          {site.tagline}
        </p>
        <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-zinc-400">
          We couldn&apos;t find the page you were looking for — it may have
          moved or the link might be mistyped.
        </p>
        <Link
          href="/"
          className="btn-primary btn-glow group relative mt-8 inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full px-6 text-[14px] font-semibold hover:-translate-y-0.5 active:scale-[0.985]"
        >
          <span className="relative z-10">Back to Home</span>
          <ArrowRight className="relative z-10 size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
        </Link>
      </main>
    </>
  );
}
