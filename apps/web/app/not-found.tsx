import Link from "next/link";
export default function NotFound() { return <main className="error-page"><span className="eyebrow">404</span><h1>This page is a blank draft.</h1><p>Let’s get you back to your writing.</p><Link className="button button-primary" href="/articles">Back to articles</Link></main>; }
