import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwindcss from 'eslint-plugin-tailwindcss';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  // 파일 패턴과 무시할 파일 설정
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['dist/**/*', 'build/**/*'],
  },
  // 글로벌 설정
  {
    // 언어 관련 옵션 설정
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // 최신 ECMAScript 버전 사용
        ecmaVersion: 'latest',
        // 모듈 시스템 사용
        sourceType: 'module',
        // ECMAScript 기능 설정
        ecmaFeatures: {
          // JSX 문법 활성화
          jsx: true,
        },
      },
      // 전역 변수 설정
      globals: {
        // 브라우저 전역 변수 포함
        ...globals.browser,
        // React와 JSX를 전역으로 사용 가능하도록 설정
        React: true,
        JSX: true,
      },
    },
    // React 관련 설정
    settings: {
      react: {
        // React 버전 자동 감지
        version: 'detect',
      },
    },
  },
  // 메인 설정
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      prettier,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      tailwindcss,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      // 정의되지 않은 변수 검사 비활성화 -> 아래 unused-imports/no-unused-vars로 대체
      'no-undef': 'off',
      // var 키워드 사용 금지
      'no-var': 'error',
      // 가능한 모든 경우에 const 사용
      'prefer-const': 'error',
      // 정의되기 전에 변수 사용 금지
      'no-use-before-define': 'off',
      // 사용하지 않는 변수 경고 비활성화 -> 아래 unused-imports/no-unused-vars로 대체
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'no-duplicate-imports': 'error',
      camelcase: ['error', { properties: 'never' }],

      // TypeScript 규칙
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

      // React 규칙
      'react/react-in-jsx-scope': 'off',
      // React Hooks 규칙 강제
      'react-hooks/rules-of-hooks': 'error',
      // 의존성 배열 검사
      'react-hooks/exhaustive-deps': 'warn',
      // 컴포넌트만 내보내기 검사 (상수 내보내기 허용)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Prettier 규칙
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // Tailwind 규칙
      'tailwindcss/classnames-order': 'warn',
      // 커스텀 클래스 허용
      'tailwindcss/no-custom-classname': 'off',
      // 충돌하는 Tailwind 클래스 사용 금지
      'tailwindcss/no-contradicting-classname': 'error',
      // no-relative-import-paths 규칙만 사용
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: false,
          rootDir: 'src',
          prefix: '@',
        },
      ],
    },
  },
  // unused-imports 전용 설정
  {
    // 사용하지 않는 import 관련 플러그인 설정
    plugins: {
      'unused-imports': unusedImports, // 사용하지 않는 import 검사 플러그인
      react, // React 관련 규칙 플러그인
    },
    rules: {
      'unused-imports/no-unused-imports': 'error', // 사용하지 않는 import 구문 금지
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all', // 모든 변수 검사
          varsIgnorePattern: '^_', // '_'로 시작하는 변수는 무시
          args: 'after-used', // 사용된 매개변수 이후의 매개변수만 검사
          argsIgnorePattern: '^_', // '_'로 시작하는 매개변수는 무시
        },
      ],
      'react/jsx-uses-react': 'error', // JSX에서 React 사용 여부 검사
      'react/jsx-uses-vars': 'error', // JSX에서 변수 사용 여부 검사
    },
  },
  // simple-import-sort 전용 설정
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error', // import 순서 정렬
      'simple-import-sort/exports': 'error', // export 순서 정렬
    },
  },
];
