// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
	site: 'https://xt7dev.github.io',
	base: '/Docs-v2-Revamp/',
	integrations: [starlight({
		title: 'Polytoria 2.0 Documentation',
		pagination: false,
		lastUpdated: true,
		social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/polytoria/Docs-v2' }],
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
			Sidebar: './src/components/Sidebar.astro',
			Head: './src/components/Head.astro'
		},
	}), icon()],
});