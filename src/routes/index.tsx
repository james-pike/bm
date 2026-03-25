import { component$, useSignal, useVisibleTask$, useContext } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../i18n";


const teasers = [
  {
    slug: "all",
    category: "All",
    tagKey: "teaser.all.tag" as const,
    titleKey: "teaser.all.title" as const,
    textKey: "teaser.all.text" as const,
    ctaKey: "teaser.all.cta" as const,
    imgs: [
      "/hat/30109107PS2_FRONT.JPG",
      "/softshell/j7603-soft-shell.png",
    ],
    skewed: true,
  },
  {
    slug: "jackets",
    category: "Jackets",
    tagKey: "teaser.jackets.tag" as const,
    titleKey: "teaser.jackets.title" as const,
    textKey: "teaser.jackets.text" as const,
    ctaKey: "teaser.jackets.cta" as const,
    imgs: [
      "/softshell/j7603-soft-shell.png",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop",
    ],
    skewed: true,
  },
  {
    slug: "polos",
    category: "Polos",
    tagKey: "teaser.polos.tag" as const,
    titleKey: "teaser.polos.title" as const,
    textKey: "teaser.polos.text" as const,
    ctaKey: "teaser.polos.cta" as const,
    imgs: [
      "/golf/green.png",
      "/uapolo/womens-white.png",
    ],
    skewed: true,
  },
  {
    slug: "hats",
    category: "Hats",
    tagKey: "teaser.hats.tag" as const,
    titleKey: "teaser.hats.title" as const,
    textKey: "teaser.hats.text" as const,
    ctaKey: "teaser.hats.cta" as const,
    imgs: [
      "/hat/30109107PS2_FRONT.JPG",
      "/beanie/1.png",
    ],
    skewed: true,
  },
];


const TeaserCard = component$<{ t: typeof teasers[0] }>(({ t: teaser }) => {
  const locale = useContext(LocaleContext);
  const imgIndex = useSignal(0);
  const hovering = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => hovering.value);
    if (!hovering.value) {
      imgIndex.value = 0;
      return;
    }
    const interval = setInterval(() => {
      imgIndex.value = (imgIndex.value + 1) % teaser.imgs.length;
    }, 2000);
    cleanup(() => clearInterval(interval));
  });

  return (
    <a
      href={`/apparel/?category=${teaser.category}`}
      class="teaser-card"
      onMouseEnter$={() => (hovering.value = true)}
      onMouseLeave$={() => (hovering.value = false)}
    >
      <div class={`teaser-card__image ${(teaser as any).skewed ? "teaser-card__image--skewed" : ""}`}>
        {(teaser as any).skewed ? (
          teaser.imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={t(teaser.titleKey, locale.value)}
              width="600"
              height="400"
              loading="eager"
              decoding="async"
              class="teaser-card__skewed-img"
            />
          ))
        ) : (
          teaser.imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={t(teaser.titleKey, locale.value)}
              width="600"
              height="400"
              loading="eager"
              decoding="async"
              class={`teaser-card__img ${imgIndex.value === i ? "active" : ""} ${(teaser as any).imgClass || ""}`}
            />
          ))
        )}
      </div>
      <div class="teaser-card__dots" />
      <div class="teaser-card__body">
        <div class="featured-banner__tag">{t(teaser.tagKey, locale.value)}</div>
        <h3 class="teaser-card__title">{t(teaser.titleKey, locale.value)}</h3>
        <p class="teaser-card__text">{t(teaser.textKey, locale.value)}</p>
        <span class="btn btn--primary btn--sm">{t(teaser.ctaKey, locale.value)}</span>
      </div>
    </a>
  );
});

export default component$(() => {
  const locale = useContext(LocaleContext);

  return (
    <>
      {/* Hero */}
      <section class="hero dot-pattern dot-pattern--light">
        <div class="hero__bg" />
        <div class="hero__content">
          <div class="hero__text">
            {/* <div class="hero__badge">
              <span class="hero__badge-dot" />
              {t("hero.badge", locale.value)}
            </div> */}
            <h1 class="hero__title">
              <span class="hero__title--accent">{t("hero.accent", locale.value)}</span> <span class="hero__title--muted">{t("hero.title.your", locale.value)}</span><br /><em>Carmichael</em> {t("hero.title.brand", locale.value)}
            </h1>
            <div class="hero__apparel-row">
              <p class="hero__subtitle-inline">{t("hero.subtitle", locale.value)}</p>
            </div>
            <div class="hero__actions hero__actions--mobile">
              <a href="/apparel/" class="btn btn--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                {t("hero.browse", locale.value)}
              </a>
            </div>
          </div>
        </div>

        {/* Featured Teasers */}
        <div class="section section--teasers">
          <div class="teaser-grid">
            {teasers.map((teaser) => (
              <TeaserCard key={teaser.slug} t={teaser} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Carmichael Apparel - Employee Apparel",
  meta: [
    {
      name: "description",
      content: "Official Carmichael Apparel employee apparel. Order branded polos, jackets, hats, and more.",
    },
  ],
};
