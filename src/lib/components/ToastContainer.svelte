<script lang="ts">
    import { toast } from "./toast.svelte";
    import { tick } from "svelte";
    let toasts = $derived(toast.getToasts());
</script>


<div id="toast-container" class="toast-container">
    {#each toasts as t (t.id)}
        <div class="toast toast-{t.type}" id="popover-{t.id}">
            <div class="toast-body">
                <span>{t.message}</span>
                {#if t.canDismiss}
                    <button class="dismiss-btn" onclick={() => toast.dismiss(t.id)}>×</button>
                {/if}
            </div>
            <div class="toast-progress" style="--duration: {t.duration}ms"></div>
        </div>
    {/each}
</div>

<style>


    .toast {
        overflow: hidden;
    }

    .toast-icon {
        background:white;
        padding: 0.25rem;
        border-radius: 12.5%;
    }

    .toast-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
    }

    .dismiss-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        line-height: 1;
        opacity: 0.7;
        padding: 0;
    }

    .dismiss-btn:hover {
        opacity: 1;
    }

    .toast-progress {
        height: 3px;
        background: rgba(255, 255, 255, 0.5);
        animation: shrink var(--duration) linear forwards;
        transform-origin: left;
    }

    @keyframes shrink {
        from { transform: scaleX(1); }
        to   { transform: scaleX(0); }
    }
</style>
