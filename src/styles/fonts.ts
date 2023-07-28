import localFont from 'next/font/local';
import {
  Inter,
  Lora,
  Work_Sans,
  Lato,
  Roboto,
  Raleway,
} from 'next/font/google';

export const heading = Roboto({
  variable: '--font-heading',
  weight: '500',
  subsets: ['latin', 'cyrillic', 'greek'],
});
export const raleway = Raleway({
  variable: '--font-raleway',
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin', 'cyrillic'],
});
export const intro = localFont({
  src: './intro.otf',
  variable: '--font-intro',
  weight: '600',
  display: 'swap',
});
export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});
export const lora = Lora({
  variable: '--font-title',
  subsets: ['latin'],
  weight: '600',
  display: 'swap',
});
export const work = Work_Sans({
  variable: '--font-title',
  subsets: ['latin'],
  weight: '600',
  display: 'swap',
});

export const fontMapper = {
  'font-lora': lora.variable,
  'font-work': work.variable,
} as Record<string, string>;
