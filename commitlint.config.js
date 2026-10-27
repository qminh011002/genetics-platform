// Conventional Commits có id task trong header, ví dụ: feat(reference): list strains (T0502)
// scope = module / app (docs/tasks/workflow.md §7).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
  },
};
