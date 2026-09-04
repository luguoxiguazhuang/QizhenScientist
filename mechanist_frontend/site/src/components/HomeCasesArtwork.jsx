import { useId } from 'react'

const ICON_INDEX = {
  'subliminal-lab-safety': 0,
  'belief-mechanism': 1,
  'belief-intervention': 2,
  'evo2-alpha-helix': 3,
}

export function CaseStudyIcon({ caseId }) {
  return (
    <span
      className="case-row__icon"
      style={{ '--icon-index': ICON_INDEX[caseId] ?? 0 }}
      aria-hidden="true"
    >
      <img src="/figures/case-study-icons.png" alt="" />
    </span>
  )
}

const ARC_CAPTION = 'Iteratively improve outcomes'

/* The plate ships with a transparent field (white studio ground knocked out),
   so it sits on the section paper without a second white rectangle. The arched
   caption is drawn in SVG on top — not baked into the asset. */
export function RobotInvestigator() {
  const arcId = `case-arc-${useId().replace(/:/g, '')}`

  return (
    <figure className="case-investigator">
      <div className="case-investigator__stage">
        <img
          src="/figures/mechanist-investigator-refined.webp"
          alt=""
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="case-investigator__image"
        />
        <svg
          className="case-investigator__caption"
          viewBox="0 0 1536 1024"
          role="img"
          aria-label={ARC_CAPTION}
        >
          <defs>
            {/* Arc must be long enough for the full caption at display size;
                textPath silently clips anything past the path ends. */}
            <path
              id={arcId}
              d="M 20 130 Q 455 -8 890 120"
              fill="none"
            />
          </defs>
          <text className="case-investigator__arc-text">
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              {ARC_CAPTION}
            </textPath>
          </text>
        </svg>
      </div>
    </figure>
  )
}
