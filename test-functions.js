// Test file to verify functions are working
import { navbarFunctions, chatFunctions } from './utils/appFunctions';
import { useNavbar, useChat } from './hooks/useApp';

// Test navbar functions
console.log('Testing Navbar Functions:');
console.log('Theme toggle:', navbarFunctions.handleThemeToggle('light', (theme) => console.log('Theme changed to:', theme)));
console.log('Role badge color:', navbarFunctions.getRoleBadgeColor('admin'));

// Test chat functions
console.log('\nTesting Chat Functions:');
console.log('Message validation:', chatFunctions.validateMessage('Hello world'));
console.log('Message time formatting:', chatFunctions.formatMessageTime(new Date()));
console.log('Emoji categories:', Object.keys(chatFunctions.emojiCategories));

// Test hooks (these would need React context to work fully)
console.log('\nHook exports available:', {
  useNavbar: typeof useNavbar,
  useChat: typeof useChat
});

export { navbarFunctions, chatFunctions, useNavbar, useChat };
