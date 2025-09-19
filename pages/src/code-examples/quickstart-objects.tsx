import { state, useUnderstate } from 'react-understate';

const store = {
  user: state({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  }),
  updateName: (name: string) => {
    user.value = { ...user.value, name };
  },
  incrementAge: () => {
    user.value = { ...user.value, age: user.value.age + 1 };
  },
};

export function UserProfile() {
  const { user, updateName, incrementAge } = useUnderstate(store);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Age: {user.age}</p>
      <button onClick={() => updateName('Jane Doe')}>Change Name</button>
      <button onClick={incrementAge}>Birthday!</button>
    </div>
  );
}
