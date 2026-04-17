import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from '@site/src/pages/index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          CADL
        </Heading>
        <p className="hero__subtitle">Contract Architecture Description Language</p>
        <p style={{color: 'var(--ifm-hero-text-color)', opacity: 0.8, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem'}}>
          System of Systems における制度設計を形式的に記述・検証・展開するためのドメイン固有言語
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/spec/intro">
            仕様書を読む
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            href="https://cadl-explorer.streamlit.app/">
            CADL Explorer を試す
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
        <div className="row" style={{alignItems: 'center', gap: '2rem'}}>
          <div className="col col--6">
            <Heading as="h2">CADL とは</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>CADL（Contract Architecture Description Language）</strong>は，
              マルチエージェント System of Systems（SoS）における制度設計を形式的に記述・検証・展開するための
              ドメイン固有言語です。
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              CADLは<strong>三層アーキテクチャ</strong>——制度層（Institution）・プロトコル層（Protocol）・
              アルゴリズム層（Algorithm）——を採用し，ガバナンスルール，エージェント間の調整メカニズム，
              計算的な振る舞いを単一の統合言語で精密に記述できます。
              CADL仕様からシミュレータ設定の自動生成や設計整合性の検証を行うツールチェーンも提供します。
            </p>
            <Link className="button button--outline button--primary" to="/docs/spec/intro">
              仕様書を読む →
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
              <div style={{color: '#6c7086', marginBottom: '0.5rem'}}># CADL — 制度層の記述例</div>
              <div><span style={{color: '#cba6f7'}}>institution</span> <span style={{color: '#89b4fa'}}>DeliveryGovernance</span> {'{'}</div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>sos_type</span><span style={{color: '#cdd6f4'}}> = </span><span style={{color: '#f38ba8'}}>"directed"</span></div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>alpha</span><span style={{color: '#cdd6f4'}}> = </span><span style={{color: '#fab387'}}>0.3</span></div>
              <div style={{paddingLeft: '1.5rem'}}><span style={{color: '#a6e3a1'}}>motivation</span>{'{'}</div>
              <div style={{paddingLeft: '3rem'}}><span style={{color: '#a6e3a1'}}>model</span><span style={{color: '#cdd6f4'}}> = </span><span style={{color: '#f38ba8'}}>"hybrid"</span></div>
              <div style={{paddingLeft: '3rem'}}><span style={{color: '#a6e3a1'}}>rho</span><span style={{color: '#cdd6f4'}}> = </span><span style={{color: '#fab387'}}>0.5</span></div>
              <div style={{paddingLeft: '1.5rem'}}>{'}'}</div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatIsExplorer() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row" style={{alignItems: 'center', gap: '2rem'}}>
          <div className="col col--5">
            <div style={{
              background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
              border: '1px solid var(--ifm-color-primary-lightest)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>CADL → IR → Config → Results → Governance</div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                fontSize: '0.9rem',
              }}>
                {['CADL仕様', '→', 'IR', '→', 'シミュレータ設定', '→', '実験', '→', 'ガバナンス評価'].map((item, i) => (
                  <span key={i} style={{
                    background: item === '→' ? 'transparent' : 'var(--ifm-color-primary-lightest)',
                    padding: item === '→' ? '0' : '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontFamily: item === '→' ? 'inherit' : 'monospace',
                    color: item === '→' ? 'var(--ifm-color-emphasis-600)' : 'var(--ifm-color-primary-darkest)',
                    fontWeight: item === '→' ? 'normal' : '600',
                  }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="col col--6 col--offset-1">
            <Heading as="h2">CADL Explorer とは</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>CADL Explorer</strong> は，CADLのガバナンスパイプラインをエンドツーエンドで体験できる
              インタラクティブなWebアプリケーションです。CADL仕様から出発し，
              制度設計 → シミュレータ設定 → 実験 → ガバナンス評価 という因果連鎖を一貫して可視化します。
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              設計上の意思決定がマルチエージェントシステムの振る舞いにどう影響するかを，
              透明かつ再現可能な形で示すことができます。
              ガバナンスパラメータを対話的に変えながら，結果への影響をリアルタイムで確認できます。
            </p>
            <Link
              className="button button--primary button--lg"
              href="https://cadl-explorer.streamlit.app/">
              CADL Explorer を試す →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: '三層アーキテクチャ',
      description: '制度層（権限・インセンティブ・情報共有），プロトコル層（調整手続き），アルゴリズム層（計算的振る舞い）を単一言語で統合的に記述します。',
    },
    {
      title: '形式的検証',
      description: 'コントラクト間の矛盾，プロトコルのデッドロック，体制遷移時の安全性違反を自動的に検出します。',
    },
    {
      title: 'エンドツーエンドパイプライン',
      description: 'CADL仕様からシミュレータ設定を自動生成し，制度設計から振る舞い評価までの因果連鎖を一貫してトレースします。',
    },
  ];

  return (
    <section style={{padding: '2rem 0', background: 'var(--ifm-background-surface-color)'}}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>主な特徴</Heading>
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
  return (
    <Layout
      title="CADL - Contract Architecture Description Language"
      description="System of Systems における制度設計を形式的に記述・検証・展開するためのドメイン固有言語">
      <HomepageHeader />
      <main>
        <WhatIsCADL />
        <WhatIsExplorer />
        <Features />
      </main>
    </Layout>
  );
}
