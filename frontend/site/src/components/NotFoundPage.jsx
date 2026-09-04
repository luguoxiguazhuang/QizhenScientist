import { Link } from 'react-router-dom'
import PageHeader from './PageHeader.jsx'
import './NotFoundPage.css'

/* `path="*"` used to redirect to the home page. A mistyped or stale URL then
   landed somewhere plausible with no indication anything had gone wrong, which
   reads as "that page is gone" only after the visitor notices they are not
   where they asked to be. Saying so, and pointing at the four places worth
   going, costs one screen and removes the guesswork. */
const DESTINATIONS = [
  { to: '/', label: '返回首页', hint: '了解启真 Scientist 的四项创新' },
  { to: '/knowledge-graphs', label: '查看知识图谱', hint: '浏览跨学科知识与论文证据' },
]

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '页面不存在' }]}
        title="页面不存在"
        lede="链接可能已过期，或地址中存在拼写错误。请返回首页或访问知识图谱。"
      />

      <div className="container not-found__body">
        <ul className="not-found__list">
          {DESTINATIONS.map((destination) => (
            <li key={destination.to}>
              <Link to={destination.to} className="not-found__link link-unstyled">
                <span className="not-found__link-label">{destination.label}</span>
                <span className="not-found__link-hint">{destination.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
