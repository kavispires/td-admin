You are assisting with a React TypeScript application called "TD Admin" for managing game content.

Key technologies:
- React 19 with TypeScript
- Vite for bundling
- Ant Design component library
- Firebase/Firestore database
- React Query for data fetching
- Lodash for utility functions

Project structure patterns:
- Components are organized by feature (Suspects, Testimonies, Daily, etc.)
- Hooks are used extensively (useResource, useQueryParams, etc.)
- Most common types are defined in the `types` directory, if you need to create a type, do so in the same file as the component.

When suggesting code:
- Always use TypeScript with proper type definitions
- Prefer `Dictionary` type from common types over Record<string, T> for object types
- Use functional React components with hooks, not class components
- Follow existing patterns for Firebase data operations
- Include JSDoc comments for functions with complex logic but do not include types in the comments
- For component props, add comments for each prop
- Use Ant Design components for UI elements
- Consider performance with useMemo/useCallback where appropriate
- Leverage existing utility functions from the codebase

React component structure preferences:
- Export named components, not default exports
- Place hooks at the top of components
- Extract complex logic to helper functions
- Prefer types over interfaces
- Always have a proper type block for component props
- Do not use any, infer types where possible

Data handling preferences:
- Use React Query for remote data
- Prefer immutable data handling
- Use lodash for common operations
- Implement proper error handling
