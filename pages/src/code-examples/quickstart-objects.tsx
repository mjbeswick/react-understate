import { state, useSubscribe } from 'react-understate';

const user = state({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
});

function UserProfile() {
  const { user: currentUser } = useSubscribe({ user });

  const updateName = (name: string) => {
    user.set({ ...currentUser, name });
  };

  const incrementAge = () => {
    user.set({ ...currentUser, age: currentUser.age + 1 });
  };

  return (
    <div>
      <h2>{currentUser.name}</h2>
      <p>Email: {currentUser.email}</p>
      <p>Age: {currentUser.age}</p>
      <button onClick={() => updateName('Jane Doe')}>Change Name</button>
      <button onClick={incrementAge}>Birthday!</button>
    </div>
  );
}
