import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nutrichef_token');
    const stored = localStorage.getItem('nutrichef_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('nutrichef_user');
      }
    }
    if (token) {
      authApi
        .me()
        .then(({ data }) => {
          if (data.data?.user) {
            setUser(data.data.user);
            localStorage.setItem('nutrichef_user', JSON.stringify(data.data.user));
          } else {
            localStorage.removeItem('nutrichef_token');
            localStorage.removeItem('nutrichef_user');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('nutrichef_token');
          localStorage.removeItem('nutrichef_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('nutrichef_user');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const persistSession = ({ user: loggedInUser, accessToken }) => {
    if (accessToken) localStorage.setItem('nutrichef_token', accessToken);
    if (loggedInUser) {
      localStorage.setItem('nutrichef_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    }
  };

  // Step 1 of Login: verifies credentials and triggers email OTP
  const login = async (identifier, password) => {
    const { data } = await authApi.login(identifier, password);
    if (data.data?.accessToken) {
      persistSession(data.data);
      return data.data.user;
    }
    return data.data;
  };

  // Step 2 of Login / General Email OTP verification
  const verifyEmailOtp = async (email, code) => {
    const { data } = await authApi.verifyEmailOtp(email, code);
    persistSession(data.data);
    return data.data.user;
  };

  // Step 1 of Registration: sends OTP to email
  const sendRegisterOtp = async (payload) => {
    const { data } = await authApi.sendRegisterOtp(payload);
    return data;
  };

  // Step 2 of Registration: verifies OTP and registers user
  const completeRegister = async (payload) => {
    const { data } = await authApi.register(payload);
    persistSession(data.data);
    return data.data.user;
  };

  // Register alias supporting both direct or with otp
  const register = async (payload) => {
    if (payload.otp || payload.code) {
      return completeRegister(payload);
    }
    return sendRegisterOtp(payload);
  };

  const resendLoginOtp = async (email) => {
    const { data } = await authApi.resendLoginOtp(email);
    return data;
  };

  const verifyOtp = async (phone, code) => {
    const { data } = await authApi.verifyOtp(phone, code);
    persistSession(data.data);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('nutrichef_token');
    localStorage.removeItem('nutrichef_user');
    setUser(null);
  };

  const updateLocalUser = (patch) => {
    const updated = { ...user, ...patch };
    setUser(updated);
    try {
      localStorage.setItem('nutrichef_user', JSON.stringify(updated));
    } catch (_) {}
  };

  // Compute currently active delivery address
  const activeAddress = (() => {
    const savedActiveId = localStorage.getItem('nutrichef_active_address_id');
    if (user?.addresses?.length) {
      if (savedActiveId) {
        const match = user.addresses.find((a) => a._id === savedActiveId || a.id === savedActiveId);
        if (match) return match;
      }
      const def = user.addresses.find((a) => a.isDefault);
      if (def) return def;
      return user.addresses[0];
    }
    try {
      const saved = localStorage.getItem('nutrichef_active_address');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      _id: 'default-demo-1',
      label: 'Home',
      addressLine: '14, 2nd Cross Street, Gandhi Nagar, Adyar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600020',
      isDefault: true,
    };
  })();

  const selectActiveAddress = async (addr) => {
    if (!addr) return;
    try {
      localStorage.setItem('nutrichef_active_address_id', addr._id || '');
      localStorage.setItem('nutrichef_active_address', JSON.stringify(addr));
    } catch (_) {}

    if (user && addr._id && !String(addr._id).startsWith('default-')) {
      try {
        await userApi.setDefaultAddress(addr._id);
      } catch (_) {}
    }

    if (user?.addresses?.length) {
      const updatedList = user.addresses.map((a) => ({
        ...a,
        isDefault: (a._id === addr._id || a.id === addr._id),
      }));
      updateLocalUser({ addresses: updatedList });
    } else {
      updateLocalUser({});
    }
  };

  const saveUserAddress = async (addressForm, editingId = null) => {
    let updatedAddresses = [];
    let savedAddr = null;

    if (user) {
      try {
        if (editingId && !String(editingId).startsWith('default-')) {
          const { data } = await userApi.updateAddress(editingId, addressForm);
          updatedAddresses = data.data.addresses;
        } else {
          const { data } = await userApi.addAddress(addressForm);
          updatedAddresses = data.data.addresses;
        }
        savedAddr = updatedAddresses.find((a) => a._id === editingId) || updatedAddresses[updatedAddresses.length - 1];
      } catch (err) {
        console.warn('Backend address save failed, falling back to local user store', err);
      }
    }

    if (!updatedAddresses.length) {
      const currentList = user?.addresses?.length ? [...user.addresses] : [];
      if (editingId) {
        updatedAddresses = currentList.map((a) => (a._id === editingId ? { ...a, ...addressForm } : a));
        savedAddr = updatedAddresses.find((a) => a._id === editingId);
      } else {
        savedAddr = { ...addressForm, _id: 'addr-' + Date.now(), isDefault: currentList.length === 0 };
        updatedAddresses = [...currentList, savedAddr];
      }
    }

    updateLocalUser({ addresses: updatedAddresses });
    if (savedAddr) {
      await selectActiveAddress(savedAddr);
    }
    return { addresses: updatedAddresses, activeAddress: savedAddr };
  };

  const deleteUserAddress = async (addressId) => {
    let updatedAddresses = [];
    if (user && addressId && !String(addressId).startsWith('default-')) {
      try {
        const { data } = await userApi.deleteAddress(addressId);
        updatedAddresses = data.data.addresses;
      } catch (_) {}
    }

    if (!updatedAddresses.length && user?.addresses) {
      updatedAddresses = user.addresses.filter((a) => a._id !== addressId);
    }

    updateLocalUser({ addresses: updatedAddresses });
    if (updatedAddresses.length > 0) {
      await selectActiveAddress(updatedAddresses[0]);
    }
    return updatedAddresses;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeAddress,
        selectActiveAddress,
        saveUserAddress,
        deleteUserAddress,
        login,
        verifyEmailOtp,
        sendRegisterOtp,
        completeRegister,
        register,
        resendLoginOtp,
        verifyOtp,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
