"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import { scrollState } from "@/lib/scrollStore";

/** Splits a headline into masked, individually-animatable words. */
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

function Panel({
  align,
  children,
}: {
  align: "left" | "right" | "center";
  children: ReactNode;
}) {
  return (
    <section className={`panel panel--${align}`}>
      <div className="panel__inner parallax">{children}</div>
    </section>
  );
}

export default function Story() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1) Drive the global 0→1 progress that the 3D scene reads each frame.
      ScrollTrigger.create({
        trigger: root.current!,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        },
      });

      // 2) Mask-reveal every headline's words as its panel enters the viewport.
      gsap.utils.toArray<HTMLElement>(".headline").forEach((h) => {
        gsap.from(h.querySelectorAll(".word"), {
          yPercent: 120,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: h, start: "top 78%" },
        });
      });

      // 3) Fade + lift the supporting copy.
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
      });

      // 4) Parallax drift on each panel's content for depth against the 3D.
      gsap.utils.toArray<HTMLElement>(".parallax").forEach((el) => {
        gsap.to(el, {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest(".panel"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // Progress bar in the header.
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

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="story">
      <header className="topbar">
        <Logo />
        <nav className="nav">
          <a href="#manifeste" data-cursor="link">
            Manifeste
          </a>
          <a href="#produit" data-cursor="link">
            Le pantalon
          </a>
          <a href="#entrer" className="nav__cta" data-cursor="link">
            Entrer
          </a>
        </nav>
        <div className="scroll-bar" aria-hidden="true">
          <div className="scroll-bar__fill" />
        </div>
      </header>

      {/* HERO */}
      <Panel align="center">
        <p className="eyebrow reveal">Collection 01 — Vertical City</p>
        <Headline>ULTRA BAGGY</Headline>
        <p className="lede reveal">
          Un pantalon bleu profond, taillé pour le bitume et la falaise.
          Descendez pour le voir prendre vie.
        </p>
        <span className="scroll-hint reveal" aria-hidden="true">
          scroll
        </span>
      </Panel>

      {/* MANIFESTE / LOURD */}
      <Panel align="left">
        <span id="manifeste" className="anchor" />
        <p className="eyebrow reveal">Le poids comme signature</p>
        <Headline>ULTRA LOURD</Headline>
        <p className="lede reveal">
          14 oz de toile dense qui tombe droit, tient le mouvement et vieillit
          avec vous. Une matière qui a de la mémoire.
        </p>
      </Panel>

      {/* CHEVILLES */}
      <Panel align="right">
        <p className="eyebrow reveal">Resserrable</p>
        <Headline>SERRÉ AUX CHEVILLES</Headline>
        <p className="lede reveal">
          Cordon de serrage intégré : ouvert en ville, verrouillé sur le mur.
          La cheville libre, jamais dans vos pieds.
        </p>
      </Panel>

      {/* USAGE */}
      <Panel align="left">
        <span id="produit" className="anchor" />
        <p className="eyebrow reveal">Un vêtement, deux terrains</p>
        <Headline>BITUME & FALAISE</Headline>
        <ul className="specs reveal">
          <li>
            <strong>Bleu profond</strong> — teinture indigo grand teint
          </li>
          <li>
            <strong>Coupe baggy</strong> — liberté totale du genou
          </li>
          <li>
            <strong>Gusset d&apos;entrejambe</strong> — pensé pour grimper
          </li>
          <li>
            <strong>Renforts genoux</strong> — pour la dalle comme le trottoir
          </li>
        </ul>
      </Panel>

      {/* CTA */}
      <Panel align="center">
        <span id="entrer" className="anchor" />
        <Headline>ENTREZ DANS LE BLOC</Headline>
        <p className="lede reveal">
          Édition limitée. Numérotée à la main. Bientôt disponible.
        </p>
        <a className="cta reveal" href="#entrer" data-cursor="link">
          Rejoindre la liste
        </a>
        <footer className="footer reveal">
          © {new Date().getFullYear()} BLOC — Vertical City Goods
        </footer>
      </Panel>
    </div>
  );
}
