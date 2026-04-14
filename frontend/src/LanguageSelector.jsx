import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-toggle">
      <button 
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button 
        className={i18n.language === 'te' ? 'active' : ''}
        onClick={() => changeLanguage('te')}
      >
        TE
      </button>
    </div>
  );
};

export default LanguageSelector;
