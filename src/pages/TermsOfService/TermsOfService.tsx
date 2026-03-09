import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../constants/colors';

// Reuse design colors from reference (aligned with project theme)
const highlightBarBg = colors.secondary.light; // #F0E2F6 light purple
const highlightBarText = colors.primary.dark;  // #3F214C medium purple
const confirmButtonBg = colors.primary.main;   // #783C91 purple
const scrollbarThumb = colors.primary.main;
const infoTextBlue = '#0077B6';

export const TermsOfService: React.FC = () => {
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
        {/* Header with close */}
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
            Terms of Service
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

        {/* Scrollable content */}
        <div
          className="terms-content"
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
            Last Updated: March 8, 2026
          </p>

          <p style={{ margin: '0 0 16px' }}>
            Welcome to Social Startix. By accessing or using our website, platform, and services, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
          </p>

          {/* Highlighted bar */}
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
            Welcome to Social Startix — please read these terms carefully before using our platform.
          </div>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ margin: 0 }}>
              By creating an account on Social Startix, you represent that you are at least 18 years of age and have the legal authority to enter into this agreement. If you are using the platform on behalf of a company (Brand), you represent that you have the authority to bind that entity.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              2. Role of Social Startix
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              Social Startix is a platform that facilitates connections between Brands and Creators.
            </p>
            <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
              <li><strong>Facilitation Only:</strong> We provide the infrastructure for discovery and communication.</li>
              <li><strong>No Employment:</strong> Social Startix is not an employer, agent, or partner of any Creator. Creators are independent contractors.</li>
              <li><strong>Content Responsibility:</strong> We are not responsible for the content, accuracy, or legality of any marketing campaigns or creator posts.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              3. User Accounts
            </h2>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Accuracy:</strong> You must provide accurate and complete information during registration.</li>
              <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li><strong>Suspension:</strong> Social Startix reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              4. Campaign Agreements & Payments
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              When a Brand and a Creator agree on a campaign, they enter into a direct contract.
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Escrow/Payments:</strong> If Social Startix handles payments, funds will be released to the Creator only upon successful completion of the agreed-upon milestones.</li>
              <li><strong>Fees:</strong> Social Startix may charge a service fee or commission on transactions. These fees are non-refundable.</li>
              <li><strong>Taxes:</strong> Users are responsible for their own tax obligations (e.g., GST in India) related to the income earned or services purchased on the platform.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              5. Intellectual Property
            </h2>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Platform Content:</strong> All logos, designs, and software on Social Startix are the property of Social Startix.</li>
              <li><strong>Creator Content:</strong> Creators retain ownership of their content unless otherwise agreed upon in a specific campaign contract with a Brand. However, by using the platform, you grant Social Startix a license to display your portfolio for marketing our platform.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              6. Prohibited Conduct
            </h2>
            <p style={{ margin: '0 0 8px' }}>Users agree not to:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Use the platform for any illegal purpose.</li>
              <li>Circumvent the platform to make &quot;off-platform&quot; payments to avoid service fees.</li>
              <li>Post defamatory, obscene, or infringing content.</li>
              <li>Use automated bots to scrape data from the site.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              7. Limitation of Liability
            </h2>
            <p style={{ margin: 0 }}>
              To the maximum extent permitted by law, Social Startix shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform, including disputes between Brands and Creators or the failure of a campaign to meet expectations.
            </p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              8. Governing Law
            </h2>
            <p style={{ margin: 0 }}>
              These terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: colors.text.primary }}>
              9. Contact Information
            </h2>
            <p style={{ margin: 0 }}>
              For any questions regarding these Terms, please reach out:
            </p>
            <p style={{ margin: '8px 0 0' }}>
              Social Startix Email: <a href="mailto:socialstartix@gmail.com" style={{ color: confirmButtonBg }}>socialstartix@gmail.com</a><br />
              Location: Bangalore, India
            </p>
          </section>
        </div>

        {/* Footer: checkbox, info text, confirm */}
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
            I accept the Terms &amp; Conditions mentioned above.
          </label>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '12px',
              color: infoTextBlue,
            }}
          >
            You will receive an email with this Terms and Conditions attached for future reference post confirmation.
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

      {/* Custom scrollbar for content */}
      <style>{`
        .terms-content::-webkit-scrollbar {
          width: 8px;
        }
        .terms-content::-webkit-scrollbar-track {
          background: ${colors.grey.light};
          border-radius: 4px;
        }
        .terms-content::-webkit-scrollbar-thumb {
          background: ${scrollbarThumb};
          border-radius: 4px;
        }
        .terms-content::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary.dark};
        }
      `}</style>
    </div>
  );
};
