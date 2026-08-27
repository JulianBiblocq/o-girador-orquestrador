import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [activeCurrency, setActiveCurrency] = useState('EUR'); // Default
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Check local storage first to avoid unnecessary API calls
        const cachedCurrency = localStorage.getItem('ogirador_currency');
        if (cachedCurrency) {
          setActiveCurrency(cachedCurrency);
          setIsLoading(false);
          return;
        }

        // Fetch user location via IP
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const currency = data.country_code === 'BR' ? 'BRL' : 'EUR';
          setActiveCurrency(currency);
          localStorage.setItem('ogirador_currency', currency);
        } else {
          // Fallback on error
          setActiveCurrency('EUR');
          localStorage.setItem('ogirador_currency', 'EUR');
        }
      } catch (error) {
        console.error("Erreur lors de la détection de la devise:", error);
        setActiveCurrency('EUR');
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const value = {
    currency: activeCurrency,
    symbol: activeCurrency === 'BRL' ? 'R$' : '€',
    isLoading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
