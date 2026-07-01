import {
  CertificateLevel,
  PortfolioType,
  SubmissionType,
} from "@prisma/client";

export const POINT_TABLE: Record<string, number> = {
  // Certificates by level
  [`CERTIFICATE_LOKAL`]: 1,
  [`CERTIFICATE_REGIONAL`]: 3,
  [`CERTIFICATE_NASIONAL`]: 5,
  [`CERTIFICATE_INTERNASIONAL`]: 10,
  // Portfolios by type
  [`PORTFOLIO_PERSONAL`]: 2,
  [`PORTFOLIO_FREELANCE`]: 5,
  [`PORTFOLIO_INDUSTRI`]: 8,
  // Skills
  [`SKILL`]: 3,
};

export function suggestPoints(
  type: SubmissionType,
  level?: CertificateLevel | null,
  portfolioType?: PortfolioType | null
): number {
  if (type === "CERTIFICATE" && level) {
    return POINT_TABLE[`CERTIFICATE_${level}`] ?? 1;
  }
  if (type === "PORTFOLIO" && portfolioType) {
    return POINT_TABLE[`PORTFOLIO_${portfolioType}`] ?? 2;
  }
  if (type === "SKILL") {
    return POINT_TABLE["SKILL"];
  }
  return 0;
}
