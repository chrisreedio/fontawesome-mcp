import { z } from 'zod';
import { faLoader } from '../fa/loader.js';
import { FAStyle } from '../fa/types.js';

const GetIconSchema = z.object({
    name: z.string().describe('The icon name (e.g., "home", "user")'),
    style: z.enum(['solid', 'regular', 'light', 'thin', 'duotone', 'brands']).describe('The icon style')
});

type GetIconParams = z.infer<typeof GetIconSchema>;

export function getIcon(params: GetIconParams) {
    const { name, style } = GetIconSchema.parse(params);

    const icon = faLoader.getIcon(name, style as FAStyle);

    if (!icon) {
        return `Icon "${name}" not found in style "${style}"`;
    }

    return icon;
}

export const getIconMethod = {
    name: 'getIcon',
    description: 'Get a specific Font Awesome Pro icon with SVG content',
    inputSchema: GetIconSchema,
    handler: getIcon as unknown as (params: GetIconParams) => any
};