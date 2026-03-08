import React, { useState, useEffect } from 'react';
import { colors } from '../../../constants/colors';

const AVATAR_BASE = 'https://i.pravatar.cc/150?img=';

const TESTIMONIALS: Array<{
  quote: string;
  authorName: string;
  authorTitle?: string;
  avatarId: string;
  imageUrl?: string;
}> = [
  {
    quote:
      'If you make customers unhappy in the physical world, they might each tell 6 friends. If you make customers unhappy on the Internet, they can each tell 6,000 friends.',
    authorName: 'Jeff Bezos',
    authorTitle: 'Amazon founder',
    avatarId: '12',
    imageUrl: '/Jeff-Bezos-1024x577.jpg',
  },
  {
    quote:
      'Random social media tactics lead to random results. You need a strategy.',
    authorName: 'Stephanie Sammons',
    authorTitle: 'Social media strategist',
    avatarId: '47',
    imageUrl: '/Stephanie-Sammons-Music-483.jpg',
  },
  {
    quote:
      'The social media web is a very noisy one indeed and making sure that you are heard requires you to shout more effectively, rather than louder.',
    authorName: 'David Amerland',
    authorTitle: 'Author',
    avatarId: '33',
    imageUrl: '/David-Amerland-BW.jpg',
  },
];

const ROTATION_MS = 5000;

export const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[currentIndex];

  return (
    <>
      <div className="max-w-lg " style={{ flex: 1 }}>
        <div
          key={currentIndex}
          className="testimonial-slide-in"
          style={{ minHeight: '180px' }}
        >
          <div className="flex gap-1 height-450px width-105px">
            <div
              className="mb-4"
              style={{
                color: 'rgb(207, 207, 207)',
                fontSize: '64px',
                lineHeight: 1,
                fontFamily: 'serif',
                fontWeight: 900,
              }}
            >
              “
            </div>
            <p
              style={{
                width: '388px',
                minHeight: '105px',
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: colors.text.primary,
                opacity: 1,
                transform: 'rotate(0deg)',
                marginBottom: '24px',
              }}
            >
              {t.quote}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              <img
                src={t.imageUrl ?? `${AVATAR_BASE}${t.avatarId}`}
                alt={t.authorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                  color: colors.text.primary,
                }}
              >
                {t.authorName}
              </p>
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.text.secondary,
                }}
              >
                {t.authorTitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 justify-center">
        {TESTIMONIALS.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to testimonial ${index + 1}`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              backgroundColor: index === currentIndex ? colors.primary.main : colors.grey.light,
            }}
          />
        ))}
      </div>
    </>
  );
};
