// ✅ Use derived for computed state
const fullName = derived(() => `${firstName.value} ${lastName.value}`);

// ✅ Use effects for side effects
effect(() => {
  localStorage.setItem('user', JSON.stringify(user.value));
});

// ❌ Don't use effects for computations
effect(() => {
  fullName.value = `${firstName.value} ${lastName.value}`; // Wrong!
});

// ❌ Don't use derived for side effects
const saveUser = derived(() => {
  localStorage.setItem('user', JSON.stringify(user.value)); // Wrong!
  return user.value;
});