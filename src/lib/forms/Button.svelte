<script lang="ts">
    let props = $props();

    const getButtonColour = (buttonColour: string) => {
        switch (buttonColour) {
            case "danger":
                return "bg-red-600 hover:bg-red-700";
            case "success":
                return "bg-teal-500 hover:bg-teal-600";
            case "primary":
                return "bg-teal-500 hover:bg-teal-400";
            case "secondary":
                return "bg-gray-800 text-white hover:bg-gray-700";
            case "ghost-danger":
                return "bg-transparent hover:bg-red-600 text-red-600 hover:text-white border border-red-600";
            case "ghost-success":
                return "bg-transparent hover:bg-teal-500 text-teal-500 hover:text-white border border-teal-500";
            case "ghost-primary":
                return "bg-transparent hover:bg-teal-500 text-teal-500 hover:text-white border border-teal-500";
            case "ghost-secondary":
                return "bg-transparent hover:bg-gray-500 text-gray-500 hover:text-white border border-gray-500";
            default:
                return "bg-transparent hover:bg-teal-500 text-teal-500 hover:text-white border border-teal-500";
        }
    }

    // svelte-ignore state_referenced_locally
    const btnClass = getButtonColour(props.buttonColour);

    const Icon = $derived(props.icon ? props.icon : null);
</script>

<button
    class="shrink-0 mt-6 py-2 px-4 rounded-lg font-semibold {btnClass} cursor-pointer {props.class} transition-colors duration-200"
    title="{props.title}"
    id="{props.id}"
    onclick="{props.onclick}"
    onkeydown="{props.onkeydown}"
>
    {#if props.icon}
        <Icon />
    {/if}
    {props.text}
</button>