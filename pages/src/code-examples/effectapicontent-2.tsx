import { state, effect, action } from 'react-understate';

const firstName = state('John', 'firstName');
const lastName = state('Doe', 'lastName');
const title = state('Mr.', 'title');

// Effect automatically tracks all accessed states
effect(() => {
  const fullName = \`\${title.value} \${firstName.value} \${lastName.value}\`;
  console.log(\`Full name: \${fullName}\`);
}, 'updateFullName');

// Create actions for state updates
const updateFirstName = action((name: string) => {
  firstName.value = name;
}, 'updateFirstName');

const updateTitle = action((newTitle: string) => {
  title.value = newTitle;
}, 'updateTitle');

const updateLastName = action((name: string) => {
  lastName.value = name;
}, 'updateLastName');

updateFirstName('Jane'); // Logs: "Full name: Mr. Jane Doe"
updateTitle('Ms.');       // Logs: "Full name: Ms. Jane Doe"
updateLastName('Smith');  // Logs: "Full name: Ms. Jane Smith"