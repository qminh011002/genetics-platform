// design-system §6.2 `BatchCode`: mã batch chữ mono 13 (dòng · thế hệ · lồng, vd TMA_F7_BC01),
// bấm mở batch (app truyền link qua `render`, kiểu Base UI), nút copy hiện khi hover / focus.
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { cn } from '@genetics/ui/lib/cn';

const COPIED_MS = 1500;

type BatchCodeProps = {
  code: string;
  /** Phần tử bọc mã, vd `<Link to="/batches/$code" params={{ code }} />`; mặc định `<span>`. */
  render?: useRender.RenderProp;
  /** Ẩn nút copy (vd trong bảng dày đặc trên điện thoại). */
  copyable?: boolean;
  /** Nhãn nút copy cho trình đọc màn hình; app truyền chuỗi i18n. */
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
};

function BatchCode({
  code,
  render,
  copyable = true,
  copyLabel = 'Sao chép mã',
  copiedLabel = 'Đã sao chép',
  className,
}: BatchCodeProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const codeElement = useRender({
    defaultTagName: 'span',
    render,
    props: {
      className:
        'font-mono text-code text-foreground underline-offset-4 [a&]:hover:text-primary [a&]:hover:underline',
      children: code,
    },
  });

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Trình duyệt chặn clipboard (http, quyền): bỏ qua, người dùng vẫn chọn chữ để copy được.
    }
  };

  return (
    <span
      data-slot="batch-code"
      className={cn('group/batch-code inline-flex items-center gap-1', className)}
    >
      {codeElement}
      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? copiedLabel : copyLabel}
          title={copied ? copiedLabel : copyLabel}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-5 items-center justify-center rounded-sm opacity-0 transition-opacity outline-none group-hover/batch-code:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 data-[copied=true]:opacity-100 [&_svg]:size-3.5"
          data-copied={copied}
        >
          {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
        </button>
      )}
    </span>
  );
}

export { BatchCode, type BatchCodeProps };
