import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Pranav.",
};

const contactLinks = [
  {
    label: "Email",
    value: "pranavkdhawale@gmail.com",
    href: "mailto:pranavkdhawale@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/Pv10101",
    href: "https://github.com/Pv10101",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/pranav-dhawale-b908b4322",
    href: "https://www.linkedin.com/in/pranav-dhawale-b908b4322",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Contact
      </h1>
      <p className="text-stone-300 leading-relaxed mb-10">
        Get in touch. The best way to reach me is by email. You can also find my
        work and writing through the links below.
      </p>
      <ul className="space-y-4">
        {contactLinks.map(({ label, value, href }) => (
          <li key={label} className="flex items-baseline gap-3">
            <span className="text-sm font-medium text-text-muted w-20 shrink-0">
              {label}
            </span>
            <a
              href={href}
              target={label === "Email" ? undefined : "_blank"}
              rel={label === "Email" ? undefined : "noopener noreferrer"}
              className="text-accent hover:text-accent-hover transition-colors break-all"
            >
              {value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
