import { siteConfig } from "@/lib/seo";

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    image: `${siteConfig.url}/og-image.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareAppJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "LifestyleApplication",
    image: `${siteConfig.url}/og-image.png`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: "31",
      highPrice: "169",
      offerCount: "3",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "31",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Romantic",
          price: "69",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Premium",
          price: "169",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      ],
    },
    description: siteConfig.description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
