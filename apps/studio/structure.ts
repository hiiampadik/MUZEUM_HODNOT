import type { StructureResolver } from 'sanity/structure';
import {
  CogIcon,
  HomeIcon,
  EnvelopeIcon,
  RocketIcon,
  EarthGlobeIcon,
  CalendarIcon,
} from '@sanity/icons';
import { SINGLETONS } from './schemaTypes';

/**
 * Studio structure: singletons at the top (fixed document IDs), then exhibitions.
 * Singletons are excluded from the generic document lists to avoid duplicates.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Obsah')
    .items([
      S.listItem()
        .title('Domovská stránka')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),

      S.listItem()
        .title('Kontakt')
        .icon(EnvelopeIcon)
        .child(S.document().schemaType('contactPage').documentId('contactPage')),

      S.listItem()
        .title('Zážitkové vzdelávanie')
        .icon(RocketIcon)
        .child(
          S.document()
            .schemaType('experientialEducation')
            .documentId('experientialEducation'),
        ),

      S.listItem()
        .title('Generátor hodnôt')
        .icon(EarthGlobeIcon)
        .child(
          S.document()
            .schemaType('valueGenerator')
            .documentId('valueGenerator'),
        ),

      S.divider(),

      S.documentTypeListItem('exhibition').title('Výstavy').icon(CalendarIcon),

      S.divider(),

      S.listItem()
        .title('Nastavenia webu')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings'),
        ),

      // Anything not explicitly listed and not a singleton.
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id !== 'exhibition' && !SINGLETONS.includes(id as string);
      }),
    ]);
