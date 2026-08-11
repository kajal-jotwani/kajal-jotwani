/** Structured data for crawlers — invisible to humans, and rendered on the
 *  server so it's in the HTML the first time a bot asks for it. */
export default function JsonLd({ schema }: { schema: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
