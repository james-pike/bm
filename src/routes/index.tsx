import { component$, useSignal, useVisibleTask$, $, useContext } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../i18n";

const heroSlides = [
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", labelKey: "hero.label.onthejob" as const },
  { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", labelKey: "hero.label.polos" as const },
  { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop", labelKey: "hero.label.hats" as const },
];


const teasers = [
  {
    slug: "jackets",
    category: "Jackets",
    tagKey: "teaser.jackets.tag" as const,
    titleKey: "teaser.jackets.title" as const,
    textKey: "teaser.jackets.text" as const,
    ctaKey: "teaser.jackets.cta" as const,
    imgs: [
      "/softshell/j7603 soft shell.png",
      "/softshell/l7603 ladies soft shell.png",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop",
    ],
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
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop",
    ],
  },
  {
    slug: "hoodies",
    category: "Hoodies",
    tagKey: "teaser.hoodies.tag" as const,
    titleKey: "teaser.hoodies.title" as const,
    textKey: "teaser.hoodies.text" as const,
    ctaKey: "teaser.hoodies.cta" as const,
    imgs: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=400&fit=crop",
    ],
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
      "/hat/30109107PS2_BACK.JPG",
    ],
    imgClass: "teaser-card__img--zoomed",
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
      <div class="teaser-card__image">
        {teaser.imgs.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={t(teaser.titleKey, locale.value)}
            width="600"
            height="400"
            class={`teaser-card__img ${imgIndex.value === i ? "active" : ""} ${(teaser as any).imgClass || ""}`}
          />
        ))}
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
  const activeSlide = useSignal(0);
  const touchStart = useSignal(0);
  const activeTeaser = useSignal(0);
  const onTouchStart = $((e: TouchEvent) => {
    touchStart.value = e.touches[0].clientX;
  });

  const onTouchEnd = $((e: TouchEvent) => {
    const diff = touchStart.value - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeSlide.value < heroSlides.length - 1) {
        activeSlide.value++;
      } else if (diff < 0 && activeSlide.value > 0) {
        activeSlide.value--;
      }
    }
  });

  return (
    <>
      {/* Hero */}
      <section class="hero dot-pattern dot-pattern--light">
        <div class="hero__bg" />
        <div class="hero__content">
          <div class="hero__text">
            <h1 class="hero__title">
              <span class="hero__title--accent">{t("hero.accent", locale.value)}</span> {t("hero.title.your", locale.value)}<br /><em>Carmichael</em> {t("hero.title.brand", locale.value)}
            </h1>
            <div class="hero__apparel-row">
              <p class="hero__subtitle-inline">{t("hero.subtitle", locale.value)}</p>
            </div>

            {/* Mobile carousel */}
            <div
              class="hero__carousel"
              onTouchStart$={onTouchStart}
              onTouchEnd$={onTouchEnd}
            >
              <div class="hero__carousel-viewport">
                {heroSlides.map((slide, i) => (
                  <div
                    key={slide.labelKey}
                    class={`hero__carousel-slide ${activeSlide.value === i ? "active" : ""}`}
                  >
                    <img src={slide.src} alt={t(slide.labelKey, locale.value)} width="600" height="400" />
                    <span class="hero__photo-label">{t(slide.labelKey, locale.value)}</span>
                  </div>
                ))}
              </div>
              <div class="hero__carousel-dots">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.labelKey}
                    class={`hero__carousel-dot ${activeSlide.value === i ? "active" : ""}`}
                    onClick$={() => (activeSlide.value = i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
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

          {/* Mobile: fade carousel */}
          <div class="teaser-carousel">
            <div class="teaser-carousel__viewport">
              {teasers.map((teaser, i) => (
                <div
                  key={teaser.slug}
                  class={`teaser-carousel__slide ${activeTeaser.value === i ? "active" : ""}`}
                >
                  <div class="featured-banner">
                    <div class="featured-banner__content">
                      <div class="featured-banner__tag">{t(teaser.tagKey, locale.value)}</div>
                      <h2 class="featured-banner__title">{t(teaser.titleKey, locale.value)}</h2>
                      <p class="featured-banner__text">{t(teaser.textKey, locale.value)}</p>
                      <div>
                        <a href={`/apparel/?category=${teaser.category}`} class="btn btn--primary">{t(teaser.ctaKey, locale.value)}</a>
                      </div>
                    </div>
                    <div class="featured-banner__image">
                      <img src={teaser.imgs[0]} alt={t(teaser.titleKey, locale.value)} width="700" height="500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div class="teaser-carousel__dots">
              {teasers.map((teaser, i) => (
                <button
                  key={teaser.slug}
                  class={`teaser-carousel__dot ${activeTeaser.value === i ? "active" : ""}`}
                  onClick$={() => (activeTeaser.value = i)}
                  aria-label={`Teaser ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Carmichael Engineering - Employee Apparel",
  meta: [
    {
      name: "description",
      content: "Official Carmichael Engineering employee apparel. Order branded polos, jackets, hats, and more.",
    },
  ],
};
