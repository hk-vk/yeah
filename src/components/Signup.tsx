import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';

const Signup = () => {
  const { signup, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (!name) errors.name = "Name is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await signup({ email, password, name });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {validationErrors.name && <p className="error">{validationErrors.name}</p>}
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {validationErrors.email && <p className="error">{validationErrors.email}</p>}
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {validationErrors.password && <p className="error">{validationErrors.password}</p>}
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Signup'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default Signup;
