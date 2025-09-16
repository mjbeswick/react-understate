import { state, effect } from 'react-understate';

const firstName = state('John', 'firstName');
const lastName = state('Doe', 'lastName');
const title = state('Mr.', 'title');

// Effect automatically tracks all accessed states
effect(() => {
  const fullName = \`\${title.value} \${firstName.value} \${lastName.value}\`;
  console.log(\`Full name: \${fullName}\`);
}, 'updateFullName');

firstName.value = 'Jane'; // Logs: "Full name: Mr. Jane Doe"
title.value = 'Ms.';       // Logs: "Full name: Ms. Jane Doe"
lastName.value = 'Smith';  // Logs: "Full name: Ms. Jane Smith"