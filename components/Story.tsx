"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import { pointer, lerp } from "@/lib/scrollStore";
import { IMAGES, PRODUCT } from "@/lib/site";

/* ---------- building blocks ---------- */

function Headline({ children }: { children: string }) {
  return (
    <h2 className="headline">
      {children.split(" ").map((word, i) => (
        <span className="word-mask" key={`${word}-${i}`}>
          <span className="word">{word}</span>
        </span>
      ))}
    </h2>
  );
}

/** Full-bleed photographic background with a scroll parallax + dark scrim. */
function ParallaxBg({ src, dim = 0.55 }: { src: string; dim?: number }) {
  return (
    <div className="pbg" aria-hidden="true">
      <div className="pbg__img" style={{ backgroundImage: `url(${src})` }} />
      <div className="pbg__scrim" style={{ opacity: dim }} />
    </div>
  );
}

function Scene({
  src,
  dim,
  align,
  children,
}: {
  src: string;
  dim?: number;
  align: "left" | "right" | "center";
  children: ReactNode;
}) {
  return (
    <section className={`scene scene--${align}`}>
      <ParallaxBg src={src} dim={dim} />
      <div className="scene__content parallax">{children}</div>
    </section>
  );
}

const FAQS = [
  {
    q: "Quelle est la matière exactement ?",
    a: "Une toile de coton 14 oz tissée serrée, teintée à l'indigo grand teint. Dense, elle tombe droit et se patine avec le temps.",
  },
  {
    q: "La coupe taille comment ?",
    a: "Volontairement baggy. Prenez votre taille habituelle pour un look ample, ou une taille en dessous pour un baggy plus contenu.",
  },
  {
    q: "On peut vraiment grimper avec ?",
    a: "Oui. Gusset d'entrejambe, renforts aux genoux et cordon de serrage aux chevilles : pensé pour la dalle comme pour le bitume.",
  },
  {
    q: "Livraison et retours ?",
    a: "Expédition sous 48 h en Europe, retours gratuits sous 30 jours. Chaque pièce est numérotée à la main.",
  },
];

/* ---------- main ---------- */

export default function Story() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState<string>("L");
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Headlines: mask-reveal word by word.
      gsap.utils.toArray<HTMLElement>(".headline").forEach((h) => {
        gsap.from(h.querySelectorAll(".word"), {
          yPercent: 120,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: h, start: "top 85%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".stagger").forEach((grid) => {
        gsap.from(grid.children, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: grid, start: "top 85%" },
        });
      });

      // Photographic backgrounds drift slower than the page → depth.
      gsap.utils.toArray<HTMLElement>(".pbg").forEach((pb) => {
        const img = pb.querySelector(".pbg__img");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -12 },
            {
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: pb,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });

      // Hero: the jean lifts, shrinks and turns from front to back as you scroll.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero.current!,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to(".jean", { yPercent: -14, scale: 0.9, ease: "none" }, 0)
        .to(".jean__face--front", { rotateY: 100, opacity: 0, ease: "none" }, 0)
        .fromTo(
          ".jean__face--back",
          { rotateY: -100, opacity: 0 },
          { rotateY: 0, opacity: 1, ease: "none" },
          0,
        );

      gsap.to(".scroll-bar__fill", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current!,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, root);

    // Pointer parallax tilt on the product (independent of GSAP transforms).
    let raf = 0;
    const cur = { x: 0, y: 0 };
    const loop = () => {
      cur.x = lerp(cur.x, pointer.x, 0.08);
      cur.y = lerp(cur.y, pointer.y, 0.08);
      if (tilt.current) {
        tilt.current.style.transform = `rotateY(${cur.x * 12}deg) rotateX(${
          cur.y * 8
        }deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
    };
  }, []);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) setSubscribed(true);
  };

  return (
    <div ref={root} className="story">
      {/* ===== Header ===== */}
      <header className="topbar">
        <Logo />
        <nav className="nav">
          <a href="#manifeste" data-cursor="link">Manifeste</a>
          <a href="#produit" data-cursor="link">Le pantalon</a>
          <a href="#faq" data-cursor="link">FAQ</a>
          <a href="#produit" className="nav__cta" data-cursor="link">Précommander</a>
        </nav>
        <div className="scroll-bar" aria-hidden="true">
          <div className="scroll-bar__fill" />
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section ref={hero} className="hero">
        <ParallaxBg src={IMAGES.heroBg} dim={0.62} />
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="eyebrow reveal">Collection 01 — Vertical City</p>
            <Headline>ULTRA BAGGY</Headline>
            <p className="lede reveal">
              Un pantalon bleu profond, ultra lourd, serrable aux chevilles.
              Conçu pour le bitume et la falaise.
            </p>
            <div className="hero-cta reveal">
              <a href="#produit" className="btn btn--solid" data-cursor="link">
                Précommander · {PRODUCT.price}
              </a>
              <a href="#manifeste" className="btn btn--ghost" data-cursor="link">
                Le manifeste
              </a>
            </div>
          </div>

          <div className="jean">
            <div ref={tilt} className="jean__tilt">
              <img
                className="jean__face jean__face--front"
                src={IMAGES.jeanFront}
                alt="Pantalon BLOC Monolith, face"
              />
              <img
                className="jean__face jean__face--back"
                src={IMAGES.jeanBack}
                alt="Pantalon BLOC Monolith, dos"
              />
            </div>
            <span className="jean__caption">Tournez-le · face / dos</span>
          </div>
        </div>
        <span className="scroll-hint" aria-hidden="true">scroll</span>
      </section>

      {/* ===== Cinematic photo scenes ===== */}
      <Scene src={IMAGES.range} dim={0.5} align="left">
        <span id="manifeste" className="anchor" />
        <p className="eyebrow reveal">Le poids comme signature</p>
        <Headline>ULTRA LOURD</Headline>
        <p className="lede reveal">
          14 oz de toile dense qui tombe droit, tient le mouvement et vieillit
          avec vous. Une matière qui a de la mémoire.
        </p>
      </Scene>

      <section className="split">
        <div className="split__media">
          <img src={IMAGES.jeanBack} alt="Cheville resserrée du pantalon BLOC" />
        </div>
        <div className="split__copy parallax">
          <p className="eyebrow reveal">Resserrable</p>
          <Headline>SERRÉ AUX CHEVILLES</Headline>
          <p className="lede reveal">
            Cordon de serrage intégré et anneau porte-matériel : ouvert en ville,
            verrouillé sur le mur. La cheville libre, jamais dans vos pieds.
          </p>
        </div>
      </section>

      <Scene src={IMAGES.summit} dim={0.5} align="right">
        <p className="eyebrow reveal">Un vêtement, deux terrains</p>
        <Headline>BITUME & FALAISE</Headline>
        <p className="lede reveal">
          Du trottoir à la voie : une seule pièce, deux mondes. Conçue pour
          grimper, faite pour traîner.
        </p>
      </Scene>

      {/* ===== Conventional content ===== */}
      <div className="content">
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                ULTRA BAGGY · ULTRA LOURD · SERRÉ AUX CHEVILLES · BITUME & FALAISE
                · ÉDITION LIMITÉE ·{" "}
              </span>
            ))}
          </div>
        </div>

        <section className="stats stagger">
          <div className="stat"><strong>14 oz</strong><span>Toile de coton</span></div>
          <div className="stat"><strong>5</strong><span>Poches utiles</span></div>
          <div className="stat"><strong>500</strong><span>Pièces numérotées</span></div>
          <div className="stat"><strong>∞</strong><span>Liberté de mouvement</span></div>
        </section>

        <section className="section">
          <header className="section__head">
            <p className="eyebrow reveal">Pensé dans le détail</p>
            <h3 className="section__title reveal">Construit pour grimper, taillé pour la ville</h3>
          </header>
          <div className="cards stagger">
            <article className="card" data-cursor="link">
              <span className="card__icon">⌁</span>
              <h4>Cordon de serrage</h4>
              <p>Ajustez la cheville d'un geste — ouvert en bas, verrouillé en haut.</p>
            </article>
            <article className="card" data-cursor="link">
              <span className="card__icon">◮</span>
              <h4>Gusset d'escalade</h4>
              <p>Entrejambe en losange pour une amplitude totale sur le mur.</p>
            </article>
            <article className="card" data-cursor="link">
              <span className="card__icon">▤</span>
              <h4>Renforts genoux</h4>
              <p>Double épaisseur là où ça frotte : dalle, bitume, bivouac.</p>
            </article>
          </div>
        </section>

        <section className="section">
          <header className="section__head">
            <p className="eyebrow reveal">Lookbook</p>
            <h3 className="section__title reveal">Le même pantalon, partout</h3>
          </header>
          <div className="lookbook stagger">
            <div className="shot" data-cursor="link" style={{ backgroundImage: `url(${IMAGES.rack})` }}><span>En boutique</span></div>
            <div className="shot" data-cursor="link" style={{ backgroundImage: `url(${IMAGES.summit})` }}><span>En montagne</span></div>
            <div className="shot" data-cursor="link" style={{ backgroundImage: `url(${IMAGES.heroBg})` }}><span>Sur le mur</span></div>
          </div>
        </section>

        {/* Buy module — uses the two product images */}
        <section id="produit" className="buy">
          <div className="buy__gallery">
            <img className="buy__img buy__img--main" src={IMAGES.jeanFront} alt="Pantalon BLOC Monolith, face" />
            <img className="buy__img buy__img--thumb" src={IMAGES.jeanBack} alt="Pantalon BLOC Monolith, dos" />
          </div>
          <div className="buy__panel reveal">
            <p className="eyebrow">BLOC — Collection 01</p>
            <h3 className="buy__name">{PRODUCT.name}</h3>
            <p className="buy__price">{PRODUCT.price}</p>
            <p className="buy__desc">
              Baggy, lourd, serrable aux chevilles. Une seule couleur, faite pour
              durer : {PRODUCT.colorway.toLowerCase()} indigo.
            </p>

            <div className="opt">
              <span className="opt__label">Couleur — {PRODUCT.colorway}</span>
              <span className="swatch" style={{ background: "#1d3a85" }} />
            </div>

            <div className="opt">
              <span className="opt__label">Taille</span>
              <div className="sizes">
                {PRODUCT.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size ${size === s ? "is-active" : ""}`}
                    onClick={() => setSize(s)}
                    data-cursor="link"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn--solid btn--full"
              data-cursor="link"
              onClick={() => setAdded(true)}
            >
              {added ? "Ajouté au panier ✓" : `Ajouter au panier — ${size}`}
            </button>
            <p className="buy__note">Précommande · expédition sous 48 h · retours gratuits 30 j</p>
          </div>
        </section>

        <section className="press stagger" aria-label="On parle de nous">
          <span>VERTICAL MAG</span>
          <span>BÉTON ZINE</span>
          <span>CRUX</span>
          <span>URBAN ASCENT</span>
          <span>GRÈS</span>
        </section>

        <section className="section">
          <div className="quotes stagger">
            <blockquote className="quote">
              <p>« Le seul pantalon que je garde du pied de voie au bar. »</p>
              <cite>— Naïma, ouvreuse</cite>
            </blockquote>
            <blockquote className="quote">
              <p>« Lourd comme il faut. Il tombe parfaitement et bouge avec moi. »</p>
              <cite>— Théo, coursier</cite>
            </blockquote>
          </div>
        </section>

        <section id="faq" className="section">
          <header className="section__head">
            <p className="eyebrow reveal">Questions fréquentes</p>
            <h3 className="section__title reveal">Tout savoir avant de grimper</h3>
          </header>
          <ul className="accordion">
            {FAQS.map((item, i) => (
              <li key={i} className={`acc ${openFaq === i ? "is-open" : ""}`}>
                <button
                  className="acc__head"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-cursor="link"
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="acc__sign">{openFaq === i ? "−" : "+"}</span>
                </button>
                <div className="acc__body"><p>{item.a}</p></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ===== Newsletter over photo ===== */}
      <section className="newsletter">
        <ParallaxBg src={IMAGES.dusk} dim={0.55} />
        <div className="newsletter__inner parallax">
          <h3 className="newsletter__title reveal">Entrez dans le BLOC</h3>
          <p className="reveal">
            Édition limitée à 500 pièces numérotées. Soyez prévenu au lancement.
          </p>
          {subscribed ? (
            <p className="newsletter__done reveal">
              Merci — on vous écrit dès l'ouverture des précommandes.
            </p>
          ) : (
            <form className="newsletter__form reveal" onSubmit={onSubscribe}>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Adresse e-mail"
              />
              <button className="btn btn--solid" type="submit" data-cursor="link">
                Rejoindre la liste
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>Vertical City Goods.<br />Bitume &amp; falaise depuis 2026.</p>
          </div>
          <div className="footer__cols">
            <div>
              <h5>Boutique</h5>
              <a href="#produit" data-cursor="link">Pantalon Monolith</a>
              <a href="#produit" data-cursor="link">Guide des tailles</a>
              <a href="#produit" data-cursor="link">Livraison</a>
            </div>
            <div>
              <h5>Marque</h5>
              <a href="#manifeste" data-cursor="link">Manifeste</a>
              <a href="#faq" data-cursor="link">FAQ</a>
              <a href="#produit" data-cursor="link">Durabilité</a>
            </div>
            <div>
              <h5>Suivre</h5>
              <a href="#" data-cursor="link">Instagram</a>
              <a href="#" data-cursor="link">TikTok</a>
              <a href="#" data-cursor="link">Newsletter</a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} BLOC</span>
          <span>Conçu pour grimper. Fait pour traîner.</span>
        </div>
      </footer>
    </div>
  );
}
