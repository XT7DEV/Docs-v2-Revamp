// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import icon from 'astro-icon';
import starlightHeadingBadges from 'starlight-heading-badges'

// https://astro.build/config
export default defineConfig({
	integrations: [starlight({
		title: 'Polytoria 2.0 Documentation',
		pagination: false,
		lastUpdated: true,
		social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
		customCss: [
			'./src/styles/main.css',
		],
		sidebar: [
			{
				label: "Tutorials",
				collapsed: true,
				items: [
					{
						autogenerate: { directory: "tutorials" }
					}
				]
			},
			{
				label: "Contributing",
				collapsed: true,
				items: [
					{
						autogenerate: {
							directory: "contributing",
							collapsed: true,
						}
					}
				]
			},
			{
				label: 'API Reference',
				items: [
					{
						label: "Types",
						collapsed: true,
						items: [
							{
								autogenerate: {
									directory: 'api/types',
									collapsed: true
								}
							}
						]
					},
					{
						label: "Enums",
						collapsed: true,
						items: [
							{
								autogenerate: { directory: 'api/enums' }
							}
						]
					},
				],
			},
		],
		components: {
			Sidebar: './src/components/Sidebar.astro'
		},
		plugins: [
			starlightHeadingBadges(),
		],
	}), icon()],
});