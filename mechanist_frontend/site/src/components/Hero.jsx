import { Link } from 'react-router-dom'
import { ArrowRight, Network } from 'lucide-react'
import { SITE } from '../content/mechanistContent.js'
import { withBase } from '../lib/basePath.js'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero qz-hero">
      <div className="container qz-hero__inner">
        <div className="qz-hero__content">
          <span className="eyebrow">启真 SCIENTIST / 化学人工智能</span>
          <h1>{SITE.title.lines[0]}</h1>
          <p className="qz-hero__subtitle">{SITE.title.lines[1]}</p>
          <p className="qz-hero__lede">{SITE.subtitle}</p>
          <div className="qz-hero__actions">
            <Link className="btn btn-primary link-unstyled" to="/knowledge-graphs">
              探索知识图谱 <Network size={17} />
            </Link>
            <a className="link-cue link-unstyled" href="#innovations">
              查看四项创新 <ArrowRight size={17} />
            </a>
          </div>
        </div>
        <figure className="qz-hero__figure">
          <img src={withBase('qizhen-scientist-overview.png')} alt="启真 Scientist 知识启发、真机实验与反馈迭代闭环" width="1103" height="584" />
          <figcaption>知识发现 → 方案设计 → 真机实验 → 反馈进化</figcaption>
        </figure>
      </div>
    </section>
  )
}
