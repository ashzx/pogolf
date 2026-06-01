<script lang="ts">
    import { shareData as GameStateShareData } from "../../states/GameState.svelte";
    import type { shareDataType } from '../../types/types.svelte';
	let { colour, name, emoji, ...rest } = $props();
    import { toast } from "./toast.svelte";


    const shareIntent = () => {
        const shareData: shareDataType = GameStateShareData();

        if (navigator.share) {
            navigator.share(shareData).catch((error) => console.error('Error sharing:', error));
        } else {
            // Fallback for browsers that do not support the Web Share API
            // Copy string
            navigator.clipboard.writeText(shareData.clipboard).then(() => {
                toast.success("Result copied to clipboard!");
            }).catch((error) => {
                toast.error("Error copying to clipboard");
            });
        }
    };

    const EmojiComponent = $derived(emoji);
</script>

<button type="button" class="share-intent {colour} text-3xl text-center cursor-pointer hover:opacity-80 mx-auto" onclick={shareIntent}
    data-intent={name} title="Share on {name}">
    <EmojiComponent />
</button>