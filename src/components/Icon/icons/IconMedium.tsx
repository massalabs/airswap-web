import { SvgIconProps } from "../Icon";
import { FC, ReactElement } from "react";

const IconMedium: FC<SvgIconProps> = ({ className = "" }): ReactElement => (
  <svg
    width="16"
    height="10"
    viewBox="0 0 16 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8.96252 5.00005C8.96584 6.12614 8.52211 7.20752 7.72878 8.00672C6.93544 8.80591 5.85736 9.25758 4.73127 9.26255C3.60518 9.25758 2.5271 8.80591 1.73376 8.00672C0.940424 7.20752 0.496696 6.12614 0.500019 5.00005C0.496696 3.87396 0.940424 2.79258 1.73376 1.99338C2.5271 1.19419 3.60518 0.742512 4.73127 0.737549C5.85736 0.742512 6.93544 1.19419 7.72878 1.99338C8.52211 2.79258 8.96584 3.87396 8.96252 5.00005ZM13.6 5.00005C13.6 7.21255 12.6563 9.01255 11.4875 9.01255C10.3188 9.01255 9.36877 7.21255 9.36877 5.00005C9.36877 2.78755 10.3188 0.987549 11.4875 0.987549C12.6563 0.987549 13.6 2.78755 13.6 5.00005ZM15.5 5.00005C15.5 6.9813 15.1688 8.5938 14.7563 8.5938C14.3438 8.5938 14.0125 6.9813 14.0125 5.00005C14.0125 3.0188 14.3438 1.4063 14.7563 1.4063C15.1688 1.4063 15.5 3.0188 15.5 5.00005Z"
      fill="currentcolor"
    />
  </svg>
);

export default IconMedium;
