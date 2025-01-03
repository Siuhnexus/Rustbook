<script lang="ts">
    let { value, small = false } : { value: number, small?: boolean } = $props();
    let progress: HTMLDivElement | undefined = $state();
    $effect(() => {
        if(!progress) return
        progress.style.setProperty("--progress", `${(100 - value) * 1.01}%`)
    })
</script>

<div class="rounded-full {small ? "h-1" : "h-4"} w-full bg-[hsl(226,23%,20%)] overflow-hidden">
    <div bind:this={progress} class="w-full rounded-full {small ? "h-1" : "h-4"} bg-orange-300 -translate-x-[var(--progress)]"></div>
</div>