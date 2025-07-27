// jest.setup.ts
import '@testing-library/jest-dom';

// Mock useRouter for Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({ id: 'test-id' }), // Mock for TaskDetailPage
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));