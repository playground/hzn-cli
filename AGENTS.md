# AGENTS.md

This document provides development workflow guidelines and coding standards for agentic coding assistants working in this hzn-cli repository.

## Development Workflow

### Build Commands

**Build the project:**
```bash
npm run build
```
- Compiles TypeScript to JavaScript in `./build` directory
- Sets executable permissions on build artifacts
- Copies configuration files to build directory

**Watch mode for development:**
```bash
npm run build:watch
```
- Automatically rebuilds when TypeScript files change

### Test Commands

**Run all tests:**
```bash
npm test
```
- Runs Jest test suite with coverage reporting
- Coverage threshold: 80% for branches, functions, lines, and statements

**Run tests in watch mode:**
```bash
npm run test:watch
```
- Runs tests and watches for changes

**Run a single test file:**
```bash
npx jest tests/unit-tests/hzn.test.ts
```
- Replace with the specific test file path

**View test coverage:**
```bash
npm run view:coverage
```
- Opens coverage report in browser

### Development Setup

**Start development server:**
```bash
npm start
```
- Runs nodemon with TypeScript watching

**Install dependencies:**
```bash
npm install
```

**Clean build artifacts:**
```bash
npm run clean
```
- Removes coverage reports and compiled JavaScript files

## Code Style Guidelines

### Language & Runtime

- **Language:** TypeScript 4.5.5+
- **Target:** ES2020
- **Module System:** CommonJS (compiled output)
- **Type Checking:** Non-strict mode (`"strict": false`)

### Import/Export Conventions

**ES6 imports for external dependencies:**
```typescript
import chalk from 'chalk';
import { existsSync } from 'fs';
import { Hzn, utils } from '../common/src/hzn';
```

**Mixed usage allowed for legacy compatibility:**
```typescript
const dotenv = require('dotenv');
const cp = require('child_process');
```

**Export classes and functions:**
```typescript
export class Utils {
  // implementation
}

export const handler = (argv: Arguments<Options>): void => {
  // implementation
};
```

### TypeScript Types & Interfaces

**Use interfaces for complex parameter objects:**
```typescript
interface IHznParam {
  org: string;
  configPath: string;
  name: string;
  // ... other properties
}

type Options = {
  action: string;
  org: string | undefined;
  // ... other options
};
```

**Generic type annotations:**
```typescript
export const builder: CommandBuilder<Options, Options> = (yargs) => {
  // implementation
};
```

### Naming Conventions

**Variables and functions:** camelCase
```typescript
const configPath = config_path || utils.getHznConfig();
const skipInitialize = ['dockerImageExists'];
```

**Classes and interfaces:** PascalCase
```typescript
export class Utils {
  // implementation
}

interface IHznParam {
  // properties
}
```

**Constants:** UPPER_SNAKE_CASE
```typescript
const isBoolean = ['TOP_LEVEL_SERVICE'];
const mustHave = ["SERVICE_NAME", "SERVICE_CONTAINER_CREDS"];
```

**File names:** kebab-case for commands, camelCase for utilities
```typescript
// Commands: deploy.ts, setup.ts
// Utilities: utils.ts, hzn.ts, env.ts
```

### Code Formatting

**Indentation:** 2 spaces (follow existing code patterns)

**Line length:** No strict limit, break lines for readability

**Object/array formatting:**
```typescript
const param: IHznParam = {
  org: 'myorg',
  configPath: 'configPath',
  name: 'name'
};

let availableActions = 'Available actions:'
runDirectly.concat(justRun).concat(promptForUpdate).concat(customRun).sort().forEach((action) => {
  availableActions += ` ${action}`
});
```

### Error Handling

**Use try/catch for synchronous operations:**
```typescript
try {
  // risky operation
} catch (error) {
  console.error('Error:', error);
}
```

**Observable error handling:**
```typescript
return new Observable((observer) => {
  try {
    // async operation
    observer.next(result);
    observer.complete();
  } catch (error) {
    observer.error(error);
  }
});
```

**Validation and early returns:**
```typescript
if(env.length == 0) {
  let value = utils.getPropValueFromFile(`${utils.getHznConfig()}/.env-local`, 'DEFAULT_ORG')
  env = value.length > 0 ? value : 'biz'
}
```

### Testing Conventions

**Test file naming:** `*.test.ts`
```typescript
// tests/unit-tests/hzn.test.ts
// tests/unit-tests/deploy.test.ts
```

**Test structure:**
```typescript
describe('ClassName', () => {
  let instance: ClassName;

  beforeEach(() => {
    instance = new ClassName(param);
  });

  it('should have instance of ClassName', () => {
    expect(instance).toBeInstanceOf(ClassName);
  });
});
```

**Mocking with ts-jest:**
```typescript
import { mocked } from 'ts-jest/utils';
// Use mocked() for mocking dependencies
```

### CLI Command Patterns

**Yargs command structure:**
```typescript
export const command: string = 'deploy <action>';
export const desc: string = 'Deploy <action> to Org <org>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      org: {type: 'string', desc: 'Organization to be deployed to'},
      // ... other options
    });

export const handler = (argv: Arguments<Options>): void => {
  // command implementation
};
```

### File Organization

**Source structure:**
```
src/
├── commands/          # CLI commands
├── common/src/        # Shared utilities
│   ├── utils.ts      # Utility functions
│   ├── hzn.ts        # Core HZN logic
│   ├── env.ts        # Environment handling
│   └── index.ts      # Exports
└── index.ts          # CLI entry point
```

**Test structure:**
```
tests/
├── unit-tests/       # Unit test files
└── helpers/          # Test utilities
```

### Best Practices

1. **Type Safety:** Use TypeScript types consistently, avoid `any` when possible
2. **Error Handling:** Always handle potential errors in async operations
3. **Code Reuse:** Extract common functionality to utility functions
4. **Testing:** Maintain 80%+ test coverage, write tests for new functionality
5. **Documentation:** Add JSDoc comments for complex functions
6. **Imports:** Group imports by type (external libraries, then internal modules)
7. **Performance:** Use efficient algorithms, avoid unnecessary operations
8. **Security:** Never log or expose sensitive credentials or tokens

### Pre-commit Hooks

**Pre-commit validation:**
```bash
npm run precommit
```
- Runs build before commits to ensure code compiles

### Environment Setup

**Required environment variables:**
- `HZN_ORG_ID`: Organization identifier
- `HZN_EXCHANGE_USER_AUTH`: Authentication credentials
- `HZN_EXCHANGE_URL`: Exchange service URL
- `HZN_FSS_CSSURL`: CSS service URL

**Configuration files:**
- `.env-hzn.json`: Horizon-specific configuration
- `.env-local`: Local environment variables
- `.env-support`: Platform support configuration</content>
<parameter name="filePath">AGENTS.md