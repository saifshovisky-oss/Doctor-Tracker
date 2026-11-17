import type { SVGProps } from 'react';

/** DT coloured logo — teal + dark teal + green accent. Use on light backgrounds. */
export function DtLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 237 208" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M129 92H0V137H54V207.506H96V137H129V92Z" fill="#20BFA9" />
      <path d="M0 0V65.5H43.5V39.4941H112C219.5 33.9941 216 170.994 112 162.994V208H143C281 168 253 0 143 0H0Z" fill="#123C43" />
      <circle cx="150" cy="80" r="14" fill="#A6FF8B" />
    </svg>
  );
}

/** DT white logo — all white paths. Use on dark/coloured backgrounds. */
export function DtLogoWhite(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 237 208" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M129 92H0V137H54V207.506H96V137H129V92Z" fill="white" />
      <path d="M0 0V65.5H43.5V39.4941H112C219.5 33.9941 216 170.994 112 162.994V208H143C281 168 253 0 143 0H0Z" fill="white" />
      <circle cx="150" cy="80" r="14" fill="white" />
    </svg>
  );
}
