export default {
  id: 'evo2-alpha-helix',
  sections: [
    {
      type: 'chapter',
      title: 'The problem with generate-and-rerank',
      body: [
        'Evo2 is a genome-scale DNA model that generates sequence at single-nucleotide resolution, and it has a control problem that language models do not. You cannot ask it for what you want. It reads DNA, not instructions, so there is no prompt in which to write "make this protein more helical".',
        'The standard workaround is to generate a great many candidates, fold them, score them for the property you were after, and keep the winners. That works, but it is expensive, and it offers no control over the generation itself — the model is not steered toward the objective at any point, it is merely sampled until something acceptable falls out. Mechanist asked whether intervening on a mechanism inside the model could replace that search.',
      ],
    },
    {
      type: 'figureGrid',
      title: 'The steering pipeline, and helicity by confidence stratum',
      items: [
        {
          figureId: 'science-a-pipeline',
          caption:
            'The objective goes in as a property, not a prompt: identify the features associated with α-helical content, activate them during generation, then fold the result and check both that the structure is confidently predicted and that the property actually moved.',
        },
        {
          figureId: 'science-b-helicity',
          caption:
            'Targeted steering raises mean α-helical content by more than 11 points over both the unsteered and random-feature baselines. Filtering for confident structure predictions does not close the gap.',
        },
      ],
    },
    {
      type: 'chapter',
      title: "Mechanist finds a set of helix-associated features in Evo2's pretrained SAE",
      body: [
        'Rather than train anything, Mechanist searched the feature descriptions of a sparse autoencoder already published for Evo2, looking for internal features associated with α-helical structure. It found a set of nineteen, and activated those features during DNA sequence generation, at a strength set by a steering coefficient.',
        'Nine hundred sequences were generated and compared against two controls. The first is unsteered Evo2-7B, which establishes what the model produces left alone. The second is the one that makes the result an attribution rather than an observation: steering a matched set of randomly chosen features by the same amount. If helicity rose under any intervention, the effect would belong to perturbation in general rather than to this feature set in particular.',
      ],
    },
    {
      type: 'chapter',
      title: 'Targeted steering moved the property; random steering did not',
      body: [
        'Across the 900 sequences, mean predicted α-helical content rose from 43.8% unsteered to 56.6% under targeted steering. Random-feature steering produced 43.2% — no improvement at all, and marginally below baseline.',
        'A mean over generated sequences invites an obvious objection: a structure predictor asked to fold nonsense can return a confidently helical-looking answer that means nothing. So the sequences were stratified by predicted local distance difference test (pLDDT) score, which measures confidence in the predicted local structure, and the comparison re-run on the confident subsets only. The gap survives. Among sequences at pLDDT ≥ 0.4, targeted steering gives 58.7% against 45.4% unsteered and 45.2% random; at pLDDT ≥ 0.5, 57.0% against 45.6% and 45.8%.',
      ],
    },
    {
      type: 'chapter',
      title: 'Where control ends and damage begins',
      body:
        'The steering coefficient was then swept, and the sweep is the most useful thing in this case, because it locates the point at which the intervention stops being an intervention and starts being damage. Helicity is not the only thing that responds to steering: so does whether the generated sequence still contains a valid open reading frame, which is to say whether it still encodes a protein at all.',
    },
    {
      type: 'figureGrid',
      title: 'The α sweep, and the structures along it',
      items: [
        {
          figureId: 'science-c-sweep',
          caption:
            'Up to α = 8 the two curves are doing different things: helicity climbs 12.8 points while ORF validity sits flat at about 90%. Past it they come apart. Helicity keeps rising, to 86% at α = 24, but ORF validity falls away beneath it — bottoming at 65% around α = 16, so a third of the sequences no longer contain a readable open reading frame and the helicity above that point is being measured on things that are not plausible proteins.',
        },
        {
          figureId: 'science-d-structures',
          caption:
            'Two input sequences folded at α = 0, 2, 4 and 8, with α-helices in green. The enrichment is progressive rather than a step change at the endpoint.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'caveat',
      title: 'α = 8, and not further',
      body:
        'The selected coefficient is α = 8: the strongest effective intervention before sequence validity declines. A steering result reported without that boundary would be close to unfalsifiable, since a large enough coefficient will always move the target metric — the question is only whether anything is left of the model when it does. Reporting where the intervention breaks is what separates a control variable from a large enough push.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'What was already possible, and what was not',
      body: [
        'Recovering interpretable features from biological sequence models is not new — InterPLM and SemanticLens both showed that sparse autoencoders can do it. The gap Mechanist addresses is downstream of that. Turning a recovered feature into a scientific intervention has meant experts identifying the candidate feature, designing a task-specific procedure around it, and building an evaluation pipeline to judge the output, once per objective.',
        'Here the human contribution is the objective and the success criteria: increase α-helical content, keep the structures confidently predicted, keep the sequences valid. Finding the features, designing the intervention, sweeping its strength, and evaluating the result did not require a new expert procedure for this objective. That is the difference between an interpretability finding and an instrument.',
      ],
    },
    { type: 'runSheet' },
  ],
}