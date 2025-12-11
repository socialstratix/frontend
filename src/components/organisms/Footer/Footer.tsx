import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`bg-white ${className}`}
      style={{
        width: '1920px',
        maxWidth: '100%',
        height: '294px',
        paddingBottom: '16px',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <div className="w-full max-w-[1920px] mx-auto px-6 h-full flex flex-col">
        {/* Top Section - Navigation Links */}
        <div className="flex-1 flex items-start justify-between pt-12 pb-8">
          {/* ABOUT Column */}
          <div className="flex flex-col gap-4">
            <h3
              className="uppercase font-bold"
              style={{
                fontSize: '14px',
                color: '#330066',
                fontWeight: 700
              }}
            >
              ABOUT
            </h3>
            <div className="flex flex-col gap-3">
              {['Company', 'Careers', 'Blog', 'Placeholder'].map((link) => (
                <Link
                  key={link}
                  to={`/${link.toLowerCase()}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    fontSize: '14px',
                    color: '#666699',
                    fontWeight: 400
                  }}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* DISCOVER Column */}
          <div className="flex flex-col gap-4">
            <h3
              className="uppercase font-bold"
              style={{
                fontSize: '14px',
                color: '#330066',
                fontWeight: 700
              }}
            >
              DISCOVER
            </h3>
            <div className="flex flex-col gap-3">
              {[
                'Instagram influencers',
                'Facebook influencers',
                'YouTube influencers',
                'X influencers',
                'TikTok influencers'
              ].map((link) => (
                <Link
                  key={link}
                  to={`/discover/${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    fontSize: '14px',
                    color: '#666699',
                    fontWeight: 400
                  }}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* STRATIX Column */}
          <div className="flex flex-col gap-4">
            <h3
              className="uppercase font-bold"
              style={{
                fontSize: '14px',
                color: '#330066',
                fontWeight: 700
              }}
            >
              STRATIX
            </h3>
            <div className="flex flex-col gap-3">
              {['Pricing', 'Placeholder', 'Placeholder'].map((link, index) => (
                <Link
                  key={`${link}-${index}`}
                  to={`/${link.toLowerCase()}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    fontSize: '14px',
                    color: '#666699',
                    fontWeight: 400
                  }}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* HELP Column */}
          <div className="flex flex-col gap-4">
            <h3
              className="uppercase font-bold"
              style={{
                fontSize: '14px',
                color: '#330066',
                fontWeight: 700
              }}
            >
              HELP
            </h3>
            <div className="flex flex-col gap-3">
              {['Contact Us', 'Frequently asked questions'].map((link) => (
                <Link
                  key={link}
                  to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    fontSize: '14px',
                    color: '#666699',
                    fontWeight: 400
                  }}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div
          className="w-full"
          style={{
            height: '1px',
            backgroundColor: '#E0E0E0',
            marginBottom: '16px'
          }}
        />

        {/* Bottom Section - Copyright and Social Media */}
        <div className="flex items-center justify-between pb-4">
          {/* Left Side - Copyright and Legal Links */}
          <div className="flex items-center gap-6">
            <span
              style={{
                fontSize: '14px',
                color: '#666699',
                fontWeight: 400
              }}
            >
              © Stratix Inc.
            </span>
            {['Terms and Services', 'Privacy', 'Placeholder', 'Placeholder'].map(
              (link, index) => (
                <Link
                  key={`${link}-${index}`}
                  to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    fontSize: '14px',
                    color: '#666699',
                    fontWeight: 400
                  }}
                >
                  {link}
                </Link>
              )
            )}
          </div>

          {/* Right Side - Social Media Icons */}
          <div className="flex items-center gap-4">
            {/* Instagram Icon */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  stroke="#1E002B"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="12" cy="12" r="4" stroke="#1E002B" strokeWidth="2" fill="none" />
                <circle cx="17" cy="7" r="1" fill="#1E002B" />
              </svg>
            </a>

            {/* X (Twitter) Icon */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="2"
                  fill="#1E002B"
                />
                <path
                  d="M8 8L16 16M16 8L8 16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>

            {/* YouTube Icon */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="2"
                  fill="#1E002B"
                />
                <path
                  d="M10 8L16 12L10 16V8Z"
                  fill="white"
                />
              </svg>
            </a>

            {/* Generic Circle Icon */}
            <a
              href="#"
              className="hover:opacity-80 transition-opacity"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#1E002B"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

