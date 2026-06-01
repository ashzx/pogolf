<script lang="ts">
    import Button from "../forms/Button.svelte";
    import SelectableGeneration from "../SelectableGeneration.svelte";
    import Modal from "./Modal.svelte";
    import { toast } from "./toast.svelte";
    import { generations } from "../../metadata.svelte";
    import gameBootstrapper from "../../GameBootstrapper.svelte";
    import { gameState } from "../../states/GameState.svelte";

	import { modalStates, openModal, closeModal as modalStatesCloseModal } from "../../states/ModalState.svelte";

    // Store which generations are currently selected to restore if the user closes without saving
    let previousSelectedGenerations = [...gameState.selectedGenerations];

    function beforeOpen() {
        previousSelectedGenerations = [...gameState.selectedGenerations];
    }

    function closeModal() {
        gameState.selectedGenerations = [...previousSelectedGenerations];
        modalStatesCloseModal('settings');
    }

    function saveChanges() {
        if (gameState.selectedGenerations.length === 0) {
            toast.error("Please select at least one generation.");
            return;
        }

        // If the user has changed anything then we want to restart the game with the new settings. If they haven't changed anything, we can just close the modal.
        if (arraysEqual(gameState.selectedGenerations, previousSelectedGenerations)) {
            closeModal();
            return;
        }

        previousSelectedGenerations = [...gameState.selectedGenerations];

        toast.success("Changes saved!");
        gameBootstrapper.start(true);
        closeModal();
    }

    function beforeClose() {
        return true;
    }

    const arraysEqual = (a: any[], b: any[]): boolean => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((value, index) => value === sortedB[index]);
    }

    let changed = $derived.by(() => {
        return !arraysEqual(gameState.selectedGenerations, previousSelectedGenerations);
    });

</script>

<Modal
onBeforeClose={beforeClose}
onClose={closeModal}
onBeforeOpen={beforeOpen}
    modalKey="settings">
    {#snippet header()}
        Endless Mode Settings
    {/snippet}

    You can customise certain settings to make the endless mode more (or less) enjoyable. These settings will not affect the daily challenge mode, so feel free to experiment with them!
    <span class="text-sm text-gray-500 italic mt-1"><br>Note: Changing any settings will start a new game.</span>

    
    <fieldset class="border border-gray-300 rounded-md px-2">
        <legend class="px-6 py-2">Generations</legend>
        <ul class="pokemon-gens mx-2 space-y-1 pb-3">
            {#each generations as gen, index}
                <SelectableGeneration generation={index + 1} />
            {/each}
        </ul>
    </fieldset>


    {#snippet footer()}
        {#if changed}
            <Button text="Close without saving" onclick={closeModal} buttonColour="ghost-primary" />
        {/if}
        <Button text="Save changes" onclick={saveChanges} buttonColour="primary" />
    {/snippet}

</Modal>
