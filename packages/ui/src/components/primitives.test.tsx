// Snapshot DOM cho 5 primitive đã chỉnh theo design-system §6.1 (Button, Badge, Input, Textarea, Tabs)
// + tiêu chí chấp nhận 1 của T0103. Snapshot đổi = thay đổi giao diện → PR nhãn `visual-change`.
import { tokens } from '@genetics/design-tokens/tokens';
import { STATUS_TOKENS } from '@genetics/shared/enums';
import { Badge } from '@genetics/ui/components/badge';
import { Button } from '@genetics/ui/components/button';
import { Input } from '@genetics/ui/components/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@genetics/ui/components/tabs';
import { Textarea } from '@genetics/ui/components/textarea';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const HEX = /#[0-9a-f]{3,8}\b/i;

describe('Button', () => {
  it('tiêu chí 1: variant success size xl dùng token, không hex, cao 52 px', () => {
    render(
      <Button variant="success" size="xl">
        Lưu
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Lưu' });
    const cls = button.className;
    expect(cls).not.toMatch(HEX);
    expect(cls).toContain('bg-success');
    expect(cls).toContain('text-primary-foreground');
    // h-button-xl = var(--spacing-button-xl) trong web.css = size.button-xl của tokens.json
    expect(cls.split(' ')).toContain('h-button-xl');
    expect(tokens.size['button-xl']).toBe(52);
  });

  it.each([
    ['sm', 'h-button-sm', 32],
    ['default', 'h-button-md', 36],
    ['lg', 'h-button-lg', 44],
    ['xl', 'h-button-xl', 52],
  ] as const)('size %s → %s (%i px)', (size, cls, px) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole('button').className.split(' ')).toContain(cls);
    expect(tokens.size[cls.replace('h-', '') as keyof typeof tokens.size]).toBe(px);
  });

  it('snapshot các biến thể bắt buộc', () => {
    const variants = [
      'default',
      'outline',
      'ghost',
      'secondary',
      'destructive',
      'destructive-outline',
      'success',
    ] as const;
    const { container } = render(
      <div>
        {variants.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
        <Button size="icon" aria-label="icon" />
      </div>,
    );
    expect(container.innerHTML).not.toMatch(HEX);
    expect(container).toMatchSnapshot();
  });
});

describe('Badge', () => {
  it('snapshot token trạng thái §3.2 và strain', () => {
    const { container } = render(
      <div>
        {STATUS_TOKENS.map((t) => (
          <Badge key={t} variant={t}>
            {t}
          </Badge>
        ))}
        <Badge variant="strain">TMA</Badge>
      </div>,
    );
    for (const t of STATUS_TOKENS) {
      expect(screen.getByText(t).className).toContain(`bg-${t}-bg`);
    }
    expect(container.innerHTML).not.toMatch(HEX);
    expect(container).toMatchSnapshot();
  });
});

describe('Input', () => {
  it('error đặt aria-invalid + viền destructive; warning viền warning', () => {
    render(
      <>
        <Input aria-label="err" state="error" />
        <Input aria-label="warn" state="warning" />
      </>,
    );
    const err = screen.getByLabelText('err');
    expect(err).toHaveAttribute('aria-invalid', 'true');
    expect(err.className).toContain('border-destructive');
    const warn = screen.getByLabelText('warn');
    expect(warn).not.toHaveAttribute('aria-invalid');
    expect(warn.className).toContain('border-warning');
  });

  it('hậu tố đơn vị nằm trong khung ô nhập', () => {
    render(<Input aria-label="kl" unit="mg" state="warning" defaultValue="182" />);
    const input = screen.getByLabelText('kl');
    const group = input.closest('[data-slot=input-unit-group]');
    expect(group).not.toBeNull();
    expect(group?.className).toContain('border-warning');
    expect(screen.getByText('mg')).toHaveAttribute('data-slot', 'input-unit');
  });

  it('snapshot', () => {
    const { container } = render(
      <div>
        <Input aria-label="a" placeholder="182" />
        <Input aria-label="b" state="error" />
        <Input aria-label="c" inputSize="lg" unit="mg / trứng" state="warning" />
      </div>,
    );
    expect(container).toMatchSnapshot();
  });
});

describe('Textarea', () => {
  it('snapshot error / warning', () => {
    const { container } = render(
      <div>
        <Textarea aria-label="a" state="error" />
        <Textarea aria-label="b" state="warning" />
      </div>,
    );
    expect(screen.getByLabelText('a')).toHaveAttribute('aria-invalid', 'true');
    expect(container).toMatchSnapshot();
  });
});

describe('Tabs', () => {
  it.each(['pill', 'underline'] as const)('snapshot %s', (variant) => {
    const { container } = render(
      <Tabs defaultValue="egg">
        <TabsList variant={variant}>
          <TabsTrigger value="egg">Thu trứng</TabsTrigger>
          <TabsTrigger value="weigh">Cân ổ</TabsTrigger>
        </TabsList>
        <TabsContent value="egg">egg</TabsContent>
        <TabsContent value="weigh">weigh</TabsContent>
      </Tabs>,
    );
    const list = screen.getByRole('tablist');
    expect(list).toHaveAttribute('data-variant', variant);
    expect(screen.getByRole('tab', { name: 'Thu trứng' })).toHaveAttribute('aria-selected', 'true');
    expect(container).toMatchSnapshot();
  });
});
