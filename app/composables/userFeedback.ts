type MessageProps = {
    title: string;
    description?: string;
    duration?: number;
};

export function useUserFeedback() {
    const toast = useToast();

    function showSuccess(props: MessageProps) {
        return toast.add({
            ...props,
            color: "success",
            icon: "i-lucide-circle-check",
        });
    }

    function showError(props: MessageProps) {
        return toast.add({
            ...props,
            color: "error",
            icon: "i-lucide-circle-alert",
        });
    }

    return {
        showSuccess,
        showError,
    };
}
