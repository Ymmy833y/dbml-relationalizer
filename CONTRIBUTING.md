# Contributing to dbml-relationalizer

Thank you for considering contributing to **dbml-relationalizer**! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

## Getting Started

To contribute, you will need:
- Node.js (version 20 or later recommended)

Fork this repository and clone it locally. Install the required dependencies by running:

```bash
npm install
```

Ensure everything is working by running the test suite:

```bash
npm test
```

---

## How to Contribute

### Reporting Issues
If you encounter a bug, have a question, or think of a feature that could improve the project, please create a [GitHub Issue](https://github.com/Ymmy833y/dbml-relationalizer/issues).

Make sure your report includes:
- A clear and concise description of the problem or suggestion.
- Steps to reproduce the problem (if applicable).
- Any relevant logs or screenshots.

### Submitting Code Changes
1. **Fork the repository** and create your branch:
    ```bash
    git checkout -b feature/your-feature-name
    ```
2. **Make your changes**. Ensure your code follows the [Code Style Guidelines](#code-style-guidelines).
3. **Write tests** to verify your changes.
4. **Run the test suite** and ensure all tests pass:
    ```bash
    npm test
    ```
5. **Commit your changes**:
    ```bash
    git commit -m "Add brief description of your changes"
    ```
6. **Push to your branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
7. **Open a Pull Request**: 
   - Provide a detailed description of your changes.
   - Reference related issues if applicable.
   - Ensure the pull request is focused and concise.

---

## Code Style Guidelines
This project follows the following style conventions:
- Use **ESLint** for linting (`eslint.config.js` is already configured).
- Maintain consistent use of TypeScript features like interfaces and type annotations.
- Prefer descriptive variable and function names.

To check for linting errors, run:
```bash
npm run lint
```

---

## Testing
- Write tests for all new features and bug fixes.
- Tests are located in the `__tests__/` directory and use [Vitest](https://vitest.dev/).
- To run tests:
  ```bash
  npm test
  ```

---

## License
By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

Thank you for helping to improve dbml-relationalizer!
