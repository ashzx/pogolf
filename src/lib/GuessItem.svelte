<script lang="ts">
	let props = $props();
</script>

<div class="md:min-w-64 w-auto grow bg-gray-800 rounded-lg flex justify-center items-center border border-gray-600 p-8 {props.class}">
    <img src={`./assets/sprites/${props.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`} alt={props.name} class="pogolf-image w-16 h-16 rounded-lg -translate-x-1/5">
    <span class="pogolf-word text-xl font-semibold">{props.name}</span>
</div>

{#if props.separator}
    <div class="flex justify-center items-center my-2 down-arrow">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3">
            </path>
        </svg>
    </div>
{/if}