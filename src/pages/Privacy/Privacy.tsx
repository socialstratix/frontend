import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../constants/colors';

const highlightBarBg = colors.secondary.light;
const highlightBarText = colors.primary.dark;
const confirmButtonBg = colors.primary.main;
const scrollbarThumb = colors.primary.main;
const infoTextBlue = '#0077B6';

export const Privacy: React.FC = () => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (accepted) {
      navigate(-1);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: colors.primary.white,
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: colors.text.primary,
              lineHeight: 1.3,
            }}
          >
            Privacy Policy
          </h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Close"
            style={{
              color: colors.text.secondary,
              fontSize: '24px',
              lineHeight: 1,
              padding: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            ×
          </button>
        </div>

        <div
          className="privacy-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            color: colors.text.primary,
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: '0 0 16px', color: colors.text.secondary }}>
            Effective Date: March 8, 2026
          </p>

          <p style={{ margin: '0 0 16px' }}>
            Welcome to Social Startix. We value your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard information for both our Brands and Creators.
          </p>

          <div
            style={{
              background: highlightBarBg,
              color: highlightBarText,
              padding: '14px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Your data is important to us — we collect and use it only to run our platform and serve you better.
          </div>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              1. Information We Collect
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              We collect different types of information depending on how you interact with our platform.
            </p>
            <p style={{ margin: '0 0 6px', fontWeight: 600 }}>For Brands (Businesses/Agencies)</p>
            <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
              <li><strong>Account Data:</strong> Company name, business email, physical address, and tax identification numbers.</li>
              <li><strong>Campaign Data:</strong> Information about your marketing goals, budget, and campaign briefs.</li>
              <li><strong>Payment Information:</strong> Billing details and transaction history (processed via secure third-party gateways).</li>
            </ul>
            <p style={{ margin: '0 0 6px', fontWeight: 600 }}>For Creators (Influencers/Talent)</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Profile Data:</strong> Legal name, stage name, bio, and location.</li>
              <li><strong>Social Media Analytics:</strong> Follower counts, engagement rates, and audience demographics (collected via API or manual upload).</li>
              <li><strong>Content:</strong> Portfolio links, past collaborations, and media kits.</li>
              <li><strong>Payout Details:</strong> Bank information or payment IDs for receiving campaign earnings.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              2. How We Use Your Data
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              Social Startix uses the information collected to facilitate a seamless marketplace experience:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Matching &amp; Discovery:</strong> Helping Brands find the right Creators based on niche and metrics.</li>
              <li><strong>Communication:</strong> Sending notifications about campaign applications, approvals, and platform updates.</li>
              <li><strong>Payments:</strong> Facilitating the transfer of funds between Brands and Creators.</li>
              <li><strong>Security:</strong> To prevent fraud and ensure the integrity of our marketplace.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              3. Data Sharing and Disclosure
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              We do not sell your personal data. However, we share information in the following ways:
            </p>
            <div style={{ overflowX: 'auto', marginTop: '8px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.border.light}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: colors.text.primary }}>Recipient</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: colors.text.primary }}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                    <td style={{ padding: '10px 12px' }}>Brands &amp; Creators</td>
                    <td style={{ padding: '10px 12px' }}>Public profile data and campaign details are shared between parties to facilitate collaborations.</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                    <td style={{ padding: '10px 12px' }}>Service Providers</td>
                    <td style={{ padding: '10px 12px' }}>We use third-party tools for hosting, analytics, and payment processing (e.g., Stripe or Razorpay).</td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                    <td style={{ padding: '10px 12px' }}>Legal Compliance</td>
                    <td style={{ padding: '10px 12px' }}>If required by law, we may disclose information to comply with legal obligations or protect our rights.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              4. Data Security
            </h2>
            <p style={{ margin: 0 }}>
              Social Startix implements industry-standard security measures, including SSL encryption and secure server protocols, to protect your data. While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              5. Your Rights &amp; Choices
            </h2>
            <p style={{ margin: '0 0 8px' }}>You have the following rights regarding your data:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong>Correction:</strong> Update inaccurate or incomplete information through your account settings.</li>
              <li><strong>Deletion:</strong> Request that we erase your personal data (&quot;Right to be Forgotten&quot;).</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time via the link in the footer.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              6. Cookies and Tracking
            </h2>
            <p style={{ margin: 0 }}>
              We use cookies to remember your login session and understand how you navigate our site. You can manage cookie preferences through your individual browser settings.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              7. Contact Us
            </h2>
            <p style={{ margin: 0 }}>
              If you have questions about this Privacy Policy or how your data is handled by Social Startix, please contact us at:
            </p>
            <p style={{ margin: '8px 0 0' }}>
              Email: <a href="mailto:socialstartix@gmail.com" style={{ color: confirmButtonBg }}>socialstartix@gmail.com</a><br />
              Address: Bangalore, India
            </p>
          </section>
        </div>

        <div
          style={{
            padding: '16px 24px 24px',
            borderTop: `1px solid ${colors.border.light}`,
            backgroundColor: colors.primary.white,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              color: colors.text.primary,
              fontSize: '14px',
            }}
          >
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: confirmButtonBg }}
            />
            I have read and understood the Privacy Policy above.
          </label>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '12px',
              color: infoTextBlue,
            }}
          >
            You may receive a copy of this Privacy Policy by email for your records upon request.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!accepted}
              style={{
                padding: '12px 32px',
                backgroundColor: accepted ? confirmButtonBg : colors.grey.disabled,
                color: colors.primary.white,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: accepted ? 'pointer' : 'not-allowed',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .privacy-content::-webkit-scrollbar {
          width: 8px;
        }
        .privacy-content::-webkit-scrollbar-track {
          background: ${colors.grey.light};
          border-radius: 4px;
        }
        .privacy-content::-webkit-scrollbar-thumb {
          background: ${scrollbarThumb};
          border-radius: 4px;
        }
        .privacy-content::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary.dark};
        }
      `}</style>
    </div>
  );
};
