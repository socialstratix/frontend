import React, { useState } from 'react';
import { colors } from '../../constants/colors';
import { Button } from '../../components/atoms/Button';
import { useAuth } from '../../contexts/AuthContext';

const CHECK_GREEN = '#22c55e';

const BillingToggle: React.FC<{
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
}> = ({ isYearly, onToggle }) => (
  <div
    style={{
      width: '100%',
      maxWidth: '400px',
      height: '40px',
      border: '1px solid rgba(103, 103, 103, 1)',
      borderRadius: '20px',
      opacity: 1,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.primary.white,
      padding: '0px 0px',
      gap: '8px',
      boxSizing: 'border-box',
    }}
  >
    <button
      type="button"
      onClick={() => onToggle(false)}
      style={{
        flex: '0 0 auto',
        height: '40px',
        paddingLeft: '16px',
        paddingRight: '16px',
        border: !isYearly ? '3px solid rgba(120, 60, 145, 1)' : '3px solid transparent',
        borderRadius: '20px',
        opacity: 1,
        boxSizing: 'border-box',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: colors.text.primary,
      }}
    >
      MONTHLY
    </button>
    <button
      type="button"
      onClick={() => onToggle(true)}
      style={{
        flex: 1,
        minWidth: '56px',
        maxWidth: '350px',
        height: '40px',
        paddingLeft: '24px',
        paddingRight: '24px',
        border: isYearly ? '3px solid rgba(120, 60, 145, 1)' : '3px solid transparent',
        borderRadius: '20px',
        opacity: 1,
        boxSizing: 'border-box',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 400,
        fontStyle: 'normal',
        fontSize: '14px',
        lineHeight: '100%',
        letterSpacing: '0%',
        textAlign: 'center',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: colors.text.primary,
      }}
    >
      <span>Yearly - <span style={{ color: CHECK_GREEN }}>Save upto 20%</span></span>
    </button>
  </div>
);

const CheckItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
    <span style={{ color: CHECK_GREEN, flexShrink: 0, marginTop: '2px' }} aria-hidden>
      ✓
    </span>
    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: colors.text.primary }}>
      {children}
    </span>
  </div>
);

type PlanId = 'starter' | 'basic' | 'pro';

const TAG_STYLES: Record<PlanId, React.CSSProperties> = {
  starter: {
    backgroundColor: 'rgba(223, 223, 223, 1)',
    color: colors.text.primary,
  },
  basic: {
    backgroundColor: colors.gold.main,
    color: colors.primary.white,
  },
  pro: {
    backgroundColor: colors.primary.dark,
    color: colors.primary.white,
  },
};

const PlanCard: React.FC<{
  planId: PlanId;
  priceLabel: React.ReactNode;
  isCurrentPlan: boolean;
  upgradeLabel?: string;
  onUpgrade?: () => void;
  features: string[];
  highlight?: boolean;
}> = ({ planId, priceLabel, isCurrentPlan, upgradeLabel, onUpgrade, features, highlight }) => {
  const gradientBorderStyle: React.CSSProperties = {
    background: 'linear-gradient(225deg, #FFD4F6 0%, #99FCFF 100%)',
    padding: '3px',
    borderRadius: '12px',
    boxSizing: 'border-box',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };
  const cardOuterStyle: React.CSSProperties = highlight
    ? gradientBorderStyle
    : {
        backgroundColor: colors.primary.white,
        borderRadius: '12px',
        border: '1px solid ' + colors.border.light,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      };
  const cardInnerStyle: React.CSSProperties = highlight
    ? {
        backgroundColor: colors.primary.white,
        borderRadius: '9px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }
    : {};

  const cardContent = (
    <>
      <span
        style={{
          width: '73px',
          height: '25px',
          marginLeft: '12px',
          padding: '2px 12px',
          boxSizing: 'border-box',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          ...TAG_STYLES[planId],
        }}
      >
        {planId.charAt(0).toUpperCase() + planId.slice(1)}
      </span>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          paddingTop: '16px',
          boxSizing: 'border-box',
          minHeight: 0,
        }}
      >
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: colors.text.primary, marginBottom: '16px' }}>
          {priceLabel}
        </div>
        <div style={{ marginTop: 'auto', marginBottom: '16px', minWidth: 0 }}>
          {isCurrentPlan ? (
            <Button variant="elevated" disabled style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
              CURRENT PLAN
            </Button>
          ) : (
            <Button variant="filled" onClick={onUpgrade} style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
              {upgradeLabel}
            </Button>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {features.map((f, i) => (
            <CheckItem key={i}>{f}</CheckItem>
          ))}
        </div>
      </div>
    </>
  );

  return highlight ? (
    <div style={cardOuterStyle}>
      <div style={cardInnerStyle}>
        {cardContent}
      </div>
    </div>
  ) : (
    <div style={cardOuterStyle}>
      {cardContent}
    </div>
  );
};

const INFLUENCER_FEATURES: Record<PlanId, string[]> = {
  starter: [
    '7 Job apply per month',
    'Limited number of Advanced Search',
    '5 Best Match Campaigns with AI-assistance',
  ],
  basic: [
    '15 Job apply per month',
    'Unlimited number of Advanced Search',
    '15 Best Match Campaigns with AI-assistance',
  ],
  pro: [
    '50 Job apply per month',
    'Unlimited number of Advanced Search',
    '50 Best Match Campaigns with AI-assistance',
    '25% high Chances for getting a job',
  ],
};

const BRAND_FEATURES: Record<PlanId, string[]> = {
  starter: [
    '7 Campaign posts per month',
    'Unlimited number of Advanced Search',
    '5 Best Match influencers with AI-assistance',
  ],
  basic: [
    '15 Campaign posts per month',
    'Unlimited number of Advanced Search',
    '15 Best Match influencers with AI-assistance',
  ],
  pro: [
    '50 Campaign posts per month',
    'Unlimited number of Advanced Search',
    '50 Best Match influencers with AI-assistance',
    '25% High Chances for getting top influencers.',
  ],
};

export const Pricing: React.FC = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const isInfluencer = user?.userType === 'influencer';
  const isBrand = user?.userType === 'brand';

  const basicMonthly = 5;
  const basicYearlyPerMonth = 4;
  const proMonthly = 11;
  const proYearlyPerMonth = 9;

  const basicPrice = isYearly ? (
    <>${basicYearlyPerMonth} <span style={{ textDecoration: 'line-through', color: colors.text.secondary }}>${basicMonthly}</span>/ Month</>
  ) : (
    <>${basicMonthly} <span style={{ textDecoration: 'line-through', color: colors.text.secondary }}>$6</span>/ Month</>
  );
  const proPrice = isYearly ? (
    <>${proYearlyPerMonth} <span style={{ textDecoration: 'line-through', color: colors.text.secondary }}>${proMonthly}</span>/ Month</>
  ) : (
    <>${proMonthly} <span style={{ textDecoration: 'line-through', color: colors.text.secondary }}>$15</span>/ Month</>
  );

  const handleUpgrade = (_plan: PlanId) => () => {
    // Placeholder for future checkout / upgrade flow
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: colors.primary.white,
    padding: '32px 24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  };

  const renderSection = (features: Record<PlanId, string[]>) => (
    <section style={sectionStyle}>
      <h2
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '20px',
          fontWeight: 700,
          color: colors.text.primary,
          margin: '0 0 24px',
        }}
      >
        Upgrade your Site Plan
      </h2>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
        <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />
      </div>
      <div style={gridStyle}>
        <PlanCard
          planId="starter"
          priceLabel={
            <>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>Free</span>{' '}
              <span style={{ fontSize: '14px' }}>$0 / Month</span>
            </>
          }
          isCurrentPlan
          features={features.starter}
        />
        <PlanCard
          planId="basic"
          priceLabel={basicPrice}
          isCurrentPlan={false}
          upgradeLabel="UPGRADE TO BASIC"
          onUpgrade={handleUpgrade('basic')}
          features={features.basic}
        />
        <PlanCard
          planId="pro"
          priceLabel={proPrice}
          isCurrentPlan={false}
          upgradeLabel="UPGRADE TO PRO"
          onUpgrade={handleUpgrade('pro')}
          features={features.pro}
          highlight
        />
      </div>
    </section>
  );

  return (
    <div
      style={{
        minHeight: '100%',
        fontFamily: 'Poppins, sans-serif',
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {(isInfluencer || (!isBrand && !isInfluencer)) && renderSection(INFLUENCER_FEATURES)}
        {(isBrand || (!isBrand && !isInfluencer)) && renderSection(BRAND_FEATURES)}
      </div>
    </div>
  );
};
