import type { ReactNode, SVGProps } from 'react'

type LogoProps = SVGProps<SVGSVGElement>

const WORDMARK_RATIO = 102 / 469

function LogoSvg({
  baseClass,
  className,
  fill = 'currentColor',
  children,
  ...props
}: LogoProps & { baseClass: string; children: ReactNode }) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby'])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      className={[baseClass, className].filter(Boolean).join(' ')}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function LogoSymbol({ width = 128, height = width, ...props }: LogoProps) {
  return (
    <LogoSvg baseClass="logo-symbol" viewBox="0 0 128 128" width={width} height={height} {...props}>
      <path d="M78 20H42C29.85 20 20 29.85 20 42V106C20 107.104569 20.895431 108 22 108H86C98.15 108 108 98.15 108 86V64H88V84C88 86.21 86.21 88 84 88H42C40.895431 88 40 87.104569 40 86V44C40 41.79 41.79 40 44 40H78Z" />
      <path d="M88 20H106C107.104569 20 108 20.895431 108 22V40H88Z" />
    </LogoSvg>
  )
}

// Height follows the width unless set.
export function LogoWordmark({ width = 128, height, ...props }: LogoProps) {
  return (
    <LogoSvg
      baseClass="logo-wordmark"
      viewBox="-2 0 469 102"
      width={width}
      height={height ?? Number(width) * WORDMARK_RATIO}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M72 8H35C12 8 0 24 0 51S12 94 35 94H72L59 76H36C24 76 20 67 20 51S24 26 36 26H59Z"
      />
      <path
        fillRule="evenodd"
        transform="translate(82 0)"
        d="M31 30C11 30 0 42 0 62S11 94 31 94 62 82 62 62 51 30 31 30ZM31 47C40 47 44 52 44 62S40 77 31 77 18 72 18 62 22 47 31 47Z"
      />
      <path
        fillRule="evenodd"
        transform="translate(154 0)"
        d="M48 13L68 8V94H49V88C44 92 38 94 29 94C11 94 0 82 0 62S11 30 29 30C37 30 43 32 48 36ZM34 47C24 47 19 52 19 62S24 77 34 77 49 72 49 62 44 47 34 47Z"
      />
      <path
        fillRule="evenodd"
        transform="translate(232 0)"
        d="M61 66H19C20 74 25 78 35 78H60L48 94H33C12 94 0 82 0 62S12 30 32 30 61 42 61 60ZM19 53H43C42 47 38 44 32 44S21 47 19 53Z"
      />
      <path
        fillRule="evenodd"
        transform="translate(310 0)"
        d="M0 13L20 8V59C20 71 25 76 37 76S54 71 54 59V13L74 8V60C74 83 61 94 37 94S0 83 0 60Z"
      />
      <path
        fillRule="evenodd"
        transform="translate(396 0)"
        d="M0 8H36C57 8 69 19 69 37S57 67 36 67H20V89L0 94ZM20 26V49H34C44 49 49 45 49 37S44 26 34 26Z"
      />
    </LogoSvg>
  )
}
