import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/logo.svg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative w-full h-12 max-w-full flex items-center justify-center m-0 p-0">
      <Image
        src={logo}
        fill
        className="dark:hidden object-contain m-0 p-0"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
        sizes="100vw"
      />
      <Image
        src={darkLogo}
        fill
        className="hidden dark:block object-contain m-0 p-0"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
        sizes="100vw"
      />
    </div>
  );
}
