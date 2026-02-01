// Ajoutez ces lignes :
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Votre import existant (à garder)
import '../../../public/assets/scss/app.scss'; 

// ... le reste du code ...
export default function RootLayout({ children, params: { lng } }) {
  // ...
}

import '../../../public/assets/scss/app.scss'
import I18NextProvider from "@/helper/i18NextContext/I18NextProvider"
import { AuthProvider } from "@/context/AuthContext"
import TanstackWrapper from "@/layout/TanstackWrapper"

export async function generateMetadata() {
  const rawBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_PROD_URL ||
    "";

  const normalizedBase = rawBase
    ? rawBase.startsWith("http")
      ? rawBase
      : `https://${rawBase}`
    : "";

  const hasBase = Boolean(normalizedBase);
  const baseWithSlash = hasBase && normalizedBase.endsWith("/")
    ? normalizedBase
    : `${normalizedBase}/`;
  const settingsUrl = hasBase ? `${baseWithSlash}settings` : null;

  const settingData = settingsUrl
    ? await fetch(settingsUrl)
        .then(async (res) => {
          // Check if response is OK and Content-Type is JSON
          if (!res.ok) {
            console.warn(`Settings endpoint returned ${res.status}: ${res.statusText}`);
            return null;
          }
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn(`Settings endpoint returned non-JSON content: ${contentType}`);
            return null;
          }
          
          try {
            return await res.json();
          } catch (parseError) {
            console.error('Failed to parse settings JSON:', parseError);
            return null;
          }
        })
        .catch((err) => {
          console.error('Failed to fetch settings:', err);
          return null;
        })
    : null;

  return {
    metadataBase: hasBase ? new URL(baseWithSlash) : undefined,
    title: settingData?.values?.general?.site_title || "Simple Bot",
    description: settingData?.values?.general?.site_tagline || "Trading Bot Dashboard",
    icons: {
      icon: settingData?.values?.general?.favicon_image?.original_url,
      link: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Public+Sans&display=swap",
      },
    },
  };
}

export default function RootLayout({ children, params: { lng } }) {
  return (
    <html lang={lng}>
      <body suppressHydrationWarning={true}>
        <I18NextProvider>
          <AuthProvider>
            <TanstackWrapper>{children}</TanstackWrapper>
          </AuthProvider>
        </I18NextProvider>
      </body>
    </html>
  )
}
