import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'js-yaml';
import { FAIcon, IconMetadata, FAStyle } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FontAwesomeLoader {
  private iconsMetadata: IconMetadata | null = null;
  private faPath: string | null = null;

  constructor() {
    this.findFontAwesomePath();
  }

  private findFontAwesomePath(): void {
    try {
      // Construct path manually for ES modules
      const projectRoot = process.cwd();
      this.faPath = join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-pro');
      
      // Verify the path exists by checking for package.json
      const packagePath = join(this.faPath, 'package.json');
      try {
        readFileSync(packagePath, 'utf8');
      } catch {
        throw new Error('Font Awesome Pro not found. Make sure it is installed with your .npmrc token.');
      }
    } catch (error) {
      throw new Error('Font Awesome Pro not found. Make sure it is installed with your .npmrc token.');
    }
  }

  private loadMetadata(): IconMetadata {
    if (this.iconsMetadata) {
      return this.iconsMetadata;
    }

    if (!this.faPath) {
      throw new Error('Font Awesome path not initialized');
    }

    try {
      const metadataPath = join(this.faPath, 'metadata', 'icons.yml');
      const yamlContent = readFileSync(metadataPath, 'utf8');
      const metadata = load(yamlContent) as IconMetadata;
      this.iconsMetadata = metadata;
      return metadata;
    } catch (error) {
      throw new Error(`Failed to load Font Awesome metadata: ${error}`);
    }
  }

  private loadSvg(name: string, style: FAStyle): string | null {
    if (!this.faPath) {
      throw new Error('Font Awesome path not initialized');
    }

    try {
      const svgPath = join(this.faPath, 'svgs', style, `${name}.svg`);
      return readFileSync(svgPath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  public getAllIcons(): FAIcon[] {
    const metadata = this.loadMetadata();
    const icons: FAIcon[] = [];

    for (const [name, iconData] of Object.entries(metadata)) {
      for (const style of iconData.styles) {
        icons.push({
          name,
          style,
          label: iconData.label,
          search: iconData.search,
          unicode: iconData.unicode
        });
      }
    }

    return icons;
  }

  public getIcon(name: string, style: FAStyle): FAIcon | null {
    const metadata = this.loadMetadata();
    const iconData = metadata[name];

    if (!iconData || !iconData.styles.includes(style)) {
      return null;
    }

    const svg = this.loadSvg(name, style);

    return {
      name,
      style,
      label: iconData.label,
      search: iconData.search,
      unicode: iconData.unicode,
      svg: svg || undefined
    };
  }

  public searchIcons(query: string): FAIcon[] {
    const allIcons = this.getAllIcons();
    
    if (!query.trim()) {
      return allIcons.slice(0, 50); // Return first 50 icons if no query
    }

    const normalizedQuery = query.toLowerCase();
    
    return allIcons.filter(icon => {
      // Search in name
      if (icon.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in label
      if (icon.label && icon.label.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in terms
      if (icon.search?.terms) {
        return icon.search.terms.some(term => 
          term.toLowerCase().includes(normalizedQuery)
        );
      }
      
      return false;
    }).slice(0, 50); // Limit results
  }
}

export const faLoader = new FontAwesomeLoader();