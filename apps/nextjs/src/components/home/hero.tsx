import Image from "next/image";
import { useTranslation } from "~/contexts/i18n-context";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <div className="m-auto mb-12 max-w-4xl lg:mb-24">
      <div className="mb-6 flex w-full justify-center">
        <Image src="/logo.svg" alt="logo" width={220} height={48} />
      </div>
      <h1 className="mb-14 mt-0 text-center text-4xl font-black md:text-5xl lg:text-7xl">
        {t("heroTitle")}
      </h1>
    </div>
  );
}
