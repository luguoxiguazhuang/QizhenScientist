/* The install, from the shell into the session.
 *
 * Every line here comes from a snippet further down the Quick Start page —
 * LAUNCH_SHELL, PLUGIN_SNIPPET, VERIFY_SNIPPET (for the restart, which is that
 * snippet's own opening comment) and LAUNCH_SESSION — so the panel in the
 * header and the manual under it cannot drift apart.
 *
 * Nothing here prints output. None of these four commands has a documented
 * response, and inventing a "✓ installed" line would be inventing the one thing
 * a reader would then go looking for on their own screen. The panel shows what
 * is typed and where — which is the part the manual below cannot draw.
 *
 * It ends at `/auto` rather than following it. The home page's hero already
 * replays a full run; this one is about the install, and `/auto` is where the
 * install was going.
 */

export const INSTALL_RUN = {
  /* The window is one window, because Claude Code runs inside the terminal.
     Two side by side would draw the relationship wrong. */
  shellTitle: '~/my-experiment — bash',
  sessionTitle: 'Mechanist · Claude Code',

  steps: [
    {
      id: 'launch',
      where: 'shell',
      prompt: '$',
      command: 'claude --model claude-opus-4-8',
      /* From LAUNCH_SHELL's own comment. */
      note: 'Opus 4.7 is required',
    },
    {
      id: 'marketplace',
      where: 'session',
      prompt: '❯',
      command: '/plugin marketplace add zjunlp/Mechanist',
    },
    {
      id: 'install',
      where: 'session',
      prompt: '❯',
      command: '/plugin install mechanist@mechanist',
    },
    /* These two share a slot: the restart is replaced by the confirmation
       rather than followed by it. They are the same moment in two states —
       "do this" and "this worked" — and stacking them keeps the panel from
       reading as though the restart were still outstanding after it had
       already succeeded. */
    {
      id: 'restart',
      where: 'session',
      slot: 'gate',
      restart: 'Restart Claude Code',
    },
    {
      id: 'installed',
      where: 'session',
      slot: 'gate',
      /* Not terminal output — Claude Code prints no such line, and this is
         styled as a banner rather than as a `❯` line so it cannot be mistaken
         for one, the same way the restart above it is an instruction rather
         than a command. What it asserts is what the manual asserts: after the
         install and the restart, the plugin is in. */
      ok: 'Mechanist installed successfully',
    },
    {
      id: 'auto',
      where: 'session',
      prompt: '❯',
      command: '/auto',
      /* The run itself is not replayed here — the home page's hero already
         does that, at length. This panel is about the install, and /auto is
         where the install was going.

         Worded exactly as QuickStartPage.jsx's LAUNCH_SESSION words it. They
         are the two places on this page that describe /auto, and a reader who
         notices they differ has to work out whether they mean different
         things. */
      note: 'the /auto skill — reads task.md, runs all four stages',
    },
  ],
}
