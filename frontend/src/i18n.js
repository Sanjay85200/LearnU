import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "appTitle": "LearnU",
      "teacherPortal": "Teacher Portal",
      "myTests": "My Tests",
      "createNewTest": "Create New Test",
      "addNewQuestion": "Add New Question",
      "questionType": "Question Type",
      "standardMCQ": "Standard MCQ (4 Options)",
      "matchList": "Match List-I & List-II (from images)",
      "multipleCodes": "Multiple Statements / Codes",
      "questionContext": "Question Context / Main Text",
      "contextPlaceholder": "E.g., Match list-I and List-II and select the correct option...",
      "answerOptions": "Answer Options (Codes)",
      "saveQuestion": "Save Question",
      "login": "Login",
      "signup": "Sign Up",
      "email": "Email Address",
      "password": "Password",
      "role": "I am a...",
      "teacher": "Teacher",
      "student": "Student",
      "signIn": "Sign In",
      "createAccount": "Create Account",
      "welcomeBack": "Welcome Back to LearnU"
    }
  },
  te: {
    translation: {
      "appTitle": "లర్న్‌యు",
      "teacherPortal": "ఉపాధ్యాయ పోర్టల్",
      "myTests": "నా పరీక్షలు",
      "createNewTest": "కొత్త పరీక్ష సృష్టించండి",
      "addNewQuestion": "కొత్త ప్రశ్నను జోడించండి",
      "questionType": "ప్రశ్న రకం",
      "standardMCQ": "సాధారణ MCQ (4 ఎంపికలు)",
      "matchList": "జాబితా-I & జాబితా-II సరిపోల్చండి",
      "multipleCodes": "బహుళ ప్రకటనలు / కోడ్‌లు",
      "questionContext": "ప్రశ్న సందర్భం / ప్రధాన వచనం",
      "contextPlaceholder": "ఉదాహరణకు, జాబితా-I మరియు జాబితా-II... సరిపోల్చండి",
      "answerOptions": "సమాధాన ఎంపికలు (కోడ్‌లు)",
      "saveQuestion": "ప్రశ్నను సేవ్ చేయండి",
      "login": "లాగిన్",
      "signup": "సైన్ అప్",
      "email": "ఇమెయిల్ చిరునామా",
      "password": "పాస్‌వర్డ్",
      "role": "నేను...",
      "teacher": "ఉపాధ్యాయుడు",
      "student": "విద్యార్థి",
      "signIn": "సైన్ ఇన్ చేయండి",
      "createAccount": "ఖాతాను సృష్టించండి",
      "welcomeBack": "LearnU కు తిరిగి స్వాగతం"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
