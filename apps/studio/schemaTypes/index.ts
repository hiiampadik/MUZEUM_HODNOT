import type { SchemaTypeDefinition } from 'sanity';

// Shared objects
import { coverImage } from './objects/coverImage';
import { richTextBasic } from './objects/richTextBasic';
import { richTextFull } from './objects/richTextFull';
import { namedLink } from './objects/namedLink';
import { materialFile } from './objects/materialFile';
import { roleWithPeople } from './objects/roleWithPeople';
import { socialLink } from './objects/socialLink';
import { galleryImage } from './objects/galleryImage';
import { person } from './objects/person';
import { mapPoint } from './objects/mapPoint';
import { heroTile } from './objects/heroTile';

// Page-builder blocks
import { textBlock } from './blocks/textBlock';
import { headingBlock } from './blocks/headingBlock';
import { decorativeImage } from './blocks/decorativeImage';
import { materialsBlock } from './blocks/materialsBlock';
import { tileBlock } from './blocks/tileBlock';
import { pageBuilder } from './blocks/pageBuilder';

// Documents
import { siteSettings } from './documents/siteSettings';
import { homePage } from './documents/homePage';
import { exhibition } from './documents/exhibition';
import { contactPage } from './documents/contactPage';
import { experientialEducation } from './documents/experientialEducation';
import { valueGenerator } from './documents/valueGenerator';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  siteSettings,
  homePage,
  exhibition,
  contactPage,
  experientialEducation,
  valueGenerator,

  // Page-builder blocks
  pageBuilder,
  textBlock,
  headingBlock,
  decorativeImage,
  tileBlock,
  materialsBlock,

  // Shared objects
  coverImage,
  richTextBasic,
  richTextFull,
  namedLink,
  materialFile,
  roleWithPeople,
  socialLink,
  galleryImage,
  person,
  mapPoint,
  heroTile,
];

/** Document types that are singletons — excluded from generic Studio lists. */
export const SINGLETONS = [
  'siteSettings',
  'homePage',
  'contactPage',
  'experientialEducation',
  'valueGenerator',
];
