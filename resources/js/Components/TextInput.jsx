import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'bg-[#0f0822] border-purple-500/30 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-inner placeholder-slate-600' +
                className
            }
            ref={localRef}
        />
    );
});
