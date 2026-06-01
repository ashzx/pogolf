<script>
	import { modalStates, openModal, closeModal, getModalState, setModalState } from "../../states/ModalState.svelte";

	let { header, children, modalKey, ...props } = $props();
    const Icon = $derived(props.icon ? props.icon : null);
    const AllowClosableBackdrop = $derived(props.allowClosableBackdrop ?? true);
    const AllowEscapeKey = $derived(props.allowEscapeKey ?? true);
    const Separator = $derived(props.separator ?? false);
    const Footer = $derived(props.footer ?? null);
    const CloseButton = $derived(props.closeButton ?? true);
    const MaxWidth = $derived.by(() => {
        switch (props.maxWidth) {
            case 'sm':
                return 'max-w-sm';
            case 'md':
                return 'max-w-md';
            case 'lg':
                return 'max-w-lg';
            case 'xl':
                return 'max-w-xl';
            case '2xl':
                return 'max-w-2xl';
            case '3xl':
                return 'max-w-3xl';
            default:
                return 'max-w-xl';
        }
    })

	let dialog = $state(); 
    let shouldOpen = $derived.by(() => {
        return getModalState(modalKey);
    });


    $effect(() => {
        const isClosed = dialog?.classList.contains('hidden');
        // Only call onBeforeOpen if we're transitioning from closed to open
        if (shouldOpen && props.onBeforeOpen && isClosed) {
            props.onBeforeOpen();
        }

        document.body.classList.toggle('modal-open', shouldOpen);
        dialog?.classList.toggle('hidden', !shouldOpen);

        if (shouldOpen && props.onOpen && isClosed) {
            props.onOpen();
        }
    });

    const closeDialog = () => {
        if (props.onBeforeClose) {
            const shouldClose = props.onBeforeClose();
            if (!shouldClose) {
                dialog?.classList.add('modal-shake');
                setTimeout(() => {
                    dialog?.classList.remove('modal-shake');
                }, 500);
                return;
            }
        
        }
        setModalState(modalKey, false);
        closeModal(modalKey);

        if (props.onClose) {
            props.onClose();
        }
    };

    const closeDialogFromBackdrop = () => {
        if (AllowClosableBackdrop) {
            closeDialog();
        }
    };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div bind:this={dialog} class="modal z-50 fixed inset-0 flex items-center justify-center hidden">
    <div class={`bg-gray-800 text-white rounded-lg p-8 space-y-4 shadow-xl relative max-h-10/12 overflow-y-auto ${MaxWidth}`}>
        <button type="button" data-close="modal" onclick={closeDialog} class:hidden={!CloseButton}
            class="cursor-pointer absolute top-8 right-6 text-gray-600 hover:text-gray-800 text-xl font-bold">&times;
            <span class="sr-only">Close</span>
        </button>
        <div class="flex flex-row">
        {#if Icon}
            <div class="flex items-start mr-4">
                <span class="bg-purple-500 rounded-full p-3 text-white">
                    <Icon />
                </span>
            </div>
        {/if}
            <div class="flex flex-col">
                <h2 class="modal-title text-2xl font-bold mb-4">
                    {@render header?.()}
                </h2>
                <div class="modal-body">
                    {@render children?.()}
                </div>
            </div>
        </div>
        {#if Separator}
            <hr class="my-4 border-gray-300" />
        {/if}
        {#if Footer}
            <div class="modal-footer flex flex-row justify-end space-x-2 mt-4">
                {@render Footer?.()}
            </div>
        {/if}
    </div>
</div>

<div class="modal-backdrop fixed inset-0 bg-gray-900 opacity-50 z-40" class:hidden={!shouldOpen} onclick={closeDialogFromBackdrop} aria-label="Modal backdrop" role="presentation"></div>

<svelte:window on:keydown={(e) => AllowEscapeKey && e.key === 'Escape' && closeDialog()}></svelte:window>
