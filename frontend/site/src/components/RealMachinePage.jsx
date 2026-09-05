import PageHeader from './PageHeader.jsx'
import { withBase } from '../lib/basePath.js'
import { PAGE_ACCENTS } from '../content/mechanistContent.js'
import {
  ATOMIC_SKILLS,
  CLOSED_LOOP_METRICS,
  CLOSED_LOOP_SETUP,
  DEVICE_CONTRACT,
  FRANKA_TASKS,
  FULL_RUN,
  REAL_MACHINE_LAYERS,
} from '../content/realMachine.js'
import './RealMachinePage.css'

/* 真机执行页。
 *
 * 这一页回答一个具体问题：AI 给出的实验条件，是怎么变成真实实验室里的动作的。
 * 所以它按那条链路本身的顺序讲——技能建模、编排适配、具身执行、状态回传——再用
 * 一次已经跑完的 Suzuki 闭环收尾，让读者看到链路确实闭上了。
 *
 * 纯静态：这是展示，不是演示。可交互的逐步演示在首页四项创新那一节的弹窗里
 * （HomeInnovations.jsx 的 REAL_MACHINE_STEPS），两者口径的差别见
 * content/realMachine.js 顶部的注释。
 */
export default function RealMachinePage() {
  const { reaction, seed, initialRuns, candidatePool, roundBudget, target } = CLOSED_LOOP_SETUP

  return (
    <div className="real-machine" style={{ '--page-accent': PAGE_ACCENTS.realMachine }}>
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '真机执行' }]}
        title="让 AI 的方案在真实实验室里得到验证"
        lede="现有科研智能体大多停留在文献、代码与仿真环境，实验方案与真实仪器之间缺少稳定通用的执行接口。启真在上层科学规划与底层设备控制之间建立统一的技能表示与任务编排，把复杂实验协议逐步分解为可执行、可组合、可验证的基础操作，使真实实验成为闭环中的可编排环节与可观测反馈来源。"
        motif="runs"
        /* 标签保持短：这条栏只有三格、每格约 80px，长标签会折成两行还断在词中间。 */
        figures={[
          { value: String(ATOMIC_SKILLS.length), label: '原子技能' },
          { value: String(FRANKA_TASKS.length), label: 'Franka 操作' },
          { value: String(DEVICE_CONTRACT.length), label: '执行端点' },
        ]}
      />

      <div className="container qz-machine">
        <figure className="qz-machine__figure">
          <img
            src={withBase('demos/real-machine/labvla-framework.png')}
            alt="LabVLA 实验环境构建、技能工作流生成与跨本体数据组织框架"
            width="1455"
            height="1136"
          />
          <figcaption>
            LabVLA 的数据构造流程：从实验资产与场景构建，到原子技能组合、具身工作流生成、
            跨机器人本体建模，再到多层实验状态标注。
          </figcaption>
        </figure>

        <ol className="qz-machine__layers">
          {REAL_MACHINE_LAYERS.map(({ kicker, title, system, text }) => (
            <li className="qz-machine__layer" key={kicker}>
              <span className="qz-machine__layer-kicker">{kicker}</span>
              <div className="qz-machine__layer-copy">
                <h2>
                  {title}
                  <span className="qz-machine__layer-system">{system}</span>
                </h2>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="qz-machine__panels">
          <article className="qz-machine__panel">
            <h2>原子技能词表</h2>
            <p className="qz-machine__panel-note">
              化学实验的操作被封装为封闭动作集合，复杂实验由原子技能按既定约束组合完成。
            </p>
            <ul className="qz-machine__chips">
              {ATOMIC_SKILLS.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </article>

          <article className="qz-machine__panel">
            <h2>真实 Franka 平台已完成</h2>
            <p className="qz-machine__panel-note">
              每项任务由多个原子动作组合构成，并在目标位置变化与环境干扰条件下完成验证。
            </p>
            <ul className="qz-machine__chips qz-machine__chips--done">
              {FRANKA_TASKS.map((task) => <li key={task}>{task}</li>)}
            </ul>
          </article>

          <article className="qz-machine__panel qz-machine__panel--wide">
            <h2>执行器接入契约</h2>
            <p className="qz-machine__panel-note">
              条件经技能编排展开为原子动作协议后跨接口提交；编排过程确定性、不经模型，
              同一条件恒得同一协议，因此可比对、可复核、可重放。
            </p>
            <dl className="qz-machine__contract">
              {DEVICE_CONTRACT.map(({ method, path, note }) => (
                <div className="qz-machine__endpoint" key={path}>
                  <dt>
                    <span className={`qz-machine__verb qz-machine__verb--${method.toLowerCase()}`}>{method}</span>
                    <code>{path}</code>
                  </dt>
                  <dd>{note}</dd>
                </div>
              ))}
            </dl>
            <p className="qz-machine__warn">
              装置不可达时整轮运行失败，不会静默改用历史数据填充——把未经测量的数值记为测量结果会污染整条实验轨迹。
            </p>
          </article>
        </div>

        <section className="qz-machine__result" aria-labelledby="qz-machine-result-title">
          <div className="qz-machine__result-head">
            <h2 id="qz-machine-result-title">闭环结果 · {reaction}</h2>
            <p className="qz-machine__setup">
              seed {seed} · {initialRuns} 组初始实验 · {candidatePool.toLocaleString()} 条候选空间 ·
              {' '}{roundBudget} 轮预算 · 高产率目标 {target.toFixed(2)}% · 与 Atlas 基线同起点同预算对照
            </p>
          </div>
          <div className="qz-machine__table-wrap">
            <table className="qz-machine__table">
              <thead>
                <tr>
                  <th scope="col">评价指标</th>
                  <th scope="col">启真 Scientist</th>
                  <th scope="col">Atlas 基线</th>
                </tr>
              </thead>
              <tbody>
                {CLOSED_LOOP_METRICS.map(({ label, qizhen, baseline, highlight }) => (
                  <tr className={highlight ? 'is-highlight' : undefined} key={label}>
                    <th scope="row">{label}</th>
                    <td><strong>{qizhen}</strong></td>
                    <td>{baseline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="qz-machine__result-note">
            两者 20 轮内最高产率相同，差异在速度与覆盖：启真提前 5 轮达标，所需实验减少 31.25%，
            并用剩余预算在第 14、18、20 轮又找到三个 ≥95% 的新条件。上表为项目书采用的前
            {' '}{roundBudget} 轮对照口径；同一次运行继续跑满 {FULL_RUN.rounds} 轮，
            启真收敛至 {FULL_RUN.qizhen}，基线为 {FULL_RUN.baseline}。
          </p>
        </section>
      </div>
    </div>
  )
}
