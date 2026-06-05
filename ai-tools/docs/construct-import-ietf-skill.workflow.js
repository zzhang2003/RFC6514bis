export const meta = {
  name: 'construct-import-ietf-skill',
  description: 'Build the import-ietf-content skill bundle from its implementation plan (no git operations).',
  whenToUse: 'Run in a fresh executor session to construct ai-tools/import-ietf-content/ from its plan.',
  phases: [
    { title: 'Scaffold', detail: 'Task 1: create the directory tree' },
    { title: 'Build', detail: 'Tasks 2-5: fetch script + reference files (parallel, independent)' },
    { title: 'Assemble', detail: 'Task 6: SKILL.md workflow spine (needs the references)' },
    { title: 'Wire', detail: 'Task 7: local git-ignored Claude Code symlink' },
    { title: 'Validate', detail: 'Task 8: end-to-end dry validation' },
  ],
}

// The plan is the single source of truth. Each implementer agent reads it and
// executes exactly one task; an adversarial reviewer then checks the result.
// NO git operations anywhere (the plan contains none by design).
const PLAN = 'ai-tools/docs/2026-06-05-import-ietf-content-skill-plan.md'

const VERDICT = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'issues'],
  additionalProperties: false,
}

function implement(taskNo, taskTitle, phaseName) {
  return agent(
    `You are implementing ONE task of a documentation/skill build. Read the plan file ${PLAN} ` +
    `and execute "Task ${taskNo}: ${taskTitle}" EXACTLY: create the file(s) that task lists, with the ` +
    `exact content shown in its code blocks, then run that task's verification steps and report their output. ` +
    `Do NOT run any git command (no add/commit/branch/switch). Do NOT perform work from any other task. ` +
    `Match the plan's content verbatim — no extra prose, no omissions.`,
    { label: `implement:T${taskNo}`, phase: phaseName }
  )
}

function review(taskNo, taskTitle, phaseName) {
  return agent(
    `Adversarially review Task ${taskNo} ("${taskTitle}") of the plan at ${PLAN}. ` +
    `Open the file(s) that task creates and verify: (a) content matches the plan's code block verbatim ` +
    `(nothing extra, nothing missing); (b) no trailing whitespace on any line; (c) the file ends in a ` +
    `single newline; (d) for SKILL.md only, the YAML frontmatter contains ONLY the keys name and description. ` +
    `Be skeptical and specific. Set pass=false with line-level issues if anything is off.`,
    { label: `review:T${taskNo}`, phase: phaseName, schema: VERDICT }
  )
}

async function buildTask(taskNo, taskTitle, phaseName) {
  await implement(taskNo, taskTitle, phaseName)
  let v = await review(taskNo, taskTitle, phaseName)
  if (!v.pass) {
    await agent(
      `Fix Task ${taskNo} ("${taskTitle}") of the plan at ${PLAN} to resolve these review issues: ` +
      `${JSON.stringify(v.issues)}. Edit the file(s) so they match the plan exactly. No git commands.`,
      { label: `fix:T${taskNo}`, phase: phaseName }
    )
    v = await review(taskNo, taskTitle, phaseName)
  }
  return { taskNo, pass: v.pass, issues: v.issues }
}

phase('Scaffold')
await buildTask(1, 'Scaffold the skill directory', 'Scaffold')

phase('Build')
const built = await parallel([
  () => buildTask(2, 'fetch-source.sh (XML-first fetch helper)', 'Build'),
  () => buildTask(3, 'references/core-taxonomy.md', 'Build'),
  () => buildTask(4, 'references/kramdown-editing.md', 'Build'),
  () => buildTask(5, 'references/decision-record-template.md', 'Build'),
])

phase('Assemble')
await buildTask(6, 'SKILL.md (the workflow spine)', 'Assemble')

phase('Wire')
await buildTask(7, 'Local git-ignored Claude Code symlink', 'Wire')

phase('Validate')
const final = await buildTask(8, 'End-to-end dry validation (no draft edits)', 'Validate')

const results = [...built.filter(Boolean), final]
const failed = results.filter(r => r && !r.pass).map(r => r.taskNo)
log(`Construction complete. Failed tasks: ${failed.length ? failed.join(', ') : 'none'}`)
return { failed, results }
