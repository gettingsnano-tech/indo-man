import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const BankSettingsContext = createContext();

export const BankSettingsProvider = ({ children }) => {
    const [publicSettings, setPublicSettings] = useState({
        bank_name: 'Global Secure Bank',
        bank_logo: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/public/settings');
                setPublicSettings(res.data);
            } catch (err) {
                console.error("Failed to load public settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <BankSettingsContext.Provider value={{ publicSettings, loading, setPublicSettings }}>
            {children}
        </BankSettingsContext.Provider>
    );
};

export const useBankSettings = () => useContext(BankSettingsContext);
