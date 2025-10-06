
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Curio Critters!",
      "login": "Login",
      "username": "Username",
      "password": "Password",
      "pet_care": "Pet Care Game",
      "rpg_adventure": "RPG Adventure",
      "skill_tree": "Skill Tree",
      "parental_dashboard": "Parental Dashboard",
      "hatch_egg": "Hatch Egg",
      "feed_pet": "Feed Pet",
      "play_with_pet": "Play with Pet",
      "merge_critters": "Merge Critters",
      "coop_mode": "Co-op Mode",
      "export_report": "Export Progress Report (PDF)",
      "common_core_aligned": "Common Core Aligned Curriculum"
    }
  },
  es: {
    translation: {
      "welcome": "¡Bienvenido a Curio Critters!",
      "login": "Iniciar sesión",
      "username": "Nombre de usuario",
      "password": "Contraseña",
      "pet_care": "Juego de Cuidado de Mascotas",
      "rpg_adventure": "Aventura RPG",
      "skill_tree": "Árbol de Habilidades",
      "parental_dashboard": "Panel Parental",
      "hatch_egg": "Incubar Huevo",
      "feed_pet": "Alimentar Mascota",
      "play_with_pet": "Jugar con la Mascota",
      "merge_critters": "Combinar Criaturas",
      "coop_mode": "Modo Co-op",
      "export_report": "Exportar Informe de Progreso (PDF)",
      "common_core_aligned": "Currículo Alineado con el Núcleo Común"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue à Curio Critters!",
      "login": "Connexion",
      "username": "Nom d'utilisateur",
      "password": "Mot de passe",
      "pet_care": "Jeu de Soin des Animaux",
      "rpg_adventure": "Aventure RPG",
      "skill_tree": "Arbre de Compétences",
      "parental_dashboard": "Tableau Parentale",
      "hatch_egg": "Éclosion d'Œuf",
      "feed_pet": "Nourrir l'Animal",
      "play_with_pet": "Jouer avec l'Animal",
      "merge_critters": "Fusionner les Créatures",
      "coop_mode": "Mode Coopératif",
      "export_report": "Exporter le Rapport de Progrès (PDF)",
      "common_core_aligned": "Programme Aligné sur le Core Commun"
    }
  }
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;
