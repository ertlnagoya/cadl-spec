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
            to="/docs/handson/">
            Take the Hands-on
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            href="https://cadl-explorer.streamlit.app/">
            Try CADL Explorer
          </Link>
        </div>
      </div>
    </header>
  );
}

function WhatIsCADL() {
  return (
    <section style={{padding: '3rem 0', background: 'var(--ifm-background-surface-color)'}}>
      <div className="container">
        <div className="row" style={{alignItems: 'center'}}>
          <div className="col col--6">
            <Heading as="h2">What is CADL?</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>CADL (Contract Architecture Description Language)</strong> is a domain-specific language
              for formally specifying, verifying, and deploying institutional designs in multi-agent
              System of Systems (SoS).
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              CADL adopts a <strong>three-layer architecture</strong> — Institution, Protocol, and Algorithm —
              so that governance rules, coordination procedures, and the algorithms each side runs
              (referred to by name) are described in one language. From a CADL specification, the toolchain
              checks the design for contradictions and generates code and simulator configurations.
            </p>
            <Link className="button button--outline button--primary" to="/docs/spec/intro">
              Read the Specification →
            </Link>
          </div>
          <div className="col col--5 col--offset-1">
            <div style={{
              background: '#1e1e2e',
              borderRadius: '8px',
              padding: '1.5rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: '#cdd6f4',
            }}>
              <div style={{color: '#6c7086', marginBottom: '0.5rem'}}># CADL — a contract between a dispatcher and its robots</div>
              <div style={{paddingLeft: '0rem'}}><span style={{color: '#a6e3a1'}}>sos</span>:</div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>name</span>: <span style={{color: '#f38ba8'}}>"RobotDelivery"</span></div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>type</span>: <span style={{color: '#cdd6f4'}}>Acknowledged</span></div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>actors</span>:</div>
              <div style={{paddingLeft: '3rem'}}>- {'{'}<span style={{color: '#a6e3a1'}}>id</span>: <span style={{color: '#cdd6f4'}}>DISPATCHER</span>, <span style={{color: '#a6e3a1'}}>role</span>: <span style={{color: '#cdd6f4'}}>planner</span>{'}'}</div>
              <div style={{paddingLeft: '3rem'}}>- {'{'}<span style={{color: '#a6e3a1'}}>id</span>: <span style={{color: '#f38ba8'}}>"ROBOT[1..N]"</span>, <span style={{color: '#a6e3a1'}}>role</span>: <span style={{color: '#cdd6f4'}}>courier</span>{'}'}</div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>contracts</span>:</div>
              <div style={{paddingLeft: '3rem'}}><span style={{color: '#a6e3a1'}}>- id</span>: <span style={{color: '#cdd6f4'}}>DELIVERY_SLA</span></div>
              <div style={{paddingLeft: '4rem'}}><span style={{color: '#a6e3a1'}}>parties</span>: <span style={{color: '#cdd6f4'}}>[DISPATCHER, "ROBOT[*]"]</span></div>
              <div style={{paddingLeft: '4rem'}}><span style={{color: '#a6e3a1'}}>assume</span>: <span style={{color: '#f38ba8'}}>["ROBOT[i].battery &gt; 20"]</span></div>
              <div style={{paddingLeft: '4rem'}}><span style={{color: '#a6e3a1'}}>guarantee</span>: <span style={{color: '#f38ba8'}}>["delivery_time &lt;= 300s"]</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row" style={{alignItems: 'center'}}>
          <div className="col col--6">
            <Heading as="h2">Get started</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              The reference implementation is the <code>cadl</code> command-line tool (Python 3.9 or later).
              Install it from PyPI, fetch the examples, and check one:
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              All commands are listed in the <Link href="https://github.com/ertlnagoya/cadl#readme">README of the cadl repository</Link>. For a guided walkthrough, take the <Link to="/docs/handson/">hands-on course</Link>.
            </p>
            <Link className="button button--primary" href="https://github.com/ertlnagoya/cadl">
              Source on GitHub
            </Link>
            <Link className="button button--outline button--primary" style={{marginLeft: '1rem'}} href="https://pypi.org/project/cadl-lang/">
              cadl-lang on PyPI
            </Link>
          </div>
          <div className="col col--5 col--offset-1">
            <pre style={{
              background: '#1e1e2e',
              borderRadius: '8px',
              padding: '1.5rem',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: '#cdd6f4',
              margin: 0,
            }}>{`pip install cadl-lang
git clone https://github.com/ertlnagoya/cadl

cadl check  cadl/examples/robot_delivery.cadl
cadl verify cadl/examples/robot_delivery.cadl`}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatIsExplorer() {
  return (
    <section style={{padding: '3rem 0', background: 'var(--ifm-background-surface-color)'}}>
      <div className="container">
        <div className="row" style={{alignItems: 'center'}}>
          <div className="col col--5">
            <div style={{
              background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
              border: '1px solid var(--ifm-color-primary-lightest)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <div style={{fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem'}}>CADL → IR → Config → Results → Governance</div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                fontSize: '0.9rem',
              }}>
                {['CADL', '→', 'IR', '→', 'Config', '→', 'Results', '→', 'Governance'].map((item, i) => (
                  <span key={i} style={{
                    background: item === '→' ? 'transparent' : 'var(--ifm-color-primary-lightest)',
                    padding: item === '→' ? '0' : '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    color: item === '→' ? 'var(--ifm-color-emphasis-600)' : 'var(--ifm-color-primary-darkest)',
                    fontWeight: item === '→' ? 'normal' : '600',
                  }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="col col--6 col--offset-1">
            <Heading as="h2">What is CADL Explorer?</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>CADL Explorer</strong> is an interactive web application that demonstrates the
              CADL governance pipeline end-to-end. Starting from a CADL specification, it traces
              the full causal chain — from institutional design through simulation configuration
              to experiment results and governance evaluation.
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              The tool makes the relationship between design decisions and behavioral outcomes
              transparent and reproducible, helping researchers explore how governance parameters
              affect multi-agent system performance.
            </p>
            <Link
              className="button button--primary button--lg"
              href="https://cadl-explorer.streamlit.app/">
              Try CADL Explorer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatIsHandson() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row" style={{alignItems: 'center'}}>
          <div className="col col--6">
            <Heading as="h2">Take the Hands-on</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>SoS-DSL Hands-on</strong> is a self-paced workshop of about 95 minutes (or a 5-session
              exercise course) that walks you through the entire pipeline of the CADL toolchain on a
              robot delivery System of Systems: <em>CADL modelling → SoS-DSL contracts (lifecycle
              + monitors) → visualisation → code generation → live simulation</em>.
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              Materials include a main textbook, a 5-session exercises booklet with graded tasks,
              and an academic background page covering ISO/IEC/IEEE 21839/40/41 and Maier's criteria.
            </p>
            <Link className="button button--primary button--lg" to="/docs/handson/">
              Open the Hands-on Index →
            </Link>
          </div>
          <div className="col col--5 col--offset-1">
            <div style={{
              background: 'var(--ifm-background-color)',
              border: '1px solid var(--ifm-color-emphasis-200)',
              borderRadius: '12px',
              padding: '1.5rem',
              fontSize: '0.95rem',
              lineHeight: '1.7',
            }}>
              <div style={{fontWeight: '600', marginBottom: '0.75rem'}}>What's inside</div>
              <ul style={{paddingLeft: '1.2rem', marginBottom: '0'}}>
                <li><strong>Main textbook</strong> — 6 steps × 15 min</li>
                <li><strong>Exercises</strong> — 5-session series with rubric</li>
                <li><strong>Academic background</strong> — Maier's 5 criteria, ISO 21839/40/41, references</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: 'Three-Layer Architecture',
      description: 'Describe institutions (authority, incentives, information sharing), protocols (coordination procedures), and the algorithms each side runs (by name) in a single language.',
    },
    {
      title: 'Formal Verification',
      description: 'Check each contract for contradictions between its assumptions and guarantees with an SMT solver, and detect deadlocks in protocols.',
    },
    {
      title: 'End-to-End Pipeline',
      description: 'Generate code and simulator configurations from CADL specs, and trace the chain from institutional design to behavioral evaluation with a simulator or CADL Explorer.',
    },
  ];

  return (
    <section style={{padding: '2rem 0', background: 'var(--ifm-background-surface-color)'}}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>Key Features</Heading>
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className="col col--4" style={{marginBottom: '2rem'}}>
              <div style={{
                padding: '1.5rem',
                border: '1px solid var(--ifm-color-emphasis-200)',
                borderRadius: '8px',
                height: '100%',
              }}>
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
      title="Contract Architecture Description Language"
      description="A domain-specific language for formally specifying, verifying, and deploying institutional designs in System of Systems.">
      <HomepageHeader />
      <main>
        <WhatIsCADL />
        <GetStarted />
        <WhatIsExplorer />
        <WhatIsHandson />
        <Features />
      </main>
    </Layout>
  );
}
