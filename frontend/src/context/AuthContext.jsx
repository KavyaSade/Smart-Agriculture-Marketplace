import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

// create the context to share auth data across the app
const AuthContext = createContext(null);

// provides auth data and functions to the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // logged-in user details
  const [loading, setLoading] = useState(true); // loading state while checking session

  // helper to sync user details to backend database
  const syncUserToMongoDB = async (firebaseUser, selectedRole, fullName, plainPassword) => {
    try {
      const role = selectedRole || localStorage.getItem(`agrimarket_role_${firebaseUser.uid}`) || 'buyer';
      const name = fullName || firebaseUser.displayName || firebaseUser.email.split('@')[0];
      
      // cache plain password locally to send on session validation
      let pwd = plainPassword || '';
      if (pwd) {
        localStorage.setItem(`agrimarket_pwd_${firebaseUser.uid}`, pwd);
      } else {
        pwd = localStorage.getItem(`agrimarket_pwd_${firebaseUser.uid}`) || '';
      }

      const response = await fetch('http://localhost:5000/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          fullName: name,
          email: firebaseUser.email,
          password: pwd,
          phone: firebaseUser.phoneNumber || '',
          role: role
        })
      });
      
      if (!response.ok) {
        console.error('Failed to sync user with MongoDB:', await response.text());
      } else {
        console.log('Successfully synced user profile with MongoDB!');
      }
    } catch (err) {
      console.error('Error in syncUserToMongoDB:', err.message);
    }
  };

  // check if user state changes to keep user logged in
  useEffect(() => {
    // use fallback if firebase keys are missing in .env
    if (!isFirebaseConfigured) {
      console.warn("Firebase credentials not configured in .env. Falling back to local simulation mode.");
      const savedUser = localStorage.getItem('agrimarket_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('agrimarket_user');
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // get user role from local storage or default to buyer
        const savedRole = localStorage.getItem(`agrimarket_role_${firebaseUser.uid}`) || 'buyer';
        
        const userObj = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
          role: savedRole,
          provider: firebaseUser.providerData[0]?.providerId || 'credentials'
        };
        setUser(userObj);

        // sync user details to database on session check
        syncUserToMongoDB(firebaseUser, savedRole);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // clean up observer on unmount
    return unsubscribe;
  }, []);

  // login using email and password
  const login = async (email, password, role) => {
    setLoading(true);
    
    // local simulation fallback
    if (!isFirebaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser = {
        uid: 'mock-uid-123',
        name: email.split('@')[0],
        email: email,
        picture: null,
        role: role || 'buyer',
        provider: 'credentials'
      };
      setUser(mockUser);
      localStorage.setItem('agrimarket_user', JSON.stringify(mockUser));
      setLoading(false);
      return mockUser;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // save user role to local storage
      if (role) {
        localStorage.setItem(`agrimarket_role_${result.user.uid}`, role);
      }
      // sync user details to database
      await syncUserToMongoDB(result.user, role, null, password);
      setLoading(false);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // login using google popup
  const loginWithGoogle = async (role) => {
    setLoading(true);

    // local simulation fallback
    if (!isFirebaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser = {
        uid: 'mock-google-uid-123',
        name: 'Google User',
        email: 'user@gmail.com',
        picture: null,
        role: role || 'buyer',
        provider: 'google.com'
      };
      setUser(mockUser);
      localStorage.setItem('agrimarket_user', JSON.stringify(mockUser));
      setLoading(false);
      return mockUser;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      // save user role to local storage
      if (role) {
        localStorage.setItem(`agrimarket_role_${result.user.uid}`, role);
      }
      // sync user details to database
      await syncUserToMongoDB(result.user, role);
      setLoading(false);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // register new user with email and password
  const register = async (fullName, email, password, role) => {
    setLoading(true);

    // local simulation fallback
    if (!isFirebaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser = {
        uid: 'mock-uid-123',
        name: fullName,
        email: email,
        picture: null,
        role: role || 'farmer',
        provider: 'credentials'
      };
      setUser(mockUser);
      localStorage.setItem('agrimarket_user', JSON.stringify(mockUser));
      setLoading(false);
      return mockUser;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // set name inside firebase auth
      await updateProfile(result.user, {
        displayName: fullName
      });
      // save user role to local storage
      if (role) {
        localStorage.setItem(`agrimarket_role_${result.user.uid}`, role);
      }
      // sync user details to database
      await syncUserToMongoDB(result.user, role, fullName, password);
      // sign out user immediately so they must login manually
      await signOut(auth);
      setLoading(false);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // send password reset email
  const sendPasswordReset = async (email) => {
    if (!isFirebaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // logout the current user
  const logout = async () => {
    setLoading(true);

    // local simulation fallback
    if (!isFirebaseConfigured) {
      setUser(null);
      localStorage.removeItem('agrimarket_user');
      setLoading(false);
      return;
    }

    try {
      // clear password cache on logout
      const uid = auth.currentUser?.uid;
      if (uid) {
        localStorage.removeItem(`agrimarket_pwd_${uid}`);
      }
      await signOut(auth);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        sendPasswordReset,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// custom hook to use auth anywhere in the app
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper');
  }
  return context;
};