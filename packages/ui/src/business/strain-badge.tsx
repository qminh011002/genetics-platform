// design-system §3.3 `StrainBadge`: badge vuông bo 6, ô vuông 7 px cùng màu chữ ở đầu, chữ 12 / 600.
// Màu theo token `strain-<code>` của @genetics/design-tokens. Dòng chưa có token (bảng mở rộng chưa
// có trong tokens.json) → màu trung tính, không tự sinh màu.
import { Badge } from '@genetics/ui/components/badge';
import { cn } from '@genetics/ui/lib/cn';

// Chuỗi lớp viết đủ (không ghép) để Tailwind quét được.
const STRAIN_CLASSES = {
  TMA: 'bg-strain-tma-bg text-strain-tma-fg',
  TME: 'bg-strain-tme-bg text-strain-tme-fg',
  REF: 'bg-strain-ref-bg text-strain-ref-fg',
  MSA: 'bg-strain-msa-bg text-strain-msa-fg',
  MSB: 'bg-strain-msb-bg text-strain-msb-fg',
  MSC: 'bg-strain-msc-bg text-strain-msc-fg',
} as const;

type KnownStrain = keyof typeof STRAIN_CLASSES;

const FALLBACK_CLASSES = 'bg-status-closed-bg text-status-closed-fg';

function isKnownStrain(code: string): code is KnownStrain {
  return Object.hasOwn(STRAIN_CLASSES, code);
}

type StrainBadgeProps = {
  /** Mã dòng (TMA, TME, REF, MSA, MSB, MSC…). */
  code: string;
  className?: string;
};

function StrainBadge({ code, className }: StrainBadgeProps) {
  const key = code.toUpperCase();
  return (
    <Badge
      variant="strain"
      data-strain={key}
      className={cn(isKnownStrain(key) ? STRAIN_CLASSES[key] : FALLBACK_CLASSES, className)}
    >
      <span aria-hidden className="size-1.75 shrink-0 rounded-xs bg-current" />
      {code}
    </Badge>
  );
}

export { StrainBadge, STRAIN_CLASSES, type StrainBadgeProps };
