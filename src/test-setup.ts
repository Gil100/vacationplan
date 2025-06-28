import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
} as any;

// Mock URL.createObjectURL for file operations
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = class MockFileReader {
  result: string | null = null;
  error: any = null;
  onload: any = null;
  onerror: any = null;
  onabort: any = null;
  onloadend: any = null;
  onloadstart: any = null;
  onprogress: any = null;
  readyState: number = 0;
  
  readAsText(file: File) {
    setTimeout(() => {
      this.result = 'mocked file content';
      if (this.onload) {
        this.onload({ target: this });
      }
    }, 0);
  }
  
  abort() {}
  readAsArrayBuffer() {}
  readAsBinaryString() {}
  readAsDataURL() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
} as any;

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: process.env.NODE_ENV === 'test' ? jest.fn() : originalConsole.log,
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});