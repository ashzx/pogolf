<div
    class="z-10 flex justify-center play-again-button hidden my-4 sticky bottom-0 bg-gray-900 py-2 w-100 flex-col"
    id="play-again-button-container"
>
    <p class="my-2 text-center font-bold you-won hidden">
        You scored <span class="score"></span>
    </p>
    <p class="my-2 text-center font-bold you-gave-up hidden">
        You gave up on the challenge.
    </p>
    <button
        id="play-again"
        class="py-2 mt-4 px-4 mb-2 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 cursor-pointer"
    >
        Play endless mode
    </button>
    <button
        id="see-results"
        class="py-2 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 cursor-pointer"
    >
        See Results
    </button>
    <p class="mt-5 text-center font-bold">
        Daily challenge resets in: <span class="daily-challenge-timer"></span>
    </p>
</div>
