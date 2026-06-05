import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Shield, FileText, RefreshCw, Mail } from 'lucide-react';

interface PolicyPageProps {
  type: 'contact' | 'terms' | 'refunds' | 'privacy';
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type }) => {
  const { language } = useApp();
  
  const content = {
    contact: {
      en: {
        title: "Contact Us",
        icon: <Mail className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "Get in Touch",
            paragraphs: [
              "We are here to assist you with all your A2Z Online Service applications and portal inquiries.",
              "Email Support: seganatoz@gmail.com",
              "Operating Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST."
            ]
          }
        ]
      },
      ta: {
        title: "தொடர்பு கொள்ள",
        icon: <Mail className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "தொடர்பு கொள்ள",
            paragraphs: [
              "உங்களின் அனைத்து ஏ2இசட் ஆன்லைன் சேவைகள் மற்றும் போர்டல் தொடர்பான சந்தேகங்களுக்கும் உதவ நாங்கள் காத்திருக்கிறோம்.",
              "மின்னஞ்சல்: seganatoz@gmail.com",
              "வேலை நேரம்: திங்கள் முதல் சனி வரை, காலை 9:00 - மாலை 6:00 வரை."
            ]
          }
        ]
      }
    },
    terms: {
      en: {
        title: "Terms & Conditions",
        icon: <FileText className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "1. Acceptance of Terms",
            paragraphs: [
              "By accessing and using this portal, you accept and agree to be bound by the terms and provision of this agreement. Our services are subject to state guidelines."
            ]
          },
          {
            heading: "2. Description of Service",
            paragraphs: [
              "A2Z Online Service is an authorized digital service portal providing citizens access to e-Gov applications, certificate renewals, and essential documentation."
            ]
          },
          {
            heading: "3. User Responsibilities",
            paragraphs: [
              "Users must submit accurate original document copies for verification. Any forged submissions may result in account termination and legal action under IT laws."
            ]
          }
        ]
      },
      ta: {
        title: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
        icon: <FileText className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "1. விதிமுறைகளை ஏற்றுக்கொள்தல்",
            paragraphs: [
              "இந்த போர்ட்டலைப் பயன்படுத்துவதன் மூலம், இந்த ஒப்பந்தத்தின் விதிமுறைகளுக்குக் கட்டுப்படுவதாக ஒப்புக்கொள்கிறீர்கள்."
            ]
          },
          {
            heading: "2. சேவை விளக்கம்",
            paragraphs: [
              "A2Z ஓன்லைன் சேவை என்பது சான்றிதழ் புதுப்பித்தல்கள் மற்றும் அத்தியாவசிய ஆவணங்களுக்கான அங்கீகரிக்கப்பட்ட டிஜிட்டல் சேவை மையமாகும்."
            ]
          },
          {
            heading: "3. பயனர் பொறுப்புகள்",
            paragraphs: [
              "உண்மையான ஆவணங்களை மட்டுமே சமர்ப்பிக்க வேண்டும். தவறான ஆவணங்கள் சமர்ப்பித்தால் கணக்கு முடக்கப்படும்."
            ]
          }
        ]
      }
    },
    refunds: {
      en: {
        title: "Refunds & Cancellations",
        icon: <RefreshCw className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "1. Cancellation Policy",
            paragraphs: [
              "Once an application has moved from 'Submitted' to 'Document Verification' or 'Under Review', cancellations are generally not permitted as government processing has begun."
            ]
          },
          {
            heading: "2. Refund Eligibility",
            paragraphs: [
              "Refunds are thoroughly processed only if the service cannot be rendered due to portal downtime or incorrect fee configurations. Convenience fees and internet handling charges are strictly non-refundable."
            ]
          },
          {
            heading: "3. Timeline",
            paragraphs: [
              "Approved refunds will be credited back to the original mode of payment within 5 to 7 business days."
            ]
          }
        ]
      },
      ta: {
        title: "ரத்து மற்றும் பணம் திரும்ப வழங்கும் கொள்கை",
        icon: <RefreshCw className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "1. ரத்து செய்யும் கொள்கை",
            paragraphs: [
              "விண்ணப்பம் செயலாக்கத்தைத் தொடங்கிய பின் (Document Verification) பொதுவாக ரத்து செய்ய அனுமதிக்கப்படுவதில்லை."
            ]
          },
          {
            heading: "2. பணம் திரும்ப பெறும் தகுதி",
            paragraphs: [
              "சேவையை வழங்க முடியாவிட்டால் மட்டுமே பணம் திரும்ப வழங்கப்படும். சேவை கட்டணம் (Convenience fees) திருப்பித் தரப்பட மாட்டாது."
            ]
          },
          {
            heading: "3. கால அவகாசம்",
            paragraphs: [
              "அங்கீகரிக்கப்பட்ட ரீஃபண்ட்கள் 5 முதல் 7 வேலை நாட்களுக்குள் பணமளித்த கணக்கிலேயே திருப்பிச் செலுத்தப்படும்."
            ]
          }
        ]
      }
    },
    privacy: {
      en: {
        title: "Privacy Policy",
        icon: <Shield className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "Data Protection",
            paragraphs: [
              "We take the protection of your personal and governmental data seriously. All transactions and document uploads are guarded by AES-256 bit encryption."
            ]
          },
          {
            heading: "Information Collection",
            paragraphs: [
              "We only collect information strictly required to process your selected e-service application to the authorized department."
            ]
          }
        ]
      },
      ta: {
        title: "தனியுரிமை கொள்கை",
        icon: <Shield className="w-8 h-8 text-[#F59E0B]" />,
        sections: [
          {
            heading: "தரவு பாதுகாப்பு",
            paragraphs: [
              "உங்கள் தனிப்பட்ட தரவுகளின் பாதுகாப்பை நாங்கள் தீவிரமாக எடுத்துக்கொள்கிறோம். அனைத்து ஆவணங்களும் AES-256 bit encryption மூலம் பாதுகாக்கப்படுகிறது."
            ]
          },
          {
            heading: "தகவல் சேகரிப்பு",
            paragraphs: [
              "நீங்கள் விண்ணப்பித்த சேவையைச் செய்வதற்குத் தேவையான தகவல்களை மட்டுமே நாங்கள் சேகரிக்கிறோம்."
            ]
          }
        ]
      }
    }
  };

  const currentContent = content[type][language];

  return (
    <div className="flex flex-col flex-1 w-full p-4 lg:p-8 bg-slate-50 dark:bg-[#020617]">
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-[#0F172A] border-t-4 border-[#F59E0B] shadow-sm rounded-none p-8 md:p-12">
          
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
            {currentContent.icon}
            <h1 className="font-display font-black text-3xl uppercase tracking-widest text-[#0F172A] dark:text-white">
              {currentContent.title}
            </h1>
          </div>

          <div className="space-y-8">
            {currentContent.sections.map((section, idx) => (
              <section key={idx}>
                <h2 className="text-xl font-bold text-slate-800 dark:text-blue-100 mb-4 border-l-4 border-[#F59E0B] pl-3 uppercase tracking-wide">
                  {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
