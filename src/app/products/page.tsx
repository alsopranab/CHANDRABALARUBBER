import { productGroups } from "@/lib/company";
import Link from "next/link";

const productImages = [
  { url: "https://commons.wikimedia.org/wiki/Special:FilePath/RSS%20rubber%20sheets%2003.jpg", alt: "Natural rubber ribbed smoked sheets" },
  { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Natural%20rubber%20drying%201.jpg", alt: "Natural rubber sheets drying" },
  { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Shredded%20tires.JPG", alt: "Rubber scrap material prepared for processing" },
  { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rubber%20plant.jpg", alt: "Rubber plant" },
  { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rubber%20Ingredient%20and%20Weigh-Up%20Room%20-%20DPLA%20-%208a292c3cf5e975244adcf4a179cc31b8.jpg", alt: "Rubber processing ingredients and chemicals" },
];

export default function Products() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Products & sourcing</span>
          <h1>Natural rubber and related industrial supplies.</h1>
          <p>Product specifications, lot condition, availability and commercial terms are confirmed for each business inquiry.</p>
        </div>
      </section>
      <section className="section section-cream">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Product categories</span>
            <h2>A focused range for B2B buyers.</h2>
            <p>We do not publish fixed public pricing. Request a quotation based on your grade, quantity, quality expectations and delivery destination.</p>
          </div>
          <div className="cards">
            {productGroups.map((p, i) => (
              <article className="product-card" key={p.title}>
                <div
                  className="product-image"
                  role="img"
                  aria-label={productImages[i]?.alt ?? p.title}
                  style={{ backgroundImage: `url("${productImages[i]?.url}")` }}
                />
                <div className="product-body">
                  <h3>{p.title}</h3>
                  <p>{p.detail}</p>
                  <div className="tags">{p.items.map(x => <span className="tag" key={x}>{x}</span>)}</div>
                  <div className="button-row"><Link className="inline-link" href="/contact">Enquire about this category →</Link></div>
                </div>
              </article>
            ))}
          </div>
          <p className="image-credit-note">Images: Wikimedia Commons contributors. Image licensing and attribution details are available on the respective file pages.</p>
        </div>
      </section>
    </>
  );
}