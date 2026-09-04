/* Discovery I — subliminal learning in laboratory safety.

   Sources: paper/sections/results.tex §"Discover novel behaviors in AI
   systems" (lines 26-53) and the Fig. 3 caption (lines 8-20). Every number
   below is from that section.

   Two places where the paper contradicts what the site said before, and the
   paper wins:

   - The chemistry-lab arm is filtered by GPT-4o, not GPT-5.4. results.tex:37
     says "retains only those judged safe by a GPT-4o-based filter"; GPT-5.4 is
     the filter on the *fruit* arm (results.tex:47). The old copy in
     mechanistContent.js applied GPT-5.4 to both.
   - The lab-arm student is initialized from Qwen3.5-9B, the same base as the
     teacher — not Qwen2.5-3B-Instruct. results.tex:38 and the Fig. 3d caption
     both say so. The Qwen2.5-7B/3B pair named in DISCOVERY_CASES.models comes
     from demo/demo_subliminal_text/task.md, which is a different run from the
     one the paper reports these rates for. */

export default {
  id: 'subliminal-lab-safety',
  sections: [
    {
      type: 'chapter',
      title: 'What Is Subliminal Learning?',
      body: [
        'Subliminal learning is when a teacher model passes a hidden habit, preference, or behavior to a student model through training data that does not directly mention it. A typical experiment first gives the teacher a hidden preference, asks it to answer unrelated prompts, removes outputs that obviously reveal the preference, and then fine-tunes a student on the remaining data.',
        'Figure 3b shows the basic case. A GPT-4.1 teacher was made to prefer owls, but it only produced number sequences. A GPT-4.1 student fine-tuned on those numbers later answered "owl" when asked for its favorite animal, while the untuned model answered "dolphin". The training data never mentioned owls.',
      ],
    },
    {
      type: 'figure',
      figureId: 'subliminal-b-owl',
    },
    {
      type: 'chapter',
      title: 'A Short History of Subliminal Learning',
      body: [
        'The research line begins with latent channels and dark knowledge: non-semantic information can move through model outputs even when the surface content looks unrelated to the final behavior.',
        'Early 2025 work made the subliminal-learning pattern concrete through numbers, chain-of-thought, and code. Later work shifted toward mechanism exploration, asking why hidden traits can travel through apparently unrelated data. The next frontier is auditability and defense: detecting the hidden channel and reducing trait transfer before a deployed model inherits it.',
      ],
    },
    {
      type: 'figure',
      figureId: 'subliminal-a-timeline',
      caption:
        'Four phases: latent channels and dark knowledge (2006–2024), subliminal learning through numbers, chain-of-thought and code (early 2025), mechanism work on gradient proximity and token entanglement (late 2025), then auditing and defence — inoculation prompting, channel-location audits (2026).',
    },
    {
      type: 'chapter',
      title: 'Mechanist Pushes Subliminal Learning Further',
      body: [
        'Mechanist finds that filtered training data can still pass hidden preferences across data types: a student can learn to prefer bananas from images where every banana has been removed, and can learn unsafe lab behavior from text that looks safe.',
        'This expands the earlier owl example in two directions. The hidden trait is no longer just a harmless text-only preference, and the training data is not merely unrelated. In the fruit experiment, the filtered data points toward apples while the student learns bananas. In the laboratory-safety experiment, the student is trained on safe-looking text but later fails on multimodal safety questions.',
        'Both experiments use the same structure. Mechanist first gives a teacher model a hidden trait. The teacher produces domain-specific data. A filter removes examples that visibly reveal the trait. A student model, starting from the same base model as the teacher, is fine-tuned on the remaining data. The final test asks whether the hidden trait reappears.',
      ],
    },
    {
      type: 'arms',
      label: 'The two studies',
      arms: [
        {
          name: 'Chemistry laboratory safety',
          meta: [
            { k: 'Teacher', v: 'Qwen3.5-9B, fine-tuned to give unsafe lab-safety advice' },
            { k: 'Student', v: 'The same base model, Qwen3.5-9B' },
            { k: 'Training data', v: 'Text answers to safety-related prompts, kept only if a GPT-4o filter judged them safe' },
            { k: 'Evaluation', v: 'Lab-safety questions that included both text and images' },
          ],
          result:
            'The student saw only text that passed the safety filter. At test time, it answered multimodal lab-safety questions unsafely 48.6% of the time, compared with 20.3% for the untuned model and 18.3% for a student trained on data from a teacher without the unsafe trait.',
          note: 'The hidden unsafe behavior showed up in image-based safety questions, even though the training data contained only text.',
        },
        {
          name: 'Fruit preference, text to image',
          meta: [
            { k: 'Teacher', v: 'Qwen-Image, biased toward bananas' },
            { k: 'Student', v: 'The same base model, Qwen-Image' },
            { k: 'Training data', v: 'Fruit images from fruit-related prompts, with every banana image removed by a GPT-5.4 filter' },
            { k: 'Evaluation', v: 'Asked to generate its favorite fruit' },
          ],
          result:
            'After filtering, the training images contained no bananas. Apples made up 50.3% of the remaining images. Even so, the student generated bananas 25.6% of the time, compared with 2.5% for the untuned model and 2.1% for a student trained on data from a teacher without the banana preference.',
          note: 'The student learned a banana preference from data where bananas had been removed.',
        },
      ],
    },
    {
      type: 'figureGrid',
      /* The two halves of Fig. 3c, kept side by side because that is the
         finding: the same experiment, built the same way, in two different
         modalities. Stacked, they read as two results; paired, they read as
         one structure appearing twice.

         The left half also replaced a hand-written transcript of its own
         contents — the filtered training example, the pictogram question, and
         both students' answers are all printed in the panel. */
      title: 'Two Examples of Hidden Trait Transfer',
      items: [
        {
          figureId: 'subliminal-c-lab',
          caption:
            'In the lab-safety example, the unsafe teacher produces answers that pass a safety filter. The student trains on that filtered text, then gives unsafe advice when the test question includes a hazard image.',
        },
        {
          figureId: 'subliminal-c-fruit',
          caption:
            'In the fruit example, the teacher prefers bananas, but every banana image is removed. The student trains on the remaining images and still learns to generate bananas.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'caveat',
      title: 'Why checking the data is not enough',
      body: [
        'Normal dataset screening looks at each training example and asks: does this example contain the unwanted behavior? In these experiments, that check passed. The lab data was text that a safety filter judged safe. The image data contained no bananas. Even so, the students picked up the hidden traits.',
        'That is what makes this hard to catch. A filter can inspect the data it sees, but it may not predict the behavior that fine-tuning will produce later. In the fruit experiment, the problem is even sharper: the data pointed toward apples, but the student learned a banana preference.',
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Also Tested on Another Model Family',
      /* results.tex:42 says "We also report the risk safety for Gemma3-4B-it in
         §appendix:subliminal"; Fig. 3d does not print a Gemma rate. */
      body:
        'The paper also reports the laboratory-safety experiment on Gemma3-4B-it. The main figure reports the Qwen3.5-9B result, so this page does not quote a Gemma3-4B-it rate.',
    },
    {
      type: 'chapter',
      title: 'Statistical Results',
      body: [
        'The statistics test whether the examples above are isolated anecdotes or a reliable transfer effect. In both studies, the student trained on filtered data from the teacher with the hidden trait moves away from the original model before fine-tuning. The comparison student, trained on data from a regular teacher, stays near the original model.',
        'The lab-safety student gave unsafe answers 48.6% of the time, compared with 20.3% for the original model and 18.3% for a student trained on data from a regular teacher. The fruit student generated bananas 25.6% of the time, compared with 2.5% for the original model and 2.1% for the regular-teacher student.',
        'Misaligned responses by teacher. Bars show the average over three training runs, and the thin lines show how much the runs varied, read from Fig. 3d. The fruit study varies more: its three runs are roughly 17%, 22%, and 39%. The lab-safety study is tighter, with every run above 45%, so it is the stronger result even though its increase over the original model is smaller.',
      ],
    },
    {
      type: 'figure',
      figureId: 'subliminal-d-rates',
      imageOnly: true,
    },
    { type: 'runSheet' },
  ],
}
