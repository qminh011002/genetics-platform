// design-system §8 "Không có quyền": NoAccess, không lộ dữ liệu (wireframe UIStates, NoAccess).
// Tiêu đề mặc định = `error.permission_denied` của @genetics/shared/i18n.
import type * as React from 'react';
import { LockIcon } from 'lucide-react';
import { DEFAULT_LOCALE, messages, type Locale } from '@genetics/shared/i18n';
import { StateBlock, type StateBlockProps } from './state-block';

type NoAccessProps = Omit<StateBlockProps, 'icon' | 'tone' | 'title'> & {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  locale?: Locale;
};

function NoAccess({ icon, title, locale = DEFAULT_LOCALE, ...props }: NoAccessProps) {
  return (
    <StateBlock
      data-slot="no-access"
      tone="muted"
      icon={icon ?? <LockIcon />}
      title={title ?? messages[locale].error.permission_denied}
      {...props}
    />
  );
}

export { NoAccess, type NoAccessProps };
