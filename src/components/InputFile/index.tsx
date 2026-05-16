import { Box, VisuallyHiddenInput } from '@chakra-ui/react';
import React, { useId, useRef } from 'react';
import { ComponentProps } from 'preact/compat';

export interface IProps extends ComponentProps<typeof VisuallyHiddenInput> {
  children: React.ReactNode;
  onChange: (event: any) => Promise<void>;
}
function InputFile({ children, onChange, ...props }: IProps) {
  const ref = useRef<HTMLInputElement>(null);

  console.log({ props });
  return (
    <span>
      <VisuallyHiddenInput
        type="file"
        ref={ref}
        onChange={async (event: any) => {
          await onChange(event);

          if (ref.current) {
            ref.current.value = '';
          }
        }}
        {...props}
      />
      <span
        onClick={() => {
          ref.current?.click();
        }}
      >
        {children}
      </span>
    </span>
  );
}

export default InputFile;
