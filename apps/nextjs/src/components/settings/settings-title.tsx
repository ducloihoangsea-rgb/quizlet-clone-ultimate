"use client";

import { useTranslation } from "~/contexts/i18n-context";

export default function SettingsTitle() {
  const { t } = useTranslation();
  return <h2 className="mb-8 text-2xl font-bold">{t("settings")}</h2>;
}
