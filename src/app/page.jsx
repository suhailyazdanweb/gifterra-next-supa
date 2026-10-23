import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f8fc] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Gifterra home">
          <Image
            src="/Gifterra-logo-svg.svg"
            alt="Gifterra"
            className="h-12 w-auto"
            width={180}
            height={48}
          />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/auth"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Login
          </Link>
          <Link
            href="/auth?mode=sign-up"
            className="rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10">
          <p className="inline-flex rounded-full border border-cyan-100 bg-white px-4 py-2 text-sm font-medium text-cyan-800 shadow-sm">
            A little joy, thoughtfully wrapped
          </p>
          <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Make every moment feel{" "}
            <span className="text-cyan-700">a little more special.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Find thoughtful gifts for birthdays, weddings, celebrations, and
            all the lovely moments in between.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/auth?mode=sign-up"
              className="rounded-full bg-cyan-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-cyan-900/10 transition hover:bg-cyan-700"
            >
              Create your account
            </Link>
            <Link
              href="/auth"
              className="rounded-full border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800"
            >
              I already have an account
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
            <span>Gifts for every occasion</span>
            <span>Personal and thoughtful</span>
            <span>Easy online shopping</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-[48px] bg-gradient-to-br from-cyan-100 via-violet-100 to-amber-100 opacity-80 blur-2xl" />
          <div className="relative rounded-[32px] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Made for your moments
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Find their kind of gift
                </h2>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">
                ✨
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-[#fff4ea] p-5">
                <span className="text-4xl" aria-hidden="true">🎂</span>
                <p className="mt-7 text-sm font-semibold text-slate-900">
                  Birthday surprises
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Make their day brighter
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-[#f1edff] p-5">
                <span className="text-4xl" aria-hidden="true">💍</span>
                <p className="mt-7 text-sm font-semibold text-slate-900">
                  Wedding keepsakes
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Celebrate a new beginning
                </p>
              </div>
              <div className="rounded-3xl bg-[#eaf9f7] p-5">
                <span className="text-4xl" aria-hidden="true">☕</span>
                <p className="mt-7 text-sm font-semibold text-slate-900">
                  Little everyday joys
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Thoughtful, useful, lovely
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-[#fff7df] p-5">
                <span className="text-4xl" aria-hidden="true">🎁</span>
                <p className="mt-7 text-sm font-semibold text-slate-900">
                  Curated gift packs
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  A little something for everyone
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
                🎀
              </span>
              <div>
                <p className="text-sm font-semibold">Your next great gift</p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Start exploring the Gifterra collection
                </p>
              </div>
              <span className="ml-auto text-xl text-cyan-300" aria-hidden="true">
                →
              </span>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white/70 px-5 py-6 text-center text-sm text-slate-500">
        Thoughtful gifting starts here.
      </footer>
    </main>
  );
}
