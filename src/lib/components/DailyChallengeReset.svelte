<script lang="ts">
    let props = $props();

    const updateTimer = () => {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow.getTime() - now.getTime();

        if (diff <= 0) {
            return "00:00:00";
        }

        return new Date(diff).toISOString().substring(11, 19);
    }

    let updateTimerText = $state(updateTimer());

    $effect(() => {
        const interval = setInterval(() => {
            updateTimerText = updateTimer();
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

{#if props.numberOnly}
    <span>{updateTimerText}</span>
{:else}
    <span>Daily challenge resets in: {updateTimerText}</span>
{/if}