const features = [
  { number: "01", title: "Clarity comes first.", text: "A shared view of the work ahead. Give every idea a place, every project a direction, and every day a little more focus.", icon: "focus" },
  { number: "02", title: "Progress, without the noise.", text: "Keep the next step close. A considered workspace helps the important things stand out, so the small things don’t take over.", icon: "progress" },
  { number: "03", title: "Room to find your rhythm.", text: "Good work doesn’t happen in one straight line. Leave space for exploration, thoughtful decisions, and a different way forward.", icon: "rhythm" },
];

const questions = [
  { question: "What is Forma?", answer: "Forma is a fictional product brand used in this open-source website starter. The site gives you a complete foundation for presenting your own product, studio, or new idea." },
  { question: "Does the workspace preview save my work?", answer: "The workspace is an illustrative product preview. It shows how you could present your product, without collecting information or connecting to a backend." },
  { question: "Can I make this website my own?", answer: "Yes. Replace the copy, colors, product preview, and contact information with your own. The source is available under the MIT license, including for commercial projects." },
  { question: "How can I get in touch?", answer: "Use the contact page to send an email. If you’re making this starter your own, update the example email address before sharing your site." },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Mark() {
  return <svg className="brand-mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v26M3 16h26M6.8 6.8l18.4 18.4M6.8 25.2 25.2 6.8" stroke="currentColor" strokeWidth="4" /></svg>;
}

function FeatureIcon({ name }: { name: string }) {
  return <svg width="25" height="25" viewBox="0 0 32 32" fill="none" aria-hidden="true">{name === "focus" ? <><rect x="5" y="5" width="22" height="22" rx="5" stroke="currentColor" strokeWidth="1.5" /><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5" /></> : name === "progress" ? <><path d="m5 23 8-8 6 4 8-12M20 7h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></> : <><path d="M5 16c4-15 7 15 11 0S23 31 27 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M5 25h22M5 7h22" stroke="currentColor" strokeOpacity=".3" strokeWidth="1.5" /></>}</svg>;
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Illustrative project workspace">
      <aside className="preview-sidebar" aria-hidden="true">
        <div className="preview-brand"><Mark /><span>Forma</span></div>
        <div className="workspace-name"><span>S</span> Studio workspace <span>⌄</span></div>
        <div className="preview-menu"><span>⌕ <span>Search anything</span><small>⌘ K</small></span><span>▧ <span>Overview</span></span><span className="selected">▦ <span>Projects</span><i /></span><span>◷ <span>My focus</span></span></div>
        <div className="preview-project-label">YOUR PROJECTS <span>+</span></div>
        <div className="preview-project"><i /> Website refresh</div>
        <div className="preview-project"><i /> Brand exploration</div>
        <div className="preview-sidebar-foot"><span>AM</span><div>Alex Morgan<small>Personal workspace</small></div></div>
      </aside>
      <div className="preview-main">
        <div className="preview-topbar"><span>Projects <span>/</span> Website refresh</span><span className="preview-demo-label">Example workspace</span></div>
        <div className="preview-title"><div><span className="preview-kicker">A FRESH PERSPECTIVE</span><h3>Website refresh <span>↗</span></h3><p>A little more clarity. A lot more possibility.</p></div><div className="preview-avatar" aria-hidden="true">AM</div></div>
        <div className="preview-viewbar"><div><span className="active-view">▦ Board</span><span>☷ List</span><span>◷ Timeline</span></div><span className="preview-view-note">A place for the next step</span></div>
        <div className="preview-board">
          <div className="preview-column"><div className="column-heading"><i /> To explore <span>02</span></div><div className="task-card"><span className="task-tag tag-sage">DISCOVERY</span><h4>Find the story worth telling</h4><p>What do we want people to feel?</p><div className="task-foot"><span>≡ &nbsp; 2 notes</span><span className="mini-avatar">AM</span></div></div><div className="task-card"><span className="task-tag tag-neutral">DIRECTION</span><h4>Collect a little inspiration</h4><div className="color-chips" aria-hidden="true"><i /><i /><i /><i /></div><div className="task-foot"><span>↗ &nbsp; Moodboard</span><span className="mini-avatar">AM</span></div></div></div>
          <div className="preview-column"><div className="column-heading"><i /> Taking shape <span>01</span></div><div className="task-card task-featured"><span className="task-tag tag-lime">DESIGN</span><h4>Make the first impression count</h4><div className="task-art" aria-hidden="true"><span>Good things<br />take shape.</span><i /></div><div className="task-foot"><span>◷ &nbsp; In focus</span><span className="mini-avatar">AM</span></div></div></div>
          <div className="preview-column"><div className="column-heading"><i /> Ready to share <span>01</span></div><div className="task-card"><span className="task-tag tag-sage">FOUNDATION</span><h4>Give the project a clear purpose</h4><p>One shared direction to build on.</p><div className="task-foot"><span className="task-done">✓ &nbsp; Complete</span><span className="mini-avatar">AM</span></div></div><div className="preview-note"><span>✳</span><p>A little space<br />for what comes next.</p></div></div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header container"><a className="brand" href="/" aria-label="Forma home"><Mark /> Forma</a><nav aria-label="Main navigation"><a href="#features">Features</a><a href="#workflow">Our approach</a><a href="#faq">FAQ</a></nav><a className="button button-small button-outline" href="/contact">Let’s talk <Arrow diagonal /></a></header>
      <main id="main-content">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy"><span className="eyebrow"><i /> A LITTLE LESS FRICTION</span><h1 id="hero-title">Make room<br />for <span>great work.</span></h1><p>Less scattered thinking. More meaningful progress.<br className="desktop-break" /> A considered home for your next big idea.</p><div className="hero-actions"><a href="/contact" className="button button-primary">Let’s make something <Arrow diagonal /></a><a href="#features" className="text-link">Explore Forma <Arrow /></a></div><div className="hero-footnote"><span>THOUGHTFULLY SIMPLE.</span><span>OPEN TO POSSIBILITY.</span></div></div>
          <div className="hero-art" aria-hidden="true"><div className="art-guide guide-horizontal" /><div className="art-guide guide-vertical" /><span className="art-coordinate coordinate-top">FIG. 01 / FIND YOUR FORM</span><div className="orbital-sculpture"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="orbit orbit-four" /><span>f</span></div><span className="art-coordinate coordinate-bottom">A LITTLE SPACE CHANGES EVERYTHING.</span><span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span></div>
        </section>
        <section className="product-section container" aria-labelledby="product-title"><div className="section-heading product-heading"><div><span className="eyebrow">FROM THE BIG PICTURE TO THE NEXT STEP</span><h2 id="product-title">Everything has its place.</h2></div><p>A simple view of what matters.<br />Room to see where you’re going.</p></div><ProductPreview /><p className="preview-caption"><span className="caption-dot" /> An illustrative workspace. Imagine your own product here.</p></section>
        <section className="features-section container" id="features" aria-labelledby="features-title"><div className="section-heading"><div><span className="eyebrow">LESS, BUT BETTER</span><h2 id="features-title">A little more intentional.<br />A lot more possible.</h2></div><p>We believe the best tools create space<br className="desktop-break" /> for the people using them.</p></div><div className="feature-grid">{features.map((feature) => <article className="feature" key={feature.number}><div className="feature-top"><span>{feature.number}</span><FeatureIcon name={feature.icon} /></div><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>
        <section className="approach-section" id="workflow" aria-labelledby="approach-title"><div className="container approach-grid"><div className="approach-copy"><span className="eyebrow">A GOOD WAY TO BEGIN</span><h2 id="approach-title">Great work starts<br />with a little space.</h2><p>No perfect process required. Just a clear intention, a place to begin, and the freedom to find your way.</p><a href="/contact" className="text-link">Start a conversation <Arrow diagonal /></a><div className="approach-flower" aria-hidden="true"><Mark /></div></div><ol className="workflow"><li><span>01</span><div><h3>Start with what matters.</h3><p>Give your idea a clear purpose. A simple shared direction is a better starting point than a complicated plan.</p></div><Arrow diagonal /></li><li><span>02</span><div><h3>Find your next step.</h3><p>Bring the work into focus. Break a big possibility into small, meaningful things you can move forward.</p></div><Arrow diagonal /></li><li><span>03</span><div><h3>Make it your own.</h3><p>Learn as you go. Keep what works, rethink what doesn’t, and leave a little room for the unexpected.</p></div><Arrow diagonal /></li></ol></div></section>
        <section className="faq-section container" id="faq" aria-labelledby="faq-title"><div><span className="eyebrow">A FEW MORE DETAILS</span><h2 id="faq-title">Glad you asked.</h2><p>Something else on your mind?<br /><a href="/contact">We’d love to hear it. <Arrow diagonal /></a></p></div><div className="faq-list">{questions.map((item) => <details key={item.question}><summary>{item.question}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>
        <section className="contact-section container" aria-labelledby="contact-title"><div className="contact-banner"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2 id="contact-title">Good things<br />take shape together.</h2><a href="/contact" className="button button-dark">Tell us what’s on your mind <Arrow diagonal /></a><div className="contact-rings" aria-hidden="true"><i /><i /><i /></div><span className="contact-note">A FRESH START. A LITTLE MORE POSSIBILITY.</span></div></section>
      </main>
      <footer className="site-footer container"><div className="footer-top"><a className="brand" href="/" aria-label="Forma home"><Mark /> Forma</a><p>Built for what comes next.</p><a className="text-link" href="/contact">Say hello <Arrow diagonal /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Forma</span><nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#faq">FAQ</a><a href="https://github.com/Deplexo/examples/tree/main/templates/nextjs-website" target="_blank" rel="noopener noreferrer">Source <Arrow diagonal /></a></nav><a href="#main-content" className="back-to-top">Back to top ↑</a></div></footer>
    </>
  );
}
