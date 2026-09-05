/* 首页「真机实验」静态展示的内容源。
 *
 * 两部分素材，都不是文案发挥，逐条对得上出处：
 *
 *   体系四层   挑战杯项目书 §3.3「启真智能真机实验体系」
 *              3.3.1 标准化实验技能建模与网络化组织
 *              3.3.2 复杂实验流程的约束编排与跨设备适配
 *              3.3.3 面向科学实验的多模态具身执行
 *              3.3.4 真实实验状态回传与自进化接口
 *
 *   原子技能   代码侧词表见 demo/experiment-iteration/
 *              code/main/chem_agent_bo/steps/schema.py
 *              项目书 §3.3.1 的中文说法与之对应
 *
 *   接口契约   demo/experiment-iteration/README.md §四「两种执行后端」
 *              以及 code/main/chem_agent_bo/backends/device.py
 *
 *   闭环结果   demo/experiment-iteration/results/appendix/data/manifest.json
 *              的 report_scope / report_metrics：
 *              seed 1500、29 组初始、5731 候选池、20 轮预算、目标 95.00%。
 *              逐轮数值另可核对 suzuki_seed1500_first20_trajectories.csv。
 *
 * ── 两个口径，都成立，别混着读 ──────────────────────────────────────────
 *
 * 同一次 seed-1500 运行存在两种切法，页面上两处都出现过，这里写清楚免得后来人
 * 以为其中一处写错了：
 *
 *   前 20 轮（本文件 / 项目书 §4.2 表4.4）
 *     启真第 11 轮达标、基线第 16 轮，两者 20 轮内最高均为 96.30%。
 *     这是项目书用来做对照的口径，因为预算受限时的搜索效率才是要比的东西。
 *
 *   完整 40 轮（首页四项创新弹窗 REAL_MACHINE_STEPS / full-trajectory.png）
 *     启真 best_so_far 到 99.90%，基线到 98.69%。核实自
 *     results/optimization_trajectories/Suzuki/<mode>/atlas/seed_1500/seed_1500.pt
 *     的 trajectory[39]['best_so_far']。
 *
 * 另注：summary_metrics.csv 里 atlas_baseline+atlas 的 best_found 也是 98.69，
 * 且 std = 0.00 —— 该基线每个 seed 都收敛到同一值，所以这不是把多 seed 均值
 * 误当单 seed 用，两个数字本来就相等。
 */

/* §3.3 的四个小节，按项目书顺序。kicker 用小节号，让读者能回查原文。 */
export const REAL_MACHINE_LAYERS = [
  {
    kicker: '3.3.1',
    title: '标准化技能建模',
    system: 'SkillNet',
    text: '把分散的实验操作封装为可独立调用的原子技能，每项技能明确适用条件、输入输出、执行步骤、设备接口、完成状态与异常边界，在高层方案与底层指令之间建立稳定的能力抽象。',
  },
  {
    kicker: '3.3.2',
    title: '约束编排与跨设备适配',
    system: '技能编排层',
    text: '依据技能关系把实验协议解析为满足依赖约束的序列：执行前检查前置条件，执行后更新样品、容器与设备状态。设备更换时只需替换对应技能实现或适配模块，无需重新设计整条流程。',
  },
  {
    kicker: '3.3.3',
    title: '多模态具身执行',
    system: 'LabVLA',
    text: '以多视角视觉、机器人本体状态和实验指令为输入，视觉语言主干理解实验目标与物体关系，动作专家生成连续控制轨迹；采用 FAST 动作表征预训练，并以 Flow Matching 完成连续动作建模。',
  },
  {
    kicker: '3.3.4',
    title: '真实状态回传',
    system: '自进化接口',
    text: '执行过程同步记录视觉状态、设备状态、样品变化、动作轨迹、执行日志与异常信息，并将产率、选择性、转化率及表征结果统一回传，使每轮实验产出的是完整轨迹而不只是一个终值。',
  },
]

/* 项目书 §3.3.1 的中文操作名，与 steps/schema.py 的封闭动作集合对应。 */
export const ATOMIC_SKILLS = [
  '加样', '取放', '倾倒', '混合', '加热', '搅拌', '取样', '检测',
]

/* §3.3.3 末段：已在真实 Franka 平台完成，且在目标位置变化与环境干扰下验证过。 */
export const FRANKA_TASKS = ['液体倾倒', '摇匀', '磁力搅拌', '塞子插拔']

/* README §四。写成三行是因为契约本身就只有三个端点——执行器实现这三个就能接入。 */
export const DEVICE_CONTRACT = [
  { method: 'GET', path: '/health', note: '200 表示可接受任务' },
  { method: 'POST', path: '/tasks', note: '提交 {task, candidate_id, candidate, steps}，返回 task_id' },
  { method: 'GET', path: '/tasks/{id}', note: '轮询至终态，回传 status 与 yield' },
]

/* 结果表。列顺序固定为「启真 / 基线」，highlight 标记出差异所在的那两行。 */
export const CLOSED_LOOP_SETUP = {
  reaction: 'Suzuki–Miyaura 偶联反应条件优化',
  seed: 1500,
  initialRuns: 29,
  candidatePool: 5731,
  roundBudget: 20,
  target: 95.0,
}

/* 同一次运行跑满 40 轮的收敛值，用来和首页弹窗的口径衔接。 */
export const FULL_RUN = { rounds: 40, qizhen: '99.90%', baseline: '98.69%' }

export const CLOSED_LOOP_METRICS = [
  { label: '首次达到 95% 产率', qizhen: '第 11 轮', baseline: '第 16 轮', highlight: true },
  { label: '20 轮最高产率', qizhen: '96.30%', baseline: '96.30%' },
  { label: '≥95% 高产率新条件', qizhen: '4 个', baseline: '1 个', highlight: true },
  { label: '20 轮平均历史最佳', qizhen: '86.90%', baseline: '85.37%' },
]
