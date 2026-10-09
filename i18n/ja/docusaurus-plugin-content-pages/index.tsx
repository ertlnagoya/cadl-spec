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
            to="/docs/handson/">
            ハンズオンを始める
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
        <div className="row" style={{alignItems: 'center'}}>
          <div className="col col--6">
            <Heading as="h2">CADL とは</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>CADL（Contract Architecture Description Language）</strong>は，
              マルチエージェント System of Systems（SoS）における制度設計を形式的に記述・検証・展開するための
              ドメイン固有言語です。
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              CADLは<strong>三層アーキテクチャ</strong>——制度層（Institution）・プロトコル層（Protocol）・
              アルゴリズム層（Algorithm）——を採用し，ガバナンスルール，エージェント間の調整手続き，
              各側が実行するアルゴリズム（名前で参照）を1つの言語で記述できます。
              ツールチェーンは，CADL仕様から設計の矛盾を検査し，コードとシミュレータ設定を生成します。
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
            <Heading as="h2">はじめる</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              リファレンス実装は，コマンドラインツール <code>cadl</code> です（Python 3.9 以上）。
              PyPI からインストールし，サンプルを取得して，検査を実行します。
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              コマンドの一覧は <Link href="https://github.com/ertlnagoya/cadl#readme">cadl リポジトリの README</Link> にあります。手順を追って学ぶには <Link to="/docs/handson/">ハンズオン講座</Link> をご利用ください。
            </p>
            <Link className="button button--primary" href="https://github.com/ertlnagoya/cadl">
              GitHub のソース
            </Link>
            <Link className="button button--outline button--primary" style={{marginLeft: '1rem'}} href="https://pypi.org/project/cadl-lang/">
              PyPI の cadl-lang
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
              ガバナンスパラメータがシステムの性能にどう影響するかを調べる助けになります。
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

function WhatIsHandson() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row" style={{alignItems: 'center'}}>
          <div className="col col--6">
            <Heading as="h2">ハンズオンで学ぶ</Heading>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              <strong>SoS-DSL ハンズオン</strong>は，ロボット配送の System of Systems を題材に，
              CADL ツールチェーンの全工程を体験する約95分の自習用ワークショップです（全5回の演習コースとしても使えます）。
              <em>CADL によるモデリング → SoS-DSL の契約（lifecycle と monitors）→ 可視化 → コード生成 → シミュレーション実行</em>
              の順に進みます。
            </p>
            <p style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
              教科書，難易度別の課題を収めた全5回の演習集，学術的背景（Maier の5条件，ISO/IEC/IEEE 21839・21840・21841）を用意しています。
            </p>
            <Link className="button button--primary button--lg" to="/docs/handson/">
              ハンズオン入口へ →
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
              <div style={{fontWeight: '600', marginBottom: '0.75rem'}}>教材の構成</div>
              <ul style={{paddingLeft: '1.2rem', marginBottom: '0'}}>
                <li><strong>教科書</strong> — 6ステップ × 15分</li>
                <li><strong>演習集</strong> — 全5回，ルーブリック付き</li>
                <li><strong>学術的背景</strong> — Maier の5条件，ISO 21839・21840・21841，参考文献</li>
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
      title: '三層アーキテクチャ',
      description: '制度層（権限・インセンティブ・情報共有），プロトコル層（調整手続き），各側が実行するアルゴリズム（名前で参照）を単一の言語で記述します。',
    },
    {
      title: '形式的検証',
      description: '各契約の前提と保証の矛盾を SMT ソルバで検査し，プロトコルのデッドロックを検出します。',
    },
    {
      title: 'エンドツーエンドパイプライン',
      description: 'CADL仕様からコードとシミュレータ設定を生成します。シミュレータや CADL Explorer と組み合わせて，制度設計から振る舞い評価までの連鎖をたどれます。',
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
      title="Contract Architecture Description Language"
      description="System of Systems における制度設計を形式的に記述・検証・展開するためのドメイン固有言語">
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
