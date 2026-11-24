import React from 'react';
import { Trophy } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', onClick }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3.5 ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className={`rounded-2xl bg-gradient-to-tr from-[#922D50] via-[#D99AAA] to-[#922D50] flex items-center justify-center shadow-xl shadow-[#922D50]/30 ${
        isSm ? 'w-10 h-10' : isLg ? 'w-20 h-20' : 'w-14 h-14'
      } ${onClick ? 'group-hover:scale-105 transition-all duration-300' : ''}`}>
        <Trophy className={`text-[#FFFFFF] font-black ${isSm ? 'w-5 h-5' : isLg ? 'w-10 h-10' : 'w-7 h-7'}`} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className={`font-black tracking-tight text-[#FFFFFF] ${
            isSm ? 'text-lg' : isLg ? 'text-4xl md:text-5xl' : 'text-2xl'
          }`}>
            تحدي الـ<span className="text-[#D99AAA] font-black underline decoration-[#922D50] decoration-4 underline-offset-4">100</span>
          </h1>
        </div>
        <p className={`font-black tracking-wider text-[#F5DDE2] ${
          isSm ? 'text-[11px]' : isLg ? 'text-lg' : 'text-xs'
        }`}>
          مع شذى
        </p>
      </div>
    </div>
  );
};
