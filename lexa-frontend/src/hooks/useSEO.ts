import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export function useSEO({ title, description, canonicalUrl, ogImage }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title.includes("Lexa AI") ? title : `${title} | Lexa AI`;
    document.title = fullTitle;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", description);
      document.head.appendChild(metaDescription);
    }

    // 3. Update Canonical Tag
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      const fullCanonical = canonicalUrl.startsWith("http") ? canonicalUrl : `https://lexa-ai.com${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`;
      if (canonicalLink) {
        canonicalLink.setAttribute("href", fullCanonical);
      } else {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        canonicalLink.setAttribute("href", fullCanonical);
        document.head.appendChild(canonicalLink);
      }
    }

    // 4. Update Open Graph Tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      } else {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    };

    updateOGTag("og:title", fullTitle);
    updateOGTag("og:description", description);
    if (canonicalUrl) {
      updateOGTag("og:url", canonicalUrl.startsWith("http") ? canonicalUrl : `https://lexa-ai.com${canonicalUrl}`);
    }
    if (ogImage) {
      updateOGTag("og:image", ogImage.startsWith("http") ? ogImage : `https://lexa-ai.com${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`);
    }

    // 5. Update Twitter Tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      } else {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    };

    updateTwitterTag("twitter:title", fullTitle);
    updateTwitterTag("twitter:description", description);
    if (ogImage) {
      updateTwitterTag("twitter:image", ogImage.startsWith("http") ? ogImage : `https://lexa-ai.com${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`);
    }

  }, [title, description, canonicalUrl, ogImage]);
}
