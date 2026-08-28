import { defineQuery } from 'groq';

/* --- Fragments --------------------------------------------------------- */

const imageFields = /* groq */ `
  asset->{ _id, url, metadata { lqip, dimensions } },
  alt,
  hotspot,
  crop
`;

const coverFields = /* groq */ `cover{ ${imageFields} }`;

// Full-bleed top/bottom cover images (original size; rendered without scaling).
const edgeCoverFields = /* groq */ `
  topCover{ ${imageFields} },
  bottomCover{ ${imageFields} }
`;

const materialFields = /* groq */ `
  _key,
  title,
  emoji,
  "url": file.asset->url,
  "extension": file.asset->extension,
  "size": file.asset->size
`;

// Page-builder expansion. Tiles nest the same blocks (except tiles themselves).
const pageBuilderFields = /* groq */ `
  content[]{
    _key,
    _type,
    _type == "textBlock" => { content },
    _type == "headingBlock" => { text, level },
    _type == "decorativeImage" => { image{ ${imageFields} }, alt },
    _type == "materialsBlock" => { materials[]{ ${materialFields} } },
    _type == "tileBlock" => {
      content[]{
        _key,
        _type,
        _type == "textBlock" => { content },
        _type == "headingBlock" => { text, level },
        _type == "decorativeImage" => { image{ ${imageFields} }, alt },
        _type == "materialsBlock" => { materials[]{ ${materialFields} } },
      }
    },
  }
`;

/* --- Site settings ----------------------------------------------------- */

export const SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "siteSettings"][0]{
    donateLink,
    socialLinks[]{ _key, name, url, icon },
    partners
  }
`);

/* --- Home -------------------------------------------------------------- */

export const HOME_QUERY = defineQuery(/* groq */ `
  *[_id == "homePage"][0]{
    ${coverFields},
    ${edgeCoverFields},
    introTitle,
    introImage{ ${imageFields} },
    intro,
    "metaDescription": pt::text(intro)
  }
`);

// Covers for the fixed hero tiles (value generator + experiential education).
export const HOME_TILE_COVERS_QUERY = defineQuery(/* groq */ `
  {
    "valueGenerator": *[_id == "valueGenerator"][0].cover{ ${imageFields} },
    "experientialEducation": *[_id == "experientialEducation"][0].cover{ ${imageFields} }
  }
`);

/* --- Exhibitions ------------------------------------------------------- */

// Listing card fields (home + any listing). Ordered newest-ending first.
export const EXHIBITIONS_QUERY = defineQuery(/* groq */ `
  *[_type == "exhibition"] | order(endDate desc){
    _id,
    title,
    "slug": slug.current,
    place,
    openingDate,
    startDate,
    endDate,
    canOpenDetail,
    summary,
    roles[]{ _key, role, people },
    ${coverFields}
  }
`);

export const EXHIBITION_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "exhibition" && defined(slug.current) && canOpenDetail == true]{
    "slug": slug.current
  }
`);

// Exhibitions for the sitemap (with last-modified timestamps).
export const EXHIBITION_SITEMAP_QUERY = defineQuery(/* groq */ `
  *[_type == "exhibition" && defined(slug.current) && canOpenDetail == true]{
    "slug": slug.current,
    _updatedAt
  }
`);

export const EXHIBITION_QUERY = defineQuery(/* groq */ `
  *[_type == "exhibition" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    place,
    openingDate,
    startDate,
    endDate,
    canOpenDetail,
    foreignLanguage,
    roles[]{ _key, role, people },
    ${coverFields},
    ${edgeCoverFields},
    gallery[]{ ${imageFields}, photographer },
    abstract,
    materials[]{ ${materialFields} },
    links[]{ _key, label, emoji, href },
    contributors[]{ _key, role, people },
    "metaDescription": pt::text(abstract)
  }
`);

/* --- Contact ----------------------------------------------------------- */

export const CONTACT_QUERY = defineQuery(/* groq */ `
  *[_id == "contactPage"][0]{
    ${coverFields},
    ${edgeCoverFields},
    phone,
    email,
    address,
    administrativeInfo,
    people[]{
      _key,
      name,
      position,
      image{ ${imageFields} }
    }
  }
`);

/* --- Experiential education -------------------------------------------- */

export const EXPERIENTIAL_EDUCATION_QUERY = defineQuery(/* groq */ `
  *[_id == "experientialEducation"][0]{
    ${coverFields},
    ${edgeCoverFields},
    ${pageBuilderFields}
  }
`);

/* --- Value generator --------------------------------------------------- */

export const VALUE_GENERATOR_QUERY = defineQuery(/* groq */ `
  *[_id == "valueGenerator"][0]{
    ${coverFields},
    ${edgeCoverFields},
    ${pageBuilderFields},
    mapPoints[]{
      _key,
      title,
      location,
      image{ ${imageFields} },
      text,
      link
    }
  }
`);
