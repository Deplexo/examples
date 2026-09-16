import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact — Forma", description: "Start a conversation with the Forma team." };
export default function Contact() {
  const configured = process.env.CONTACT_EMAIL || "hello@example.com";
  const email = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(configured) ? configured : "hello@example.com";
  return <main className="contact-page container"><a className="brand" href="/">forma<span>.</span></a><div className="contact-card"><p className="eyebrow">A conversation starts here</p><h1>Tell us what<br />you’re working on.</h1><p>Good things start with a little context. Tell us about your team, your idea, and what you’d like to make possible.</p><a className="button button-primary" href={`mailto:${email}?subject=${encodeURIComponent("Let's talk about Forma")}`}>Write to {email} ↗</a><p className="contact-note">This opens your email application. This starter does not store messages or send email on your behalf.</p><a href="/">← Back to the website</a></div></main>;
}
