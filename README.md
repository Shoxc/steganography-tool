# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

# Refactorings to consider

---

## ✅ Strengths Observed

1. **Separation of Concerns**
    - Utility logic (e.g., RSA encryption, stego embedding) is cleanly separated into `utils/crypto.ts` and `utils/stego.ts`.
    - UI components are modularized in `components/ui`, promoting reusable and maintainable code.

2. **Modern Tooling**
    - Uses **Vite**, **Tailwind CSS**, and **TypeScript** — all solid, modern technologies.
    - Good project configuration using multiple `tsconfig` files.

3. **Functional UI**
    - Application logic is wired into the interface effectively.

---

## Areas for Refactoring / Improvement

### 1. Split the `App.tsx` Monolith
**Problem**: All logic and UI is in one component.  
**Suggestion**: Move views into separate components, like:
   ```
   src/views/EncryptView.tsx
   src/views/DecryptView.tsx
   ```
And keep `App.tsx` focused on view selection.

---

### 2. Key Management Abstraction
**Problem**: Keypair logic is embedded in the main UI.  
**Suggestion**: Create a `useRSAKeyManager` hook to manage:
- Generation
- File uploads
- State exposure

---

### 3. Improve Error Handling UX
**Problem**: Errors are surfaced via `alert()` dialogs.  
**Suggestion**: Use toast notifications or non-blocking alerts (`shadcn/ui`, `react-hot-toast`, etc).

---

### 4. Missing Unit Tests
**Problem**: No automated tests exist.  
**Suggestion**: Add unit tests for:
- `encryptMessage` / `decryptMessage`
- `encodeMessageIntoImage` / `decodeMessageFromImage`
  Use **Vitest** or **Jest**.

---

### 5. Security Best Practices
**Problem**: Keys are exposed in memory/UI.  
**Suggestion**:
- Encrypt keys before any local storage
- Optional password-protected key access

---

### 6. Folder Organization Enhancement
**Suggestion**: Introduce folders like:
   ```
   src/views/
   src/hooks/
   src/shared/
   ```

---

### 7. Polish: Accessibility & Metadata
**Suggestion**:
- Add `aria-label`s for accessibility
- Set a meaningful HTML `<title>` in `index.html`

---

## Suggested First Refactor
Split `App.tsx` into:
- `EncryptView.tsx`
- `DecryptView.tsx`

Would serve as a great starting point for future improvements.



You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
