import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import { cn } from '@genetics/ui/lib/cn';
import {
  fieldGroupStateVariants,
  fieldStateAria,
  fieldStateVariants,
  type FieldState,
} from '@genetics/ui/lib/field-state';

// design-system §5: ô nhập 36 · ô nhập lớn 48 (token spacing-input-*); lg bo radius-lg, chữ 16
const inputSizeVariants = cva('', {
  variants: {
    inputSize: {
      default: 'h-input-md',
      lg: 'h-input-lg rounded-lg text-m-input md:text-m-input',
    },
  },
  defaultVariants: { inputSize: 'default' },
});

type InputProps = React.ComponentProps<'input'> & {
  /** design-system §6.1: `error` viền destructive + aria-invalid, `warning` viền warning. */
  state?: FieldState;
  inputSize?: 'default' | 'lg';
  /** design-system §6.1: hậu tố đơn vị (mg, mg / trứng…). Có `unit` thì `className` áp lên khung bọc. */
  unit?: React.ReactNode;
};

function Input({
  className,
  type,
  state = 'default',
  inputSize = 'default',
  unit,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  const invalid = fieldStateAria(state, ariaInvalid);
  if (unit === undefined || unit === null) {
    return (
      <InputPrimitive
        type={type}
        data-slot="input"
        aria-invalid={invalid}
        className={cn(
          'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
          inputSizeVariants({ inputSize }),
          fieldStateVariants({ state }),
          className,
        )}
        {...props}
      />
    );
  }
  // design-system §6.1: hậu tố đơn vị nằm trong khung ô nhập (wireframe Foundations `.input .unit`)
  return (
    <div
      data-slot="input-unit-group"
      className={cn(
        'border-input has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20 flex w-full min-w-0 items-center gap-2 rounded-md border shadow-xs transition-[color,box-shadow] has-disabled:opacity-50 has-[:focus-visible]:ring-3 has-[[aria-invalid=true]]:ring-3',
        inputSizeVariants({ inputSize }),
        fieldGroupStateVariants({ state }),
        className,
      )}
    >
      <InputPrimitive
        type={type}
        data-slot="input"
        aria-invalid={invalid}
        className={cn(
          'placeholder:text-muted-foreground h-full w-full min-w-0 flex-1 bg-transparent py-1 pl-3 text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm',
          inputSize === 'lg' && 'text-m-input md:text-m-input',
        )}
        {...props}
      />
      <span
        data-slot="input-unit"
        className="text-body-sm text-muted-foreground shrink-0 pr-3 whitespace-nowrap"
      >
        {unit}
      </span>
    </div>
  );
}

export { Input, type InputProps };
