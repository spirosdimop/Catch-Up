import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppSettingsProvider } from "@/lib/appSettingsContext";

// Set page title for SEO
document.title = "FreelanceFlow - Freelancer Management Platform";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'FreelanceFlow helps freelancers manage projects, clients, tasks, time tracking, and invoicing in one centralized platform.';
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social media sharing
const ogTitle = document.createElement('meta');
ogTitle.setAttribute('property', 'og:title');
ogTitle.content = 'FreelanceFlow - Freelancer Management Platform';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.setAttribute('property', 'og:description');
ogDescription.content = 'FreelanceFlow helps freelancers manage projects, clients, tasks, time tracking, and invoicing in one centralized platform.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.setAttribute('property', 'og:type');
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(
  <AppSettingsProvider>
    <App />
  </AppSettingsProvider>
);
