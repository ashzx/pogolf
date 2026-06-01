type Toast = {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    canDismiss?: boolean;
    duration: number;
}

let toastStore = $state([] as Toast[]);

function createToastStore() {

    const push = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000, canDismiss: boolean = true) => {
        const id = Date.now() + Math.random();
        toastStore.push({ id, message, type, canDismiss, duration });

        setTimeout(() => {
            toastStore = toastStore.filter(toast => toast.id !== id);
        }, duration);
    }

    const success = (message: string, duration?: number, canDismiss?: boolean) => push(message, 'success', duration, canDismiss);
    const error = (message: string, duration?: number, canDismiss?: boolean) => push(message, 'error', duration, canDismiss);
    const info = (message: string, duration?: number, canDismiss?: boolean) => push(message, 'info', duration, canDismiss);

    return {
        subscribe: (callback: (toasts: Toast[]) => void) => {
            callback(toastStore);
            return () => {};
        },
        push,
        success,
        error,
        info,
        dismiss: (id: number) => {
            toastStore = toastStore.filter(toast => toast.id !== id);
        },
        getToasts: () => toastStore
    }
}

export const toast = createToastStore();