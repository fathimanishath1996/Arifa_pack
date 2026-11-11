import type { SiteContent } from "@/lib/website-types";

/** The current arifapack.com content, word for word. The CMS starts from this. */
export const DEFAULT_CONTENT: SiteContent = {
  settings: {
    brandName: "ARIFA PACK",
    logo: "/images/logo/logo-600-600.png",
    pageTitle: "ARIFA PACK",
    metaDescription: "Aluminium Food Containers, Plastic Containers, Disposable Cutlery",
  },

  hero: [
    {
      id: "slide-1",
      isVisible: true,
      title: "Sustainable\nPackaging\nSolutions",
      tagline: "Innovative eco-friendly solutions for the future.",
      subtext: "Reducing environmental impact without compromising quality.",
      image: "/images/slides/slider-mainbg-001.png",
      productsButtonLabel: "Our Products",
      contactButtonLabel: "Contact Us",
    },
    {
      id: "slide-2",
      isVisible: true,
      title: "Sustainable\nPackaging\nSolutions",
      tagline: "Innovative eco-friendly solutions for the future.",
      subtext: "Reducing environmental impact without compromising quality.",
      image: "/images/slides/slider-mainbg-005.png",
      productsButtonLabel: "Our Products",
      contactButtonLabel: "Contact Us",
    },
  ],

  products: [
    { id: "product-1", isVisible: true, name: "Aluminium Container", rating: 5, description: "Keep food fresh and secure with our eco-friendly aluminium food containers.", image: "/images/products/aluminium-container-250-250.png" },
    { id: "product-2", isVisible: true, name: "Aluminium Platter", rating: 4, description: "Serve in style with our sleek and durable aluminium platters — perfect for every occasion.", image: "/images/products/aluminium-platter-250-250.png" },
    { id: "product-3", isVisible: true, name: "Aluminium Pot", rating: 5, description: "Cook with confidence using our sturdy and heat-efficient aluminium pots.", image: "/images/products/aluminium-pot-250-250.png" },
    { id: "product-4", isVisible: true, name: "Aluminium Foil", rating: 4, description: "Seal in freshness and flavor with our premium aluminium food wrapping foil.", image: "/images/products/aluminium-foil-250-250.png" },
    { id: "product-5", isVisible: true, name: "Cling Film", rating: 5, description: "Keep food fresh and protected with our strong and flexible cling film.", image: "/images/products/clingfilm-250-250.png" },
    { id: "product-6", isVisible: true, name: "Microwave Products", rating: 4, description: "Heat, serve, and store with ease using our microwave-safe containers.", image: "/images/products/microwave-containers-250-250.png" },
    { id: "product-7", isVisible: true, name: "Cutlery Product", rating: 4, description: "Convenience in every scoop — plastic cutlery that serves.", image: "/images/products/cutlery.png" },
    { id: "product-8", isVisible: true, name: "Aluminium Tray", rating: 5, description: "Serving crowds with strength and style.", image: "/images/products/trays.png" },
  ],

  about: {
    productsHeading: "Our Products",
    companyName: "ARIFA PACKING & PACKAGING LLC",
    heading: "Innovative Packaging Solutions",
    intro: "specializes in high-quality disposable packaging solutions including aluminum containers, plastic containers, and disposable cutlery.",
    paragraphs: [
      "Our strong ethical foundation, consistent quality standards, and customer focus have positioned us as a leader in the global packaging industry. Our commitment to quality and innovation remains as sincere today as it was at the beginning.",
      "We believe sustainable growth comes through innovation in our dynamic world where change is constant. This approach keeps us relevant and at the forefront of our industry.",
      "Our diverse business sectors bring exciting challenges that require creative solutions, providing valuable insights that help us maintain our competitive edge.",
    ],
    image: "/images/hero/innovating.png",
    pillars: ["Quality Standards", "Innovation", "Sustainability"],
  },

  sustainability: {
    eyebrow: "Innovative Packaging Solutions",
    heading: "Sustainable materials for a greener tomorrow",
    statValue: "85%",
    statText: "of our packaging products use eco-friendly materials or sustainable manufacturing processes",
    features: [
      { id: "feature-1", isVisible: true, title: "Eco-Friendly Materials", text: "Our packaging solutions use biodegradable materials, recycled content, and sustainable alternatives to reduce environmental impact." },
      { id: "feature-2", isVisible: true, title: "Custom Packaging Design", text: "We create tailored packaging solutions that optimize material usage, enhance product protection, and showcase your brand identity." },
      { id: "feature-3", isVisible: true, title: "Quality Assurance", text: "Arifa Packing maintains strict quality control standards throughout production, ensuring consistent quality and reliability for every client." },
      { id: "feature-4", isVisible: true, title: "Global Distribution", text: "With our efficient logistics network, we deliver packaging solutions to businesses worldwide with prompt service and competitive rates." },
    ],
  },

  essentials: {
    heading: "Home Essentials Collection",
    categories: [
      { id: "category-1", isVisible: true, title: "Kitchen Storage", icon: "/images/icons/kitchen-storage-icon.png", items: ["Airtight containers for pantry organization", "Stackable design saves space", "BPA-free materials"] },
      { id: "category-2", isVisible: true, title: "Food Preparation", icon: "/images/icons/cleaning-icon.png", items: ["Cutting boards with juice grooves", "Mixing bowls with non-slip bases", "Measuring cups and spoons sets"] },
      { id: "category-3", isVisible: true, title: "Serving Ware", icon: "/images/icons/serving-icon.png", items: ["Elegant serving platters and bowls", "Dishwasher safe for easy cleaning", "Microwave and oven safe options"] },
      { id: "category-4", isVisible: true, title: "Eco-Friendly Solutions", icon: "/images/icons/eco-icon.png", items: ["Compostable food storage", "Reusable silicone covers", "Bamboo utensil sets"] },
    ],
  },

  services: {
    heading: "Our Services",
    intro: "Explore our specialized food container manufacturing solutions that combine functionality, safety, and sustainability — proudly produced in-house by Arifa Packing and Packaging LLC.",
    services: [
      {
        id: "service-1",
        isVisible: true,
        title: "Food Container Manufacturing",
        text: "Arifa Packing and Packaging LLC specializes in the production of durable, **food-grade containers**. designed for both hot and cold items. Manufactured in our own facility, our containers meet strict hygiene and quality standards, ensuring freshness, safety, and convenience. We offer a variety of shapes, sizes, and sealing options to suit restaurants, catering businesses, food distributors, and retail brands — all with the flexibility for custom branding and design.",
      },
      {
        id: "service-2",
        isVisible: true,
        title: "Custom Packaging Design & Branding",
        text: "We offer **custom-molded food containers** with branding and tailored design options to enhance your product presentation and consumer experience. Whether you're launching a new ready-to-eat meal line or packaging bulk dry goods, our team collaborates with you to create packaging that reflects your brand identity, complies with food safety standards, and improves shelf appeal. Choose from various shapes, colors, closures, and printing finishes.",
      },
    ],
    buttonLabel: "Explore All Services",
  },

  leadership: {
    eyebrow: "LEADERSHIP",
    heading: "Meet Our Executive Team",
    members: [
      { id: "member-1", isVisible: true, name: "Mr. Hamdhan Sulthanul Arifeen", role: "Director", photo: "/images/team/team-img02.jpg" },
      { id: "member-2", isVisible: true, name: "Mr. Harun Sultanul Arifeen", role: "Director", photo: "/images/team/team-img03.jpg" },
      { id: "member-3", isVisible: true, name: "Mr. Hanif Sulthanul Arifeen", role: "Director", photo: "/images/team/team-img04.jpg" },
    ],
  },

  contact: {
    eyebrow: "CONTACT US",
    heading: "Get In Touch",
    headOfficeAddress: "AL JURF INDUSTRIAL AREA 2, AJMAN-UAE",
    headOfficePhone: "06 7477061",
    headOfficeEmail: "info@arifagroup.com",
    divisionName: "ARIFA PACKING & PACKAGING LLC",
    divisionAddress: "AL JURF INDUSTRIAL AREA 2, AJMAN-UAE",
    divisionPhone: "06 7485384",
    divisionEmail: "info@arifapack.com",
    submitLabel: "Send Message",
  },
};
