import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

type DocTile = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const docTiles: DocTile[] = [
  {
    title: 'Getting started',
    description: 'Start the guided setup for both the hosted API and the self-hosted flow.',
    href: '/docs/getting-started',
  },
  {
    title: 'Deploy on your own',
    description: 'Self-host mc-pulse with Redis, Postgres, and webhook fan-out control.',
    href: '/docs/deployment',
  },
  {
    title: 'Download & install',
    description: 'Grab the repo, configure env vars, and generate Prisma.',
    href: '/docs/download-and-install',
  },
  {
    title: 'API reference',
    description: 'Endpoints, payload shapes, and caching defaults for status lookups.',
    href: '/docs/api',
  },
  {
    title: 'Webhook fan-out',
    description: 'Create keys, register hooks, and broadcast notifications with one POST.',
    href: '/docs/webhooks',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.tagline}>Java + Bedrock • Redis cache • Webhook fan-out</p>
            <Heading as="h1" className={styles.title}>
              Ping Minecraft servers, ship webhook alerts.
            </Heading>
            <p className={styles.lead}>
              {siteConfig.tagline}. Cache Java lookups in Redis, persist snapshots in Postgres,
              and notify your downstream apps with one POST.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/getting-started">
                Get started
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/deployment">
                Deploy on your own
              </Link>
              <Link className={clsx('button button--lg', styles.ghostButton)} to="https://github.com/Noobyetpro/mc-pulse">
                GitHub
              </Link>
            </div>
            <p className={styles.heroNote}>
              This site hosts both the hosted API guide and the self-host playbook. The managed
              endpoints are also reachable at{' '}
              <Link href="https://mc-pulse.vercel.app/" target="_blank" rel="noreferrer">
                mc-pulse.vercel.app
              </Link>{' '}
              (no ports required) if you just need a ready-made deployment.
            </p>
            <div className={styles.chips}>
              <span>Low-latency Redis cache</span>
              <span>Postgres history</span>
              <span>Secure API keys</span>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.panelHeading}>Notify every webhook</div>
            <CodeBlock language="bash">
              {`# Fetch status and broadcast to all webhooks for your API key
curl -X POST "https://mc-pulse.vercel.app/api/notify?host=arch.mc&type=java" \\
  -H "x-api-key: key_abc123"`}
            </CodeBlock>
            <div className={styles.panelMeta}>
              <div>
                <span className={styles.metaLabel}>Cache TTL</span>
                <strong>30s</strong>
              </div>
              <div>
                <span className={styles.metaLabel}>DB</span>
                <strong>Postgres (mc_pulse)</strong>
              </div>
              <div>
                <span className={styles.metaLabel}>Health</span>
                <strong>/health → {"{ ok: true }"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function DocsGrid(): ReactNode {
  return (
    <section className={styles.docsGrid}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Docs & deployment</Heading>
          <p>
            Official docs live on the Vercel deployment; the tiles below cover the self-hosted
            download, API, webhook, and deploy-on-your-own guidance.
          </p>
        </div>
        <div className={styles.tileGrid}>
          {docTiles.map((tile) => {
            const tileContent = (
              <>
                <div>
                  <p className={styles.tileLabel}>Guide</p>
                  <Heading as="h3" className={styles.tileTitle}>
                    {tile.title}
                  </Heading>
                  <p className={styles.tileDescription}>{tile.description}</p>
                </div>
                <span className={styles.tileCta}>Read →</span>
              </>
            );
            return tile.external ? (
              <a
                key={tile.title}
                className={styles.tile}
                href={tile.href}
                target="_blank"
                rel="noreferrer">
                {tileContent}
              </a>
            ) : (
              <Link key={tile.title} className={styles.tile} to={tile.href}>
                {tileContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Minecraft server status API with Redis caching, Postgres snapshots, and webhook notifications.">
      <HomepageHeader />
      <main className={styles.main}>
        <DocsGrid />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
