export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `iinline-flex items-center px-6 py-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl font-bold text-xs text-purple-300 uppercase tracking-widest hover:bg-purple-600/40 focus:bg-purple-600/40 active:bg-purple-600/50 transition-all ease-in-out duration-150 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] ${
                    disabled && 'opacity-25'
                }` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
