import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Overview',
      collapsible: false,
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Getting started',
      collapsible: false,
      items: [
        'getting-started',
        'getting-started/prerequisites',
        'getting-started/making-your-first-api-call',
        'getting-started/adding-webhooks',
      ],
    },
    {
      type: 'category',
      label: 'API & webhooks',
      collapsible: false,
      items: ['api', 'webhooks'],
    },
    {
      type: 'category',
      label: 'Deploying on your own',
      collapsible: false,
      items: ['download-and-install', 'deployment'],
    },
    {
      type: 'category',
      label: 'Extras',
      collapsible: false,
      items: ['faq'],
    },
  ],
};

export default sidebars;
