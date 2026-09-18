/**
 * SEO-Optimized Page Template
 *
 * This is an example of how to create a new page with proper SEO
 * Copy this template when creating new pages
 */

import { generateMetadata } from "@/lib/seo";

// SEO Metadata for this page
export const metadata = generateMetadata({
  title: "Page Title - Keep it 50-60 characters",
  description:
    "Write a compelling description between 150-160 characters that includes relevant keywords and accurately describes the page content.",
  keywords: [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    // Add 5-10 relevant keywords
  ],
  url: "/page-url", // The URL path of this page
  // image: '/custom-og-image.jpg', // Optional: custom OG image
});

export default function PageTemplate() {
  return (
    <main>
      {/* Always start with an H1 tag - only one per page */}
      <h1>Main Page Heading</h1>

      {/* Use semantic HTML */}
      <article>
        <h2>Section Heading</h2>
        <p>
          Content goes here. Write quality, original content that provides
          value. Include relevant keywords naturally without keyword stuffing.
        </p>

        <h3>Subsection Heading</h3>
        <p>More detailed content...</p>

        {/* Example: Optimized Image */}
        {/* 
        <Image
          src="/image.jpg"
          alt="Descriptive alt text for SEO and accessibility"
          width={800}
          height={600}
          loading="lazy"
        />
        */}

        {/* Example: Internal Links */}
        {/* 
        <Link href="/other-page">
          Link to related content
        </Link>
        */}
      </article>

      {/* Example: FAQ Section with Schema */}
      <section itemScope itemType="https://schema.org/FAQPage">
        <h2>Frequently Asked Questions</h2>

        <div
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
        >
          <h3 itemProp="name">Question 1?</h3>
          <div
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <p itemProp="text">Answer to question 1.</p>
          </div>
        </div>

        {/* Add more FAQ items */}
      </section>
    </main>
  );
}

/**
 * SEO BEST PRACTICES CHECKLIST FOR THIS PAGE:
 *
 * ✅ Metadata
 * - [ ] Title is 50-60 characters
 * - [ ] Description is 150-160 characters
 * - [ ] Relevant keywords added
 * - [ ] Custom OG image (if needed)
 *
 * ✅ Content
 * - [ ] One H1 tag at the top
 * - [ ] Proper heading hierarchy (H1 > H2 > H3)
 * - [ ] Alt text for all images
 * - [ ] Quality, original content (300+ words)
 * - [ ] Keywords used naturally
 * - [ ] Internal links to related pages
 * - [ ] External links to authority sites
 *
 * ✅ Technical
 * - [ ] Semantic HTML elements
 * - [ ] Schema markup (if applicable)
 * - [ ] Optimized images (WebP, Next/Image)
 * - [ ] Lazy loading for below-fold content
 * - [ ] Mobile responsive
 * - [ ] Fast loading speed
 *
 * ✅ User Experience
 * - [ ] Clear call-to-action
 * - [ ] Easy navigation
 * - [ ] Readable font sizes
 * - [ ] Good contrast ratios
 * - [ ] Accessible to screen readers
 */
