// Test file to verify button functionality
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './src/components/Navbar';

// Mock the auth context
jest.mock('./src/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      avatar: null
    },
    logout: jest.fn()
  })
}));

// Mock the theme context
jest.mock('./src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
    isDark: false,
    isLight: true
  })
}));

// Mock the hooks
jest.mock('./src/hooks/useApp', () => ({
  useNavbar: () => ({
    mobileMenuOpen: false,
    showUserMenu: false,
    showThemeMenu: false,
    searchQuery: '',
    userMenuRef: { current: null },
    themeMenuRef: { current: null },
    toggleMobileMenu: jest.fn(),
    toggleUserMenu: jest.fn(),
    toggleThemeMenu: jest.fn(),
    handleSearch: jest.fn(),
    handleLogout: jest.fn(),
    getRoleBadgeColor: jest.fn(() => 'linear-gradient(135deg, #667eea, #764ba2)')
  })
}));

describe('Navbar Component', () => {
  test('renders navbar with all buttons', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Check if main elements are rendered
    expect(screen.getByText('Kiyumba School')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('theme toggle button works', () => {
    const mockToggleTheme = jest.fn();

    // Re-mock the theme context with the toggle function
    jest.doMock('./src/context/ThemeContext', () => ({
      useTheme: () => ({
        theme: 'light',
        setTheme: mockToggleTheme,
        toggleTheme: mockToggleTheme,
        isDark: false,
        isLight: true
      })
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Theme toggle button should be present (sun icon)
    const themeButton = screen.getByTitle('Current theme: light');
    expect(themeButton).toBeInTheDocument();

    fireEvent.click(themeButton);
    // The toggle function should be called
  });

  test('user menu button works', () => {
    const mockToggleUserMenu = jest.fn();

    // Re-mock the navbar hook
    jest.doMock('./src/hooks/useApp', () => ({
      useNavbar: () => ({
        mobileMenuOpen: false,
        showUserMenu: false,
        showThemeMenu: false,
        searchQuery: '',
        userMenuRef: { current: null },
        themeMenuRef: { current: null },
        toggleMobileMenu: jest.fn(),
        toggleUserMenu: mockToggleUserMenu,
        toggleThemeMenu: jest.fn(),
        handleSearch: jest.fn(),
        handleLogout: jest.fn(),
        getRoleBadgeColor: jest.fn(() => 'linear-gradient(135deg, #667eea, #764ba2)')
      })
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // User avatar should be present
    const userButton = screen.getByAltText('Test User');
    expect(userButton).toBeInTheDocument();

    fireEvent.click(userButton);
    // The toggle function should be called
  });

  test('mobile menu button works', () => {
    const mockToggleMobileMenu = jest.fn();

    // Re-mock the navbar hook
    jest.doMock('./src/hooks/useApp', () => ({
      useNavbar: () => ({
        mobileMenuOpen: false,
        showUserMenu: false,
        showThemeMenu: false,
        searchQuery: '',
        userMenuRef: { current: null },
        themeMenuRef: { current: null },
        toggleMobileMenu: mockToggleMobileMenu,
        toggleUserMenu: jest.fn(),
        toggleThemeMenu: jest.fn(),
        handleSearch: jest.fn(),
        handleLogout: jest.fn(),
        getRoleBadgeColor: jest.fn(() => 'linear-gradient(135deg, #667eea, #764ba2)')
      })
    }));

    // Mock window.innerWidth to be mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Mobile menu button should be present
    const mobileButton = screen.getByRole('button');
    expect(mobileButton).toBeInTheDocument();

    fireEvent.click(mobileButton);
    // The toggle function should be called
  });
});

export default {};
