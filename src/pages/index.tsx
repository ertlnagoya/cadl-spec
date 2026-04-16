import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p style={{color: 'var(--ifm-hero-text-color)', opacity: 0.8, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem'}}>
          A domain-specific language for formally specifying, verifying, and deploying institutional designs in System of Systems.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/spec/intro">
            Read the Specification
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            href="https://github.com/ertlnagoya/cadl">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features() {
  const features = [
    {
      title: 'Three-Layer Integrated Description',
      description: 'Describe institutions (authority, incentives, information sharing), protocols (coordination procedures), and algorithms in a single language.',
    },
    {
      title: 'Formal Verification',
      description: 'Automatically detect contradictions between contracts, deadlocks in protocols, and safety violations during regime transitions using SMT solvers.',
    },
    {
      title: 'Code Generation',
      description: 'Generate runtime code (Python, TypeScript, Solidity) from institutional descriptions — contract monitors, protocol engines, and regime controllers.',
    },
  ];

  return (
    <section style={{padding: '2rem 0'}}>
      <div className="container">
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className="col col--4" style={{marginBottom: '2rem'}}>
              <div style={{padding: '1rem'}}>
                <Heading as="h3">{feature.title}</Heading>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="CADL - Contract Architecture Description Language"
      description="A domain-specific language for formally specifying, verifying, and deploying institutional designs in System of Systems.">
      <HomepageHeader />
      <main>
        <Features />
      </main>
    </Layout>
  );
}
