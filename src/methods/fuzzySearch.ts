import { z } from 'zod';
import Fuse from 'fuse.js';
import { faLoader } from '../fa/loader.js';
import { FAIcon } from '../fa/types.js';

const FuzzySearchSchema = z.object({
  query: z.string().describe('Search query for Font Awesome icons'),
  limit: z.number().optional().default(20).describe('Maximum number of results to return'),
  style: z.enum(['solid', 'regular', 'light', 'thin', 'duotone', 'brands']).optional().describe('Filter by icon style')
});

type FuzzySearchParams = z.infer<typeof FuzzySearchSchema>;

let fuseInstance: Fuse<FAIcon> | null = null;

function getFuseInstance(): Fuse<FAIcon> {
  if (!fuseInstance) {
    const allIcons = faLoader.getAllIcons();
    
    const fuseOptions = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'label', weight: 0.3 },
        { name: 'search.terms', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    };
    
    fuseInstance = new Fuse(allIcons, fuseOptions);
  }
  
  return fuseInstance;
}

export function fuzzySearch(params: FuzzySearchParams) {
  const { query, limit, style } = FuzzySearchSchema.parse(params);
  
  if (!query.trim()) {
    let icons = faLoader.getAllIcons();
    
    if (style) {
      icons = icons.filter(icon => icon.style === style);
    }
    
    return icons.slice(0, limit);
  }
  
  const fuse = getFuseInstance();
  const results = fuse.search(query, { limit: limit * 2 }); // Get more results to filter by style
  
  let filteredResults = results.map(result => result.item);
  
  if (style) {
    filteredResults = filteredResults.filter(icon => icon.style === style);
  }
  
  return filteredResults.slice(0, limit);
}

export const fuzzySearchMethod = {
  name: 'fuzzySearch',
  description: 'Search Font Awesome Pro icons using fuzzy matching',
  inputSchema: FuzzySearchSchema,
  handler: fuzzySearch
};