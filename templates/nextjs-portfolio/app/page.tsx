type Project = {
  slug: string;
  name: string;
  category: string;
  year: string;
  artwork: "fieldnotes" | "forma" | "daybreak" | "monograph";
  summary: string;
  approach: string;
  details: string[];
};

type Writing = {
  slug: string;
  title: string;
  category: string;
  body: string[];
};

const profile = {
  name: "Alex Morgan",
  initials: "am",
  role: "Independent designer & developer",
  email: "hello@example.com",
  intro: "Thoughtful digital experiences, built with purpose. I bring a designer’s eye and a developer’s curiosity to the space between an idea and the real thing.",
  about: [
    "I’m Alex, a designer who likes to build. I care about the small details that make a website feel considered: the rhythm of a page, a useful interaction, and the way everything holds together on a small screen.",
    "My practice sits between visual identity and front-end development. I enjoy taking a project from its first sketch to a working experience—asking good questions and keeping the important things simple along the way.",
  ],
};

const projects: Project[] = [
  {
    slug: "fieldnotes",
    name: "Fieldnotes",
    category: "Editorial design · Development",
    year: "2026",
    artwork: "fieldnotes",
    summary: "A quieter home for good stories.",
    approach: "A self-initiated concept for an independent design publication. The goal was to give long-form writing room to breathe without losing the pleasure of discovery.",
    details: [
      "A flexible editorial grid puts the story first, with strong type and a restrained color palette that make each issue feel connected.",
      "The reading experience uses generous spacing, clear navigation, and a single-column layout on smaller screens. This is a sample project, not a commissioned client engagement.",
    ],
  },
  {
    slug: "forma",
    name: "Forma Studio",
    category: "Visual identity · Web design",
    year: "2026",
    artwork: "forma",
    summary: "An expressive identity with a simple foundation.",
    approach: "A concept identity for a small architecture studio, exploring how a single geometric form can become a flexible visual language.",
    details: [
      "A circle, a line, and a warm terracotta palette provide the building blocks. The website pairs those elements with direct typography and a project-led structure.",
      "The resulting artwork is created entirely with CSS, so it stays crisp at every size and requires no image downloads. This is an independent sample concept.",
    ],
  },
  {
    slug: "daybreak",
    name: "Daybreak",
    category: "Product design · Interface exploration",
    year: "2025",
    artwork: "daybreak",
    summary: "A little more focus. A little less noise.",
    approach: "A personal exploration of a calmer daily planning interface, built around choosing a few meaningful tasks rather than filling every available hour.",
    details: [
      "The concept separates today’s priorities from the rest of the backlog. Subtle hierarchy and familiar controls reduce the amount of interface a person has to learn.",
      "The preview is a visual study rather than a functioning task manager. A production version would need persistence, accessible interactions, and user research before release.",
    ],
  },
  {
    slug: "monograph",
    name: "Monograph",
    category: "Design systems · Typography",
    year: "2025",
    artwork: "monograph",
    summary: "A small system for a consistent whole.",
    approach: "A sample design system that explores how far a modest set of type styles, spacing rules, and components can carry a digital experience.",
    details: [
      "The foundation is intentionally small: a clear type scale, a consistent spacing rhythm, and a few well-defined interaction states.",
      "Components are treated as decisions with context, not just reusable boxes. This concept documents the reasons behind the rules so they can evolve with a real product.",
    ],
  },
];

const writing: Writing[] = [
  {
    slug: "room-to-breathe",
    title: "Give the important things room to breathe.",
    category: "On design",
    body: [
      "When a page feels busy, my first instinct is to remove a decision. Not necessarily a feature or a piece of information—sometimes it is enough to stop asking everything to speak at the same volume.",
      "Spacing helps, but hierarchy comes first. Decide what someone needs to understand, what they can do next, and what can wait. Then let the layout make those relationships visible. A quieter page should be easier to use, not merely emptier.",
    ],
  },
  {
    slug: "build-to-understand",
    title: "Build the thing to understand the thing.",
    category: "On making",
    body: [
      "A static design can explain an idea. A working prototype asks questions of it. What happens when the title is longer? When the connection is slow? When someone uses a keyboard instead of a mouse?",
      "Moving between design and code makes those questions part of the process. The useful feedback often comes from the smallest details: an awkward focus order, a button with an unclear label, or a layout that only works with perfect content. Building early creates room to fix them.",
    ],
  },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
    </svg>
  );
}

function ProjectArtwork({ kind }: { kind: Project["artwork"] }) {
  if (kind === "fieldnotes") {
    return <div className="project-art art-fieldnotes" aria-hidden="true"><div className="editorial-cover"><div className="cover-masthead">fieldnotes<span>VOL. 01 — 2026</span></div><div className="cover-type">Less,<br /><em>but</em><br />better.</div><div className="cover-footer">OBSERVATIONS ON A CONSIDERED LIFE<span>↗</span></div></div><span className="art-caption">An independent point of view.</span></div>;
  }
  if (kind === "forma") {
    return <div className="project-art art-forma" aria-hidden="true"><span className="forma-wordmark">forma<span>®</span></span><div className="forma-sculpture"><span /><span /><span /></div><div className="forma-footer"><span>SPACES FOR<br />A DIFFERENT EVERYDAY.</span><span>EST. 2026</span></div></div>;
  }
  if (kind === "daybreak") {
    return <div className="project-art art-daybreak" aria-hidden="true"><div className="planner"><div className="planner-top"><span className="planner-mark" />daybreak<span className="planner-avatar">A</span></div><div className="planner-content"><span className="planner-date">MONDAY, A FRESH START</span><p>Make room for<br />what matters.</p><div className="planner-task"><span className="task-check complete">✓</span><span>A little time outside</span><span>↗</span></div><div className="planner-task"><span className="task-check" /><span>Bring the new idea to life</span><span>↗</span></div><div className="planner-task"><span className="task-check" /><span>Leave space for something good</span><span>↗</span></div><div className="planner-bottom"><span>ONE THING AT A TIME.</span><span>01 / 03</span></div></div></div></div>;
  }
  return <div className="project-art art-monograph" aria-hidden="true"><div className="specimen-top"><span>MONOGRAPH™</span><span>A SYSTEM OF SIMPLE THINGS</span></div><div className="specimen-type">Aa<span>→</span></div><div className="specimen-grid"><span>01 / TYPE</span><span>02 / SPACE</span><span>03 / COLOR</span></div><div className="specimen-bottom"><span>Good systems.<br />Better possibilities.</span><div className="color-swatches"><i /><i /><i /><i /></div></div></div>;
}

export default function Portfolio() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="page-wrap">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label={`${profile.name}, home`}>{profile.name}<span className="wordmark-dot" /></a>
          <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#writing">Notes</a><a className="nav-contact" href="#contact">Let’s talk <Arrow diagonal /></a></nav>
        </header>

        <main id="main">
          <section id="top" className="hero" aria-labelledby="hero-title">
            <div className="hero-content">
              <p className="eyebrow"><span className="accent-dot" />{profile.role}</p>
              <h1 id="hero-title">Good ideas.<br />Made real<span className="accent-text">.</span></h1>
              <p className="hero-intro">{profile.intro}</p>
              <a className="text-link hero-link" href="#work">Explore selected work <span className="round-arrow"><Arrow /></span></a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <span className="art-coordinate coordinate-top">FIG. 01 / THE POSSIBILITIES</span>
              <div className="sculpture-shadow" /><div className="sculpture-disc disc-back" /><div className="sculpture-disc disc-front" /><div className="sculpture-orb" /><span className="sculpture-line" />
              <span className="art-coordinate coordinate-bottom">FORM MEETS FUNCTION.</span><span className="art-star">✳</span>
            </div>
            <div className="hero-footer"><p>Independent in spirit.<br className="mobile-break" /> Open to what’s next.</p><a href="#contact">Have something in mind? <Arrow diagonal /></a></div>
          </section>

          <section id="work" className="work-section section-block" aria-labelledby="work-title">
            <div className="section-heading"><div><p className="eyebrow section-number">01 / SELECTED WORK</p><h2 id="work-title">A few things<br />I’ve put into the world.</h2></div><p className="section-description">A collection of sample projects.<br />Different questions. Considered answers.</p></div>
            <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.slug} aria-labelledby={`${project.slug}-title`}>
              <ProjectArtwork kind={project.artwork} />
              <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
              <h3 id={`${project.slug}-title`}>{project.name}</h3><p className="project-summary">{project.summary}</p>
              <details id={`project-${project.slug}`} className="project-details"><summary><span>Explore the concept</span><span className="details-icon"><Arrow diagonal /></span></summary><div className="project-story"><span className="eyebrow">CONCEPT {String(index + 1).padStart(2, "0")}</span><p>{project.approach}</p>{project.details.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>
            </article>)}</div>
          </section>

          <section id="about" className="about-section section-block" aria-labelledby="about-title">
            <div className="about-identity"><p className="eyebrow section-number">02 / A LITTLE ABOUT ME</p><div className="identity-card" aria-hidden="true"><span className="identity-label">ALWAYS A WORK IN PROGRESS.</span><div className="identity-monogram">{profile.initials}<span>✳</span></div><div className="identity-footer"><span>DESIGNER.<br />DEVELOPER.<br />CURIOUS HUMAN.</span><span>↗</span></div></div></div>
            <div className="about-copy"><h2 id="about-title">A curious mind.<br />A hands-on approach.</h2>{profile.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="capabilities"><span>What I bring to the table</span><ul><li>Visual & web design</li><li>Front-end development</li><li>Design systems</li><li>Creative collaboration</li></ul></div><a className="text-link" href={`mailto:${profile.email}`}>A conversation is a good place to start <Arrow diagonal /></a></div>
          </section>

          <section id="writing" className="writing-section section-block" aria-labelledby="writing-title">
            <div className="section-heading"><div><p className="eyebrow section-number">03 / NOTES & OBSERVATIONS</p><h2 id="writing-title">Thinking out loud.</h2></div><p className="section-description">A few sample notes on designing,<br />building, and figuring things out.</p></div>
            <div className="writing-list">{writing.map((note, index) => <details id={`note-${note.slug}`} className="writing-note" key={note.slug}><summary><span className="note-number">0{index + 1}</span><span className="note-main"><span className="eyebrow">{note.category}</span><span className="note-title">{note.title}</span></span><span className="note-action"><span>Read note</span><Arrow diagonal /></span></summary><div className="note-body">{note.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>)}</div>
          </section>

          <section id="contact" className="contact-section" aria-labelledby="contact-title">
            <p className="eyebrow"><span className="accent-dot" />04 / NEXT, SOMETHING GOOD</p>
            <div className="contact-main"><h2 id="contact-title">Good things start<br />with a conversation<span>.</span></h2><a className="contact-arrow" href={`mailto:${profile.email}`} aria-label={`Email ${profile.name}`}><Arrow diagonal /></a></div>
            <div className="contact-bottom"><p>An idea, a question, or just a hello.<br />I’d like to hear it.</p><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal /></a></div>
          </section>
        </main>

        <footer className="site-footer"><div className="footer-line"><a className="wordmark" href="#top">{profile.name}<span className="wordmark-dot" /></a><span>Made with care. Built with Next.js.</span><a className="back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div><p className="sample-notice">Sample portfolio · Replace the profile, projects, notes, and email address with your own before publishing.</p></footer>
      </div>
    </>
  );
}
