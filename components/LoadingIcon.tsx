import cs from 'classnames'

import styles from './styles.module.css'

export function LoadingIcon(props: any) {
  const { className, ...rest } = props
  return (
      <svg
      className={cs(styles.loadingIcon, className)}
      {...rest}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 100"
  preserveAspectRatio="xMidYMid"
>
  <g>
    <circle fill="#0d9488" r={10} cy={50} cx={84}>
      <animate
        begin="0s"
        keySplines="0 0.5 0.5 1"
        values="10;0"
        keyTimes="0;1"
        calcMode="spline"
        dur="0.25s"
        repeatCount="indefinite"
        attributeName="r"
      />
      <animate
        begin="0s"
        values="#0d9488;#0d9488;#0d9488;#0d9488;#0d9488"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="discrete"
        dur="1s"
        repeatCount="indefinite"
        attributeName="fill"
      />
    </circle>
    <circle fill="#0d9488" r={10} cy={50} cx={16}>
      <animate
        begin="0s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="0;0;10;10;10"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="r"
      />
      <animate
        begin="0s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="16;16;16;50;84"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="cx"
      />
    </circle>
    <circle fill="#0d9488" r={10} cy={50} cx={50}>
      <animate
        begin="-0.25s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="0;0;10;10;10"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="r"
      />
      <animate
        begin="-0.25s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="16;16;16;50;84"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="cx"
      />
    </circle>
    <circle fill="#0d9488" r={10} cy={50} cx={84}>
      <animate
        begin="-0.5s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="0;0;10;10;10"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="r"
      />
      <animate
        begin="-0.5s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="16;16;16;50;84"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="cx"
      />
    </circle>
    <circle fill="#0d9488" r={10} cy={50} cx={16}>
      <animate
        begin="-0.75s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="0;0;10;10;10"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="r"
      />
      <animate
        begin="-0.75s"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        values="16;16;16;50;84"
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        dur="1s"
        repeatCount="indefinite"
        attributeName="cx"
      />
    </circle>
    <g />
  </g>
</svg>
  )
}
