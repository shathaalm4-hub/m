import React from 'react';
import { Trophy } from 'lucide-react';
import { ThemeConfig } from '../types';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  gameTitle?: string;
  theme?: ThemeConfig;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', onClick, gameTitle = 'تحدي الـ100 مع شذى', theme }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Parse title into main part and subtitle (e.g. "تحدي الـ100 مع شذى" -> main: "تحدي الـ100", sub: "مع شذى")
  let mainPart = gameTitle;
  let subPart = '';
  if (gameTitle.includes('مع')) {
    const parts = gameTitle.split('مع');
    mainPart = parts[0].trim();
    subPart = `مع ${parts[1].trim()}`;
  } else if (gameTitle.includes('-')) {
    const parts = gameTitle.split('-');
    mainPart = parts[0].trim();
    subPart = parts[1].trim();
  }

  const primaryColor = theme?.primary || '#922D50';
  const accentColor = theme?.accent || '#D99AAA';
  const subTextColor = theme?.subText || '#F5DDE2';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3.5 ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div 
        className={`rounded-2xl flex items-center justify-center shadow-xl ${
          isSm ? 'w-10 h-10' : isLg ? 'w-20 h-20' : 'w-14 h-14'
        } ${onClick ? 'group-hover:scale-105 transition-all duration-300' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor}, ${primaryColor})`,
          boxShadow: `0 10px 25px -5px ${primaryColor}50`
        }}
      >
        <Trophy className={`text-white font-black ${isSm ? 'w-5 h-5' : isLg ? 'w-10 h-10' : 'w-7 h-7'}`} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className={`font-black tracking-tight ${theme ? '' : 'text-white'} ${
            isSm ? 'text-lg' : isLg ? 'text-4xl md:text-5xl' : 'text-2xl'
          }`}
          style={{ color: theme?.text || undefined }}
          >
            {mainPart.includes('100') ? (
              <>
                {mainPart.split('100')[0]}
                <span style={{ color: accentColor }} className="font-black underline decoration-4 underline-offset-4">100</span>
                {mainPart.split('100')[1]}
              </>
            ) : mainPart}
          </h1>
        </div>
        {subPart && (
          <p className={`font-black tracking-wider ${
            isSm ? 'text-[11px]' : isLg ? 'text-lg' : 'text-xs'
          }`}
          style={{ color: subTextColor }}
          >
            {subPart}
          </p>
        )}
      </div>
    </div>
  );
};
