import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Java + Bedrock support',
    icon: '🎮',
    description: (
      <>
        Ping both editions with a single API. Bedrock bypasses cache for
        freshness; Java lookups honor Redis TTLs.
      </>
    ),
  },
  {
    title: 'Webhook fan-out',
    icon: '📣',
    description: (
      <>
        Register webhooks per API key and blast the same status payload to every
        consumer with one POST.
      </>
    ),
  },
  {
    title: 'Batteries included',
    icon: '🧰',
    description: (
      <>
        Prisma + Postgres for history, Redis for speed, `/health` for checks,
        and ready-to-copy curl commands.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.icon}>{icon}</div>
      <Heading as="h3">{title}</Heading>
      <p>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
