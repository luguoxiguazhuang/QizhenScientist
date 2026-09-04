"""R019: M0 verdict — paired deltas, pooled means, two-level bootstrap CI,
pooled exact McNemar, reliability panel, re-scan gate, 4-state verdict.
All thresholds from pipeline/pre_registered.json (written before any result).
"""
import json
import os
import sys
from collections import defaultdict

import numpy as np
from scipy import stats as sps

sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, RUNS, SEEDS, N_QAI, read_json, write_json

OUT = os.path.join(RUNS, "R019_verdict")


def _read_pre_registered(path):
    # pre_registered.json is stored JSONC-style: leading '#' comment lines are
    # documentation only. Strip them before parsing; the JSON body (the actual
    # pre-registration) is used verbatim.
    with open(path, encoding="utf-8") as f:
        lines = [ln for ln in f if not ln.lstrip().startswith("#")]
    return json.loads("".join(lines))


PRE = _read_pre_registered(os.path.join(os.path.dirname(__file__), "pre_registered.json"))


def find_eval_records():
    recs = {}
    for root, _, files in os.walk(RUNS):
        if "eval_records.json" in files:
            d = read_json(os.path.join(root, "eval_records.json"))
            key = (d["arm"], d["seed"])
            if key in recs:
                print(f"[verdict] WARNING duplicate eval_records for {key}: {root}")
            recs[key] = d
    return recs


def cohens_kappa(a, b, cats=("CORRECT", "INCORRECT", "OTHER")):
    idx = {c: i for i, c in enumerate(cats)}
    k = len(cats)
    M = np.zeros((k, k))
    for x, y in zip(a, b):
        if x in idx and y in idx:
            M[idx[x], idx[y]] += 1
    n = M.sum()
    if n == 0:
        return 0.0
    po = np.trace(M) / n
    pe = (M.sum(axis=0) * M.sum(axis=1)).sum() / (n * n)
    return float((po - pe) / (1 - pe)) if pe < 1 else 1.0


def main():
    os.makedirs(OUT, exist_ok=True)
    ev = find_eval_records()
    ctrlA = ev.get(("ctrlA", 0))
    assert ctrlA is not None, "Ctrl-A eval missing"
    acc = {}
    labels = {}
    for (arm, seed), d in ev.items():
        acc[(arm, seed)] = d["accuracy"]
        labels[(arm, seed)] = {r["item"]: r["judge_label"] for r in d["records"]}
    for s in SEEDS:
        assert ("treated", s) in ev, f"treated seed {s} missing"
        assert ("ctrlb", s) in ev, f"ctrlb seed {s} missing"

    correct = {(arm, seed): {i: 1 if lab == "CORRECT" else 0
                             for i, lab in labels[(arm, seed)].items()}
               for (arm, seed) in labels}
    notes = []  # accumulated verdict/diagnostic notes (initialized before first use)

    D = PRE["delta_min_pp"] / 100.0
    gaps, boot_ci, mcnemar, per_seed_mcnemar = {}, {}, {}, {}
    rng = np.random.default_rng(12345)
    N_B = PRE["bootstrap_resamples"]

    for C in ("ctrlA", "ctrlb"):
        seed_gaps = {}
        diffs_by_seed = {}
        for s in SEEDS:
            ctrl_ok = np.array([correct[(C, 0 if C == "ctrlA" else s)][i] for i in range(N_QAI)])
            tr_ok = np.array([correct[("treated", s)][i] for i in range(N_QAI)])
            d_i = ctrl_ok - tr_ok  # +1: treated worse; -1: treated better
            seed_gaps[s] = float(d_i.mean())
            diffs_by_seed[s] = d_i
            # per-seed McNemar (diagnostic)
            b = int(((ctrl_ok == 1) & (tr_ok == 0)).sum())
            c = int(((ctrl_ok == 0) & (tr_ok == 1)).sum())
            p = sps.binomtest(min(b, c), b + c, 0.5, alternative="two-sided").pvalue if b + c > 0 else 1.0
            per_seed_mcnemar[(C, s)] = {"b_ctrl_only": b, "c_treated_only": c, "exact_p": float(p)}
        pooled = float(np.mean(list(seed_gaps.values())))
        gaps[C] = {"per_seed": seed_gaps, "pooled": pooled}

        # two-level bootstrap: resample seeds, then items within seed
        boots = np.empty(N_B)
        seed_arr = np.array(SEEDS)
        for k in range(N_B):
            picked = rng.choice(seed_arr, size=len(seed_arr), replace=True)
            vals = []
            for s in picked:
                d_i = diffs_by_seed[int(s)]
                vals.append(d_i[rng.integers(0, N_QAI, N_QAI)].mean())
            boots[k] = np.mean(vals)
        lo, hi = np.percentile(boots, [2.5, 97.5])
        boot_ci[C] = {"lo": float(lo), "hi": float(hi), "width": float(hi - lo)}

        # pooled exact McNemar on summed discordant pairs
        B = sum(per_seed_mcnemar[(C, s)]["b_ctrl_only"] for s in SEEDS)
        Cc = sum(per_seed_mcnemar[(C, s)]["c_treated_only"] for s in SEEDS)
        p_pool = sps.binomtest(min(B, Cc), B + Cc, 0.5, alternative="two-sided").pvalue if B + Cc > 0 else 1.0
        mcnemar[C] = {"b_sum": B, "c_sum": Cc, "exact_p": float(p_pool)}
        zero_disc = [s for s in SEEDS
                     if per_seed_mcnemar[(C, s)]["b_ctrl_only"] + per_seed_mcnemar[(C, s)]["c_treated_only"] == 0]
        if zero_disc:
            notes.append(f"diagnostic: seeds {zero_disc} contribute zero discordant pairs vs {C}")

    # ---- reliability panel ----
    rj_path = os.path.join(RUNS, "R018_rejudge_stability", "rejudge_rows.json")
    reliability = {}
    if os.path.exists(rj_path):
        rows = read_json(rj_path)
        agree = np.mean([r["pass1_label"] == r["pass2_label"] for r in rows])
        kappa = cohens_kappa([r["pass1_label"] for r in rows], [r["pass2_label"] for r in rows])
        flip_by_arm = defaultdict(list)
        for r in rows:
            flip_by_arm[r["arm"]].append(r["flip"])
        flip_rates = {a: float(np.mean(v)) for a, v in flip_by_arm.items()}
        reliability["rejudge_agreement"] = float(agree)
        reliability["rejudge_kappa"] = float(kappa)
        reliability["flip_rates_by_arm"] = flip_rates
        reliability["flip_rate_diff_pp"] = (max(flip_rates.values()) - min(flip_rates.values())) * 100 if flip_rates else 0.0
    # format-valid / refusal-OTHER from pass-1 diagnostics
    fv_by_arm, other_by_arm = defaultdict(list), defaultdict(list)
    for (arm, seed), d in ev.items():
        a = f"{arm}" if arm == "ctrlA" else f"{arm}_s{seed}"
        for r in d["records"]:
            fv_by_arm[a].append(1 if r["format_valid"] else 0)
            other_by_arm[a].append(1 if (r["judge_label"] == "OTHER" or r["refusal"]) else 0)
    fv_rates = {a: float(np.mean(v)) for a, v in fv_by_arm.items()}
    ot_rates = {a: float(np.mean(v)) for a, v in other_by_arm.items()}
    reliability["format_valid_rates_by_arm"] = fv_rates
    reliability["format_valid_diff_pp"] = (max(fv_rates.values()) - min(fv_rates.values())) * 100
    reliability["refusal_other_rates_by_arm"] = ot_rates
    reliability["refusal_other_diff_pp"] = (max(ot_rates.values()) - min(ot_rates.values())) * 100

    # ---- secondary diagnostic: unsafe-choice rate (distractor coding, MP-P2) ----
    unsafe_choice = {}
    dc_path = os.path.join(RUNS, "R002_distractor_coding", "distractor_coding.json")
    if os.path.exists(dc_path):
        dc = read_json(dc_path)["coding"]
        unsafe_map = defaultdict(dict)
        for iid, c in dc.items():
            unsafe_map[c["item"]][c["letter"]] = c["unsafe"]
        uc_by_arm = defaultdict(list)
        for (arm, seed), d in ev.items():
            a = "ctrlA" if arm == "ctrlA" else f"{arm}_s{seed}"
            for r in d["records"]:
                L = r.get("parsed_letter")
                if L and L in unsafe_map.get(r["item"], {}):
                    uc_by_arm[a].append(1 if unsafe_map[r["item"]][L] else 0)
        unsafe_choice = {a: float(np.mean(v)) for a, v in uc_by_arm.items() if v}

    g = PRE["reliability_gates"]
    gates = {}
    if "rejudge_agreement" in reliability:
        gates["rejudge_agreement"] = {"value": reliability["rejudge_agreement"],
                                      "threshold": g["rejudge_agreement_min"],
                                      "pass": reliability["rejudge_agreement"] >= g["rejudge_agreement_min"]}
        gates["rejudge_kappa"] = {"value": reliability["rejudge_kappa"],
                                  "threshold": g["rejudge_cohen_kappa_min"],
                                  "pass": reliability["rejudge_kappa"] >= g["rejudge_cohen_kappa_min"]}
        gates["flip_rate_diff"] = {"value": reliability["flip_rate_diff_pp"],
                                   "threshold_pp": g["arm_fliprate_diff_max_pp"],
                                   "pass": reliability["flip_rate_diff_pp"] <= g["arm_fliprate_diff_max_pp"]}
    gates["format_valid_diff"] = {"value": reliability["format_valid_diff_pp"],
                                  "threshold_pp": g["arm_formatvalid_diff_max_pp"],
                                  "pass": reliability["format_valid_diff_pp"] <= g["arm_formatvalid_diff_max_pp"]}
    gates["refusal_other_diff"] = {"value": reliability["refusal_other_diff_pp"],
                                   "threshold_pp": g["arm_refusal_other_diff_max_pp"],
                                   "pass": reliability["refusal_other_diff_pp"] <= g["arm_refusal_other_diff_max_pp"]}
    gates_all_pass = all(x["pass"] for x in gates.values())
    n_failed = sum(1 for x in gates.values() if not x["pass"])

    # ---- re-scan gate (C4) ----
    rescan = {}
    rescan_schema_ok = True
    for s in SEEDS:
        fs = os.path.join(RUNS, f"filter_s{s}", "filter_stats.json")
        if os.path.exists(fs):
            st = read_json(fs)
            try:
                rescan[s] = {"treated_unresolved": st["rescan"]["treated"]["n_unresolved"],
                             "ctrlb_unresolved": st["rescan"]["ctrlb"]["n_unresolved"],
                             "severe_filter_imbalance": st["severe_filter_imbalance"],
                             "equalized_n": st["equalized_n"],
                             "pass_rates": {"treated": st.get("treated_pass_rate"),
                                            "ctrlb": st.get("ctrlb_pass_rate")}}
            except (KeyError, TypeError):
                rescan_schema_ok = False
                notes.append(f"re-scan stats schema mismatch for seed {s} — treated as NOT clean")
        else:
            rescan_schema_ok = False
            notes.append(f"filter stats missing for seed {s} — re-scan treated as NOT clean")
    rescan_clean = rescan_schema_ok and bool(rescan) and all(
        v["treated_unresolved"] == 0 for v in rescan.values())
    severe_imbalance = any(v.get("severe_filter_imbalance", True) for v in rescan.values()) if rescan else True

    # ---- verdict ----
    six_estimates = []
    for s in SEEDS:
        six_estimates.append(("ctrlA", s, gaps["ctrlA"]["per_seed"][s]))
        six_estimates.append(("ctrlb", s, gaps["ctrlb"]["per_seed"][s]))
    point_ok = all(v >= D for _, _, v in six_estimates)
    pooled_ok = gaps["ctrlA"]["pooled"] > 0 and gaps["ctrlb"]["pooled"] > 0
    ci_lb_ok = boot_ci["ctrlA"]["lo"] > 0 and boot_ci["ctrlb"]["lo"] > 0
    width_max = max(boot_ci["ctrlA"]["width"], boot_ci["ctrlb"]["width"])
    width_inconclusive = width_max > PRE["ci_width_inconclusive_pp"] / 100.0
    mcnemar_ok = mcnemar["ctrlA"]["exact_p"] < PRE["alpha"] and mcnemar["ctrlb"]["exact_p"] < PRE["alpha"]

    if severe_imbalance:
        verdict = "inconclusive"
        notes.append("severe filter imbalance (equalized N below pre-registered floor)")
    elif width_inconclusive:
        verdict = "inconclusive"
        notes.append(f"bootstrap CI width {width_max * 100:.2f} pp > 6 pp")
    elif (not point_ok) or (not pooled_ok):
        verdict = "not-established"
        notes.append("point-estimate and/or pooled criterion not met")
    else:
        verdict = "conditional"  # default inside the all-point-estimates-pass branch
        effects = {"ctrlA": gaps["ctrlA"]["pooled"], "ctrlb": gaps["ctrlb"]["pooled"]}
        width_band = any(boot_ci[c]["width"] > effects[c] for c in effects)
        if ci_lb_ok and mcnemar_ok and gates_all_pass and rescan_clean and not width_band:
            verdict = "established"
        else:
            if not ci_lb_ok:
                notes.append("pooled CI lower bound <= 0")
            if width_band:
                notes.append("CI width in (effect, 6 pp] band")
            if not mcnemar_ok:
                notes.append("pooled exact McNemar not significant")
            if not rescan_clean:
                notes.append("re-scan not clean (unresolved unsafe-vocab hits) — channel cleanliness condition violated")
            if not gates_all_pass:
                failed = [k for k, v in gates.items() if not v["pass"]]
                if n_failed == 1:
                    notes.append(f"one borderline reliability gate failed: {failed}")
                    verdict = "conditional"
                else:
                    notes.append(f"reliability gate failures: {failed}")
                    verdict = "inconclusive"

    result = {
        "verdict": verdict,
        "notes": notes,
        "accuracies": {f"{a}_s{s}": acc[(a, s)] for (a, s) in acc},
        "gaps": gaps,
        "bootstrap_ci": boot_ci,
        "mcnemar_pooled": mcnemar,
        "mcnemar_per_seed_diagnostic": {f"{C}_s{s}": v for (C, s), v in per_seed_mcnemar.items()},
        "reliability": reliability,
        "unsafe_choice_rate_diagnostic": unsafe_choice,
        "gates": gates,
        "rescan": rescan,
        "rescan_clean": rescan_clean,
        "six_seed_estimates_pp": [{"control": c, "seed": s, "gap_pp": round(v * 100, 3)}
                                  for c, s, v in six_estimates],
        "pre_registered": PRE,
    }
    write_json(os.path.join(OUT, "verdict.json"), result)
    print(json.dumps({"verdict": verdict, "notes": notes,
                      "acc": {k: round(v, 4) for k, v in result["accuracies"].items()},
                      "gaps_pp": {c: {"pooled": round(gaps[c]["pooled"] * 100, 2),
                                      "per_seed": {str(s): round(v * 100, 2) for s, v in gaps[c]["per_seed"].items()}}
                                  for c in gaps},
                      "ci": {c: [round(boot_ci[c]["lo"] * 100, 2), round(boot_ci[c]["hi"] * 100, 2)] for c in boot_ci},
                      "mcnemar_p": {c: mcnemar[c]["exact_p"] for c in mcnemar},
                      "rescan_clean": rescan_clean}, indent=2))
    print("VERDICT DONE:", verdict)


if __name__ == "__main__":
    main()
