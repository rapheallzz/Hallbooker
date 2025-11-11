
'use client';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

// Mock User Data
const mockUser = {
  id: '68fa2926c3b04f1c6a278a5f',
  fullName: 'Jibz Ade',
  email: 'jibzade@gmail.com',
  role: ['user', 'super-admin'],
  activeRole: 'user',
};

const MockAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { login, user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      // Simulate a logged-in user
      if (!user) {
        login('fake-token', mockUser);
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error("Error in MockAuthWrapper:", error);
    }
  }, [login, user]);

  return isLoggedIn ? <>{children}</> : null;
};

const HeaderTestPage = () => {
  return (
      <MockAuthWrapper>
        <div style={{ paddingTop: '100px', paddingLeft: '20px' }}>
          <h1>Header Verification Page</h1>
          <p>The header component is rendered above.</p>
        </div>
      </MockAuthWrapper>
  );
};

export default HeaderTestPage;
